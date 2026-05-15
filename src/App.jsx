import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { getInitialLang } from './i18n/messages'
import { normalizeProperties } from './lib/properties'
import { useProperties } from './hooks/useProperties'
import { formatMapPoint, parseMapPointInput } from './utils/mapPoint'
import HomePage from './pages/HomePage'
import PropertyPage from './pages/PropertyPage'
import { DISTRICT_VALUES, LAND_STATUS_VALUES, TYPE_VALUES } from './i18n/messages'
import { localizeField } from './lib/properties'

function AdminField({ label, value, onChange, multiline = false, type = 'text' }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={4} />
      ) : (
        <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

const TYPE_I18N_LABELS = {
  'Земельный участок': { ru: 'Земельный участок', en: 'Land plot', ka: 'მიწის ნაკვეთი' },
  Дом: { ru: 'Дом', en: 'House', ka: 'სახლი' },
  'Квартира / студия': { ru: 'Квартира / студия', en: 'Apartment / studio', ka: 'ბინა / სტუდია' },
  Коммерческая: { ru: 'Коммерческая', en: 'Commercial', ka: 'კომერციული' },
}

const CITY_BY_DISTRICT = {
  Батуми: [{ ru: 'Батуми', en: 'Batumi', ka: 'ბათუმი' }],
  Батумский: [{ ru: 'Батуми', en: 'Batumi', ka: 'ბათუმი' }],
  Шуахевский: [
    { ru: 'Шуахеви', en: 'Shuakhevi', ka: 'შუახევი' },
    { ru: 'Даблити', en: 'Dabliti', ka: 'დაბლითი' },
    { ru: 'Цаблана', en: 'Tsablana', ka: 'ცაბლანა' },
  ],
  Кедский: [
    { ru: 'Кеда', en: 'Keda', ka: 'ქედა' },
    { ru: 'Зундага', en: 'Zundaga', ka: 'ზუნდაგა' },
    { ru: 'Октомбер', en: 'Oktomber', ka: 'ოქტომბერი' },
  ],
  Кобулетский: [
    { ru: 'Кобулети', en: 'Kobuleti', ka: 'ქობულეთი' },
    { ru: 'Чакви', en: 'Chakvi', ka: 'ჩაქვი' },
    { ru: 'Цихисдзири', en: 'Tsikhisdziri', ka: 'ციხისძირი' },
    { ru: 'Очхамури', en: 'Ochhamuri', ka: 'ოჩხამური' },
  ],
  Хелвачаурский: [
    { ru: 'Хелвачаури', en: 'Khelvachauri', ka: 'ხელვაჩაური' },
    { ru: 'Махинджаури', en: 'Makhinjauri', ka: 'მახინჯაური' },
    { ru: 'Квариати', en: 'Kvariati', ka: 'კვარიათი' },
    { ru: 'Гонио', en: 'Gonio', ka: 'გონიო' },
  ],
  Хулойский: [
    { ru: 'Хуло', en: 'Khulo', ka: 'ხულო' },
    { ru: 'Диаконидзееби', en: 'Diakonidzeebi', ka: 'დიაკონიძეები' },
    { ru: 'Ваке', en: 'Vake', ka: 'ვაკე' },
  ],
}

function createEmptyProperty(nextId = 'new-property', selectedType = 'Земельный участок') {
  const placeholderSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#e9edf4'/><stop offset='100%' stop-color='#d7dfea'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Montserrat, Arial, sans-serif' font-size='52' fill='#5f6d84'>Фото пока нет</text></svg>`,
  )
  const placeholderImage = `data:image/svg+xml;charset=UTF-8,${placeholderSvg}`
  const localizedType = TYPE_I18N_LABELS[selectedType] || TYPE_I18N_LABELS['Земельный участок']
  const defaultDistrict = 'Кобулетский'
  const defaultCity = CITY_BY_DISTRICT[defaultDistrict]?.[0] || { ru: 'Чакви', en: 'Chakvi', ka: 'ჩაქვი' }
  return {
    id: nextId,
    type: selectedType,
    district: defaultDistrict,
    landStatus: 'Все',
    price: 100000,
    pricePerSotok: 2500,
    areaSotok: 40,
    distanceToSeaKm: 5,
    houseAreaM2: 120,
    floors: 1,
    landAreaM2: 600,
    mapPoint: '41.723038, 41.741675',
    phone: '+995 599 124 618',
    image: placeholderImage,
    images: [placeholderImage],
    title: localizedType,
    city: defaultCity,
    finish: { ru: 'Чистовая', en: 'Turnkey', ka: 'სრული რემონტით' },
    description: { ru: 'Добавьте описание объекта.', en: 'Add property description.', ka: 'დაამატეთ ობიექტის აღწერა.' },
  }
}

const TYPE_TO_PREFIX = {
  'Земельный участок': 'land',
  Дом: 'house',
  'Квартира / студия': 'apartment',
  Коммерческая: 'commercial',
}

const extractIdNumber = (id, prefix) => {
  const normalized = String(id || '').trim().toLowerCase()
  const pattern = new RegExp(`^${prefix}-(\\d+)$`)
  const match = normalized.match(pattern)
  if (!match) return 0
  const parsed = Number(match[1])
  return Number.isFinite(parsed) ? parsed : 0
}

function AdminPage({ items, lang }) {
  const [working, setWorking] = useState(() => JSON.parse(JSON.stringify(items)))
  const [selectedId, setSelectedId] = useState(items[0]?.id || '')
  const [selectedType, setSelectedType] = useState('Земельный участок')
  const [saveState, setSaveState] = useState('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const selected = useMemo(() => working.find((x) => x.id === selectedId), [working, selectedId])
  const adminTypes = TYPE_VALUES.filter((x) => x !== 'Все')
  const filteredByType = useMemo(() => {
    const prefix = TYPE_TO_PREFIX[selectedType] || 'property'
    return working.filter((x) => x.type === selectedType).sort((a, b) => extractIdNumber(b.id, prefix) - extractIdNumber(a.id, prefix))
  }, [working, selectedType])

  useEffect(() => {
    setWorking(JSON.parse(JSON.stringify(items)))
    if (!selectedId && items[0]?.id) setSelectedId(items[0].id)
  }, [items, selectedId])

  useEffect(() => {
    if (filteredByType.length === 0) return
    const existsInGroup = filteredByType.some((x) => x.id === selectedId)
    if (!existsInGroup) setSelectedId(filteredByType[0].id)
  }, [filteredByType, selectedId])

  const updateSelected = (patch) => {
    setWorking((prev) => prev.map((item) => (item.id === selectedId ? { ...item, ...patch } : item)))
  }

  const updateLocal = (field, locale, value) => {
    if (!selected) return
    const current = selected[field] && typeof selected[field] === 'object' ? selected[field] : { ru: '', en: '', ka: '' }
    updateSelected({ [field]: { ...current, [locale]: value } })
  }

  const toNumber = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const reloadFromTypedFiles = async () => {
    const sources = ['/data/properties/land.json', '/data/properties/house.json', '/data/properties/apartment.json', '/data/properties/commercial.json']
    const parts = await Promise.all(sources.map((src) => fetch(`${src}?t=${Date.now()}`).then((r) => (r.ok ? r.json() : []))))
    return normalizeProperties(parts.flat())
  }

  const saveJson = async (nextItems = null) => {
    try {
      setSaveState('saving')
      setSaveMessage('')
      const payloadItems = Array.isArray(nextItems) ? nextItems : working
      const response = await fetch('/api/admin/save-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.error || 'Save request failed')
      const reloaded = await reloadFromTypedFiles()
      setWorking(reloaded)
      setSaveState('saved')
      setSaveMessage('Сохранено в public/data/properties/*.json')
      window.setTimeout(() => setSaveState('idle'), 1600)
    } catch (err) {
      setSaveState('error')
      setSaveMessage(`Ошибка сохранения: ${err instanceof Error ? err.message : 'неизвестная ошибка'}`)
      window.setTimeout(() => setSaveState('idle'), 2200)
    }
  }

  const addProperty = () => {
    const prefix = TYPE_TO_PREFIX[selectedType] || 'property'
    const maxInGroup = working.filter((x) => x.type === selectedType).reduce((max, item) => Math.max(max, extractIdNumber(item.id, prefix)), 0)
    const nextNumber = maxInGroup + 1
    const candidate = `${prefix}-${String(nextNumber).padStart(3, '0')}`
    const created = createEmptyProperty(candidate, selectedType)
    setWorking((prev) => [created, ...prev])
    setSelectedId(candidate)
  }

  const deleteProperty = () => {
    if (!selectedId) return
    const ok = window.confirm(`Удалить карточку "${selectedId}"?`)
    if (!ok) return
    setWorking((prev) => {
      const next = prev.filter((x) => x.id !== selectedId)
      setSelectedId(next[0]?.id || '')
      window.setTimeout(() => { saveJson(next) }, 0)
      return next
    })
  }

  const removeGalleryImage = (idx) => {
    if (!selected) return
    const next = (selected.images || []).filter((_, i) => i !== idx)
    const nextCover = selected.image === selected.images?.[idx] ? (next[0] || '') : selected.image
    updateSelected({ images: next, image: nextCover })
  }

  const makeCoverByIndex = (idx) => {
    if (!selected) return
    const current = selected.images || []
    if (!current[idx]) return
    updateSelected({ image: current[idx] })
  }

  const addGalleryImagePrompt = () => {
    const url = window.prompt('URL нового фото')
    if (!url || !url.trim()) return
    const next = [...(selected?.images || []), url.trim()]
    updateSelected({ images: next, image: selected?.image || next[0] || '' })
  }

  const previewTitle = selected ? (localizeField(selected, 'title', lang) || selected.id) : ''
  const galleryImages = selected?.images?.length ? selected.images : (selected?.image ? [selected.image] : ['/images/card-1.jpg'])
  const cityOptions = selected ? (CITY_BY_DISTRICT[selected.district] || []) : []
  const currentCityLabel = selected ? (selected.city?.ru || cityOptions[0]?.ru || '') : ''

  return (
    <main className="container admin-modern">
      <div className="admin-modern-head">
        <h1>Admin Panel</h1>
        <div className="admin-modern-actions">
          <button type="button" className="danger" onClick={deleteProperty}>Удалить</button>
          <button type="button" onClick={saveJson} disabled={saveState === 'saving'}>{saveState === 'saving' ? 'Сохраняю...' : saveState === 'saved' ? 'Сохранено' : saveState === 'error' ? 'Ошибка' : 'Сохранить'}</button>
        </div>
      </div>
      {saveMessage ? <p className="admin-save-message">{saveMessage}</p> : null}

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <label className="admin-field">
            <span>Тип объявлений</span>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              {adminTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <div className="admin-list">
            {filteredByType.map((item) => (
              <button key={item.id} type="button" className={`admin-list-item ${item.id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(item.id)}>
                <strong>{item.id}</strong>
                <span>{localizeField(item, 'title', lang) || 'Без названия'}</span>
              </button>
            ))}
            <button type="button" className="admin-list-item admin-list-item-add" onClick={addProperty} aria-label="Добавить новую карточку">
              <strong>+</strong>
              <span>Добавить карточку</span>
            </button>
          </div>
        </aside>

        <section className="admin-editor">
          {!selected ? (
            <div className="admin-empty">
              <h3>Нет карточек в этом типе</h3>
              <p>Нажми на + в списке слева, чтобы добавить новую карточку.</p>
              <button type="button" onClick={addProperty}>+ Добавить карточку</button>
            </div>
          ) : (
            <>
              <div className="admin-visual">
                <div className="admin-visual-head">
                  <div className="admin-visual-i18n-grid">
                    {['ru', 'en', 'ka'].map((lng) => (
                      <div key={lng} className="admin-visual-i18n-col">
                        <strong>{lng.toUpperCase()}</strong>
                        <input className="admin-visual-input admin-visual-title-input" value={selected.title?.[lng] || ''} onChange={(e) => updateLocal('title', lng, e.target.value)} placeholder={`Title ${lng.toUpperCase()}`} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="admin-visual-main">
                  <div className="admin-visual-gallery">
                    <img src={selected.image || galleryImages[0]} alt={previewTitle} className="admin-visual-cover" />
                    <div className="admin-visual-thumbs">
                      {galleryImages.slice(0, 6).map((img, idx) => (
                        <div key={`${img}-${idx}`} className="admin-visual-thumb-item">
                          <img src={img} alt={`thumb-${idx}`} />
                          <button type="button" className="admin-thumb-remove" onClick={() => removeGalleryImage(idx)}>×</button>
                          <button type="button" className="admin-thumb-cover" onClick={() => makeCoverByIndex(idx)}>{selected.image === img ? 'Главная' : 'Сделать главной'}</button>
                        </div>
                      ))}
                      <button type="button" className="admin-visual-thumb-add" onClick={addGalleryImagePrompt}>+</button>
                    </div>
                  </div>

                  <aside className="admin-visual-side">
                    <div className="admin-visual-facts">
                      <div>
                        <span>Район</span>
                        <select className="admin-visual-input" value={selected.district || 'Шуахевский'} onChange={(e) => {
                          const district = e.target.value
                          const firstCity = CITY_BY_DISTRICT[district]?.[0]
                          updateSelected({ district, city: firstCity ? { ...firstCity } : selected.city })
                        }}>
                          {DISTRICT_VALUES.filter((x) => x !== 'Все').map((x) => <option key={x} value={x}>{x}</option>)}
                        </select>
                      </div>
                      <div>
                        <span>Город</span>
                        <select className="admin-visual-input" value={currentCityLabel} onChange={(e) => {
                          const next = cityOptions.find((x) => x.ru === e.target.value)
                          if (!next) return
                          updateSelected({ city: { ...next } })
                        }}>
                          {cityOptions.map((c) => <option key={c.ru} value={c.ru}>{c.ru}</option>)}
                        </select>
                      </div>
                      <div><span>Телефон</span><input className="admin-visual-input" value={selected.phone ?? ''} onChange={(e) => updateSelected({ phone: e.target.value })} /></div>
                      <div>
                        <span>Локация (lat,lng)</span>
                        <input className="admin-visual-input" value={selected.mapPoint ?? ''} onChange={(e) => updateSelected({ mapPoint: e.target.value })} onBlur={(e) => {
                          const parsed = parseMapPointInput(e.target.value)
                          if (!parsed) return
                          updateSelected({ mapPoint: formatMapPoint(parsed) })
                        }} placeholder="41.795199, 41.855980" />
                      </div>
                      <div><span>Площадь участка</span><input className="admin-visual-input" value={selected.areaSotok ?? ''} type="number" onChange={(e) => updateSelected({ areaSotok: toNumber(e.target.value) })} /></div>
                      {selected.type === 'Земельный участок' ? (
                        <div>
                          <span>Статус участка</span>
                          <select className="admin-visual-input" value={selected.landStatus || 'Все'} onChange={(e) => updateSelected({ landStatus: e.target.value })}>
                            {LAND_STATUS_VALUES.map((x) => <option key={x} value={x}>{x}</option>)}
                          </select>
                        </div>
                      ) : null}
                      <div><span>Цена за сотку</span><input className="admin-visual-input" value={selected.pricePerSotok ?? ''} type="number" onChange={(e) => updateSelected({ pricePerSotok: toNumber(e.target.value) })} /></div>
                      <div><span>Расстояние до моря</span><input className="admin-visual-input" value={selected.distanceToSeaKm ?? ''} type="number" onChange={(e) => updateSelected({ distanceToSeaKm: toNumber(e.target.value) })} /></div>
                      <div>
                        <span>Цена</span>
                        <div className="admin-visual-price-edit">
                          <input className="admin-visual-input admin-visual-price-input" value={selected.price ?? ''} onChange={(e) => updateSelected({ price: toNumber(e.target.value) })} type="number" placeholder="Цена" />
                          <span>$</span>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>

              <div className="admin-grid">
                <AdminField label="ID" value={selected.id} onChange={(v) => updateSelected({ id: v })} />
              </div>

              <div className="admin-grid admin-grid-3">
                <AdminField label="Description RU" value={selected.description?.ru || ''} onChange={(v) => updateLocal('description', 'ru', v)} multiline />
                <AdminField label="Description EN" value={selected.description?.en || ''} onChange={(v) => updateLocal('description', 'en', v)} multiline />
                <AdminField label="Description KA" value={selected.description?.ka || ''} onChange={(v) => updateLocal('description', 'ka', v)} multiline />
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

function LegacyRedirect() {
  const location = useLocation()
  const search = new URLSearchParams(location.search)
  const id = search.get('property')
  return id ? <Navigate to={`/property/${id}`} replace /> : <Navigate to="/" replace />
}

const ADMIN_LOGIN = 'admin'
const ADMIN_PASSWORD = 'willow'
const ADMIN_AUTH_KEY = 'kho_admin_auth'

function AdminGuard({ items, lang }) {
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem(ADMIN_AUTH_KEY) === '1')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    if (login.trim() === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_AUTH_KEY, '1')
      setIsAuthed(true)
      setError('')
      return
    }
    setError('Неверный логин или пароль')
  }

  if (isAuthed) return <AdminPage items={items} lang={lang} />

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <h1>Admin Login</h1>
        <p>Вход только по логину и паролю.</p>
        <form onSubmit={onSubmit} className="admin-login-form">
          <label>
            <span>Логин</span>
            <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" placeholder="Введите логин" />
          </label>
          <label>
            <span>Пароль</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Введите пароль" />
          </label>
          {error ? <div className="admin-login-error">{error}</div> : null}
          <button type="submit">Войти</button>
        </form>
      </div>
    </main>
  )
}

export default function App() {
  const { data, loading } = useProperties()
  const [lang, setLang] = useState(getInitialLang)

  useEffect(() => {
    localStorage.setItem('kho_lang', lang)
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  useEffect(() => {
    if (loading) return

    const path = window.location.pathname || '/'
    const urls = new Set(['/images/hero.jpg'])

    if (path.startsWith('/property/')) {
      const routeId = path.split('/').pop()
      const property = data.find((item) => item.id === routeId)
      if (property?.image) urls.add(property.image)
      ;(property?.images || property?.gallery || []).slice(0, 1).forEach((src) => src && urls.add(src))
    } else {
      data.slice(0, 4).forEach((item) => item?.image && urls.add(item.image))
    }

    // Fire-and-forget prewarm, without blocking first paint.
    urls.forEach((src) => {
      if (!src) return
      const img = new Image()
      img.src = src
    })
  }, [loading, data])

  if (loading) return null

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage items={data} lang={lang} setLang={setLang} />} />
        <Route path="/property/:id" element={<PropertyPage items={data} lang={lang} setLang={setLang} />} />
        <Route path="/admin" element={<AdminGuard items={data} lang={lang} />} />
        <Route path="*" element={<LegacyRedirect />} />
      </Routes>
    </>
  )
}
