import React, { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import {
  DISTRICT_VALUES,
  getInitialLang,
  getText,
  LAND_STATUS_VALUES,
  localizeValue,
  LOCALE_BY_LANG,
  nextLang,
  TYPE_VALUES,
} from './i18n/messages'
import { localizeField, normalizeProperties } from './lib/properties'

const parseMapPointInput = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return null

  const parts = raw.split(',').map((x) => x.trim()).filter(Boolean)
  let lat = null
  let lng = null

  if (parts.length === 2) {
    lat = Number(parts[0].replace(',', '.'))
    lng = Number(parts[1].replace(',', '.'))
  } else if (parts.length === 4) {
    lat = Number(`${parts[0]}.${parts[1]}`)
    lng = Number(`${parts[2]}.${parts[3]}`)
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng }
}

const formatMapPoint = ({ lat, lng }) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`

function useProperties() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const sources = [
      '/data/properties/land.json',
      '/data/properties/house.json',
      '/data/properties/apartment.json',
      '/data/properties/commercial.json',
    ]
    Promise.all(sources.map((src) => fetch(src).then((r) => (r.ok ? r.json() : []))))
      .then((parts) => {
        if (!active) return
        setData(normalizeProperties(parts.flat()))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { data, loading }
}

function Header({ t, property = false, lang, onLangChange }) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={`site-header ${property ? 'property-header' : ''}`}>
      <div className={`container nav-container header-inner ${property ? 'top-nav' : ''}`}>
        <a className="brand" href="/" aria-label="KHO Georgia" onClick={closeMenu}><img src="/images/logo.png" alt="KHO logo" /></a>
        <nav className={`nav ${menuOpen ? 'is-open' : ''}`}>
          <a href="/#catalog" onClick={closeMenu}>{t.nav.buy}</a>
          <a href="/#sell" onClick={closeMenu}>{t.nav.sell}</a>
          <a href="/#about" onClick={closeMenu}>{t.nav.about}</a>
        </nav>
        <div className="header-controls">
          <button
            className={`nav-toggle ${menuOpen ? 'is-open' : ''}`}
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <button className="lang-btn" type="button" aria-label="Switch language" onClick={onLangChange}>{lang.toUpperCase()}</button>
        </div>
      </div>
    </header>
  )
}

function Hero({ t }) {
  return (
    <section className="hero">
      <div className="hero-overlay" />
      <div className="container hero-inner">
        <h1>{t.heroTitle.split('\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 ? <br /> : null}</React.Fragment>)}</h1>
      </div>
    </section>
  )
}

function CustomDropdown({ title, options, value, onChange, hidden = false, lang }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const close = () => setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  if (hidden) return <div className="filter-group custom-group status-collapsed" />

  return (
    <div className={`filter-group custom-group ${open ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
      <button className="custom-trigger" type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="custom-title">{title}</span>
        <span className="custom-value">{localizeValue(lang, value)}</span>
        <span className="custom-arrow" aria-hidden="true" />
      </button>
      <div className="custom-menu">
        {options.map((option) => (
          <button
            key={option}
            className={`custom-option ${option === value ? 'active' : ''}`}
            type="button"
            onClick={() => {
              onChange(option)
              setOpen(false)
            }}
          >
            {localizeValue(lang, option)}
          </button>
        ))}
      </div>
    </div>
  )
}

function Filters({ t, lang, filters, setFilters, sortMode, setSortMode }) {
  const showStatus = filters.type === 'Земельный участок'

  return (
    <section className="filters-wrap" id="catalog">
      <div className="container">
        <div className="filters-panel" id="filtersPanel">
          <CustomDropdown title={t.filters.type} options={TYPE_VALUES} value={filters.type} lang={lang} onChange={(type) => setFilters((v) => ({ ...v, type, status: type === 'Земельный участок' ? v.status : 'Все' }))} />
          <CustomDropdown title={t.filters.district} options={DISTRICT_VALUES} value={filters.district} lang={lang} onChange={(district) => setFilters((v) => ({ ...v, district }))} />
          <CustomDropdown title={t.filters.status} options={LAND_STATUS_VALUES} value={filters.status} lang={lang} hidden={!showStatus} onChange={(status) => setFilters((v) => ({ ...v, status }))} />
          <div className="sort-group">
            <p>{t.filters.sort}</p>
            <div className="sort-actions">
              <button className={`sort-btn ${sortMode === 'asc' ? 'active' : ''}`} data-sort="asc" type="button" onClick={() => setSortMode('asc')}>{t.filters.asc}</button>
              <button className={`sort-btn ${sortMode === 'desc' ? 'active' : ''}`} data-sort="desc" type="button" onClick={() => setSortMode('desc')}>{t.filters.desc}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactOverlay({ t, open, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', social: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="contact-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <button className="contact-close" type="button" onClick={onClose} aria-label={t.contactForm.close}>×</button>
        <h3>{t.contactForm.title}</h3>
        <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(true)
            setForm({ name: '', phone: '', social: '' })
          }}
        >
          <input
            type="text"
            placeholder={t.contactForm.name}
            value={form.name}
            onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
            required
          />
          <input
            type="tel"
            placeholder={t.contactForm.phone}
            value={form.phone}
            onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))}
            required
          />
          <input
            type="text"
            placeholder={t.contactForm.social}
            value={form.social}
            onChange={(e) => setForm((v) => ({ ...v, social: e.target.value }))}
          />
          <button type="submit">{t.contactForm.submit}</button>
          {submitted ? <p className="contact-success">{t.contactForm.success}</p> : null}
        </form>
        <div className="contact-icons">
          <a href="tel:+995599124618" aria-label="Phone"><img src="/images/icon-phone.png" alt="" /></a>
          <a href="https://wa.me/995599124618?text=" target="_blank" rel="noreferrer" aria-label="WhatsApp"><img src="/images/icon-whatsapp.png" alt="" /></a>
          <a href="https://t.me/+995599124618" target="_blank" rel="noreferrer" aria-label="Telegram"><img src="/images/icon-telegram.png" alt="" /></a>
          <a href="https://msng.link/o?995599124618=vi" target="_blank" rel="noreferrer" aria-label="Viber"><img src="/images/icon-viber.png" alt="" /></a>
        </div>
      </div>
    </div>
  )
}

function HomePage({ items, lang, setLang }) {
  const t = getText(lang)
  const locale = LOCALE_BY_LANG[lang] || 'ru-RU'
  const fmt = (v) => `${new Intl.NumberFormat(locale).format(v)} $`
  const [filters, setFilters] = useState({ type: 'Все', district: 'Все', status: 'Все' })
  const [sortMode, setSortMode] = useState('asc')
  const [contactOpen, setContactOpen] = useState(false)

  const filtered = useMemo(() => {
    const list = items.filter((x) => {
      const okT = filters.type === 'Все' || x.type === filters.type
      const okD = filters.district === 'Все' || x.district === filters.district
      const okS = filters.status === 'Все' || x.type !== 'Земельный участок' || x.landStatus === filters.status
      return okT && okD && okS
    })
    return list.sort((a, b) => (sortMode === 'asc' ? a.price - b.price : b.price - a.price))
  }, [items, filters, sortMode])

  return (
    <>
      <Header t={t} lang={lang} onLangChange={() => setLang(nextLang(lang))} />
      <Hero t={t} />
      <Filters t={t} lang={lang} filters={filters} setFilters={setFilters} sortMode={sortMode} setSortMode={setSortMode} />
      <section className="catalog"><div className="container"><div className="cards">{filtered.length > 0 ? filtered.map((item) => (
        <a key={item.id} className="card card-link" href={`/property/${item.id}`}>
          <div className="card-image-wrap"><img src={item.image} alt={localizeValue(lang, item.type)} loading="lazy" draggable={false} /></div>
          <h3>{fmt(item.price)}</h3>
          <p>{localizeValue(lang, item.type)}</p>
          <small>{t.common.cityPrefix} {localizeField(item, 'city', lang) || localizeValue(lang, item.district)}</small>
        </a>
      )) : (
        <article className="card card-empty" aria-live="polite">
          <div className="card-image-wrap card-empty-cover" />
          <h3>Скоро появятся новые объекты</h3>
          <p>Мы постоянно добавляем новые предложения недвижимости.</p>
        </article>
      )}</div></div></section>
      <section className="about-section" id="about">
        <div className="container about-inner">
          <div className="about-photo-wrap">
            <img src="/images/about-person.png" alt="Елена Попова" />
          </div>
          <div className="about-content">
            <h2>{t.about.title}</h2>
            <p>{t.about.p1}</p>
            <p>{t.about.p2}</p>
            <p>{t.about.p3}</p>
            <p>{t.about.p4}</p>
            <p>{t.about.p5}</p>
            <div className="about-socials">
              <a href="tel:+995599124618" aria-label="Phone">
                <img src="/images/icon-phone.png" alt="" />
              </a>
              <a href="https://wa.me/995599124618?text=" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <img src="/images/icon-whatsapp.png" alt="" />
              </a>
              <a href="https://t.me/+995599124618" target="_blank" rel="noreferrer" aria-label="Telegram">
                <img src="/images/icon-telegram.png" alt="" />
              </a>
              <a href="https://msng.link/o?995599124618=vi" target="_blank" rel="noreferrer" aria-label="Viber">
                <img src="/images/icon-viber.png" alt="" />
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="sell-section" id="sell"><div className="sell-overlay" /><div className="container sell-inner"><h2>{t.sell.title}</h2><p>{t.sell.text}</p><button type="button" onClick={() => setContactOpen(true)}>{t.sell.cta}</button></div></section>
      <ContactOverlay t={t} open={contactOpen} onClose={() => setContactOpen(false)} />
      <footer className="site-footer" id="contacts"><div className="container footer-inner"><img className="footer-logo" src="/images/footer-logo.png" alt="KHO" /><p>KHO 2024</p><a href="tel:+995599124618">+ 995 599 124 618</a><a href="mailto:kho.georgia@gmail.com">kho.georgia@gmail.com</a></div></footer>
    </>
  )
}

function PropertyPage({ items, lang, setLang }) {
  const { id } = useParams()
  const t = getText(lang)
  const locale = LOCALE_BY_LANG[lang] || 'ru-RU'
  const fmt = (v) => `${new Intl.NumberFormat(locale).format(v)} $`
  const fmtNum = (v) => new Intl.NumberFormat(locale).format(v)

  const item = items.find((x) => x.id === id)
  const [mainImage, setMainImage] = useState('')
  const [showPhone, setShowPhone] = useState(false)
  const [sideMode, setSideMode] = useState('static')
  const [sideStyle, setSideStyle] = useState(undefined)
  const layoutRef = React.useRef(null)
  const leftColRef = React.useRef(null)
  const sideColRef = React.useRef(null)
  const sideCardRef = React.useRef(null)

  useEffect(() => {
    setMainImage(item?.images?.[0] || item?.image || '')
    setShowPhone(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [id, item])

  useEffect(() => {
    document.body.classList.add('is-property')
    return () => document.body.classList.remove('is-property')
  }, [])

  useEffect(() => {
    let rafId = 0
    const updateSideCard = () => {
      const layout = layoutRef.current
      const leftCol = leftColRef.current
      const sideCol = sideColRef.current
      const sideCard = sideCardRef.current
      if (!layout || !leftCol || !sideCol || !sideCard) return

      if (window.innerWidth <= 900) {
        setSideMode('static')
        setSideStyle(undefined)
        sideCol.style.minHeight = ''
        return
      }

      const topOffset = 96
      const layoutTopAbs = window.scrollY + layout.getBoundingClientRect().top
      const leftBottomAbs = window.scrollY + leftCol.getBoundingClientRect().bottom
      const leftHeight = leftCol.offsetHeight
      const cardHeight = sideCard.offsetHeight
      const colRect = sideCol.getBoundingClientRect()
      const maxTopAbs = leftBottomAbs - cardHeight
      const maxTopLocal = Math.max(0, leftHeight - cardHeight)

      sideCol.style.minHeight = `${Math.max(cardHeight, leftBottomAbs - layoutTopAbs)}px`

      if (window.scrollY + topOffset <= layoutTopAbs) {
        setSideMode('static')
        setSideStyle(undefined)
        return
      }

      if (window.scrollY + topOffset >= maxTopAbs) {
        setSideMode('bottom')
        const clampedTop = Math.min(
          maxTopLocal,
          Math.max(0, maxTopAbs - layoutTopAbs)
        )
        setSideStyle({
          position: 'absolute',
          top: `${clampedTop}px`,
          left: '0px',
          width: '100%',
        })
        return
      }

      setSideMode('fixed')
      setSideStyle({
        position: 'fixed',
        top: `${topOffset}px`,
        left: `${colRect.left}px`,
        width: `${colRect.width}px`,
        zIndex: 40,
      })
    }

    const scheduleUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateSideCard)
    }

    updateSideCard()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [id, item])


  if (!item) return <div className="container not-found">{t.property.notFound}</div>
  const parsedPoint = parseMapPointInput(item.mapPoint)
  const mapLat = parsedPoint?.lat ?? (Number.isFinite(Number(item.mapLat)) ? Number(item.mapLat) : 41.723038)
  const mapLng = parsedPoint?.lng ?? (Number.isFinite(Number(item.mapLng)) ? Number(item.mapLng) : 41.741675)
  const mapSrc = `https://maps.google.com/maps?q=${mapLat},${mapLng}&z=15&output=embed`

  const gallery = item.images?.length ? item.images : [item.image]
  const specRows = []
  specRows.push([t.property.district, localizeValue(lang, item.district)])
  specRows.push(['Город', localizeField(item, 'city', lang) || localizeValue(lang, item.district)])
  if (item.type === 'Земельный участок') {
    specRows.push([t.property.areaPlot, `${item.areaSotok || '-'} соток`])
    specRows.push([t.property.statusPlot, localizeValue(lang, item.landStatus || 'Все')])
    specRows.push([t.property.pricePerPlot, item.pricePerSotok ? fmt(item.pricePerSotok) : '-'])
  }
  if (item.type === 'Дом') {
    specRows.push([t.property.houseArea, item.houseAreaM2 ? `${fmtNum(item.houseAreaM2)} кв.м.` : '-'])
    specRows.push([t.property.floors, item.floors || '-'])
    specRows.push([t.property.finish, localizeField(item, 'finish', lang) || '—'])
    specRows.push([t.property.areaPlot, item.landAreaM2 ? `${fmtNum(item.landAreaM2)} кв.м.` : '-'])
  }
  specRows.push([t.property.seaDistance, `${item.distanceToSeaKm || '-'} км`])

  return (
    <>
      <Header t={t} property lang={lang} onLangChange={() => setLang(nextLang(lang))} />
      <main className="container property-page">
        <h1 className="property-title">{localizeField(item, 'title', lang)}</h1>
        <section className="property-layout" ref={layoutRef}>
          <div ref={leftColRef}>
            <div className="gallery-main"><img src={mainImage} alt={localizeField(item, 'title', lang)} /></div>
            <div className="thumbs">{gallery.map((src) => <button key={src} className={`thumb ${src === mainImage ? 'active' : ''}`} onClick={() => setMainImage(src)} type="button"><img src={src} alt="preview" /></button>)}</div>
            <div className="description">{String(localizeField(item, 'description', lang) || '').split('\n').map((line, i) => <React.Fragment key={i}>{line}<br /><br /></React.Fragment>)}</div>
          </div>
          <aside className="side-sticky" ref={sideColRef}>
            <div
              ref={sideCardRef}
              className={`side-card ${sideMode === 'fixed' ? 'is-floating' : ''} ${sideMode === 'bottom' ? 'is-bottom' : ''}`}
              style={sideStyle}
            >
              <h2 className="price">{fmt(item.price)}</h2>
              <button className="phone-btn" type="button" onClick={() => setShowPhone(true)}>{showPhone ? (item.phone || '+995 599 124 618') : t.property.showPhone}</button>
              <div className="specs">{specRows.map(([k, v]) => <div key={k} className="spec-row"><span className="spec-key">{k}</span><span className="spec-val">{v}</span></div>)}</div>
            </div>
          </aside>
        </section>
        <section className="property-map"><iframe loading="lazy" src={mapSrc} /></section>
      </main>
      <footer className="site-footer"><div className="container footer-inner"><img className="footer-logo" src="/images/footer-logo.png" alt="KHO" /><p>KHO 2024</p><a href="tel:+995599124618">+ 995 599 124 618</a><a href="mailto:kho.georgia@gmail.com">kho.georgia@gmail.com</a></div></footer>
    </>
  )
}

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
  Батуми: [
    { ru: 'Батуми', en: 'Batumi', ka: 'ბათუმი' },
  ],
  Батумский: [
    { ru: 'Батуми', en: 'Batumi', ka: 'ბათუმი' },
  ],
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
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#e9edf4'/>
          <stop offset='100%' stop-color='#d7dfea'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Montserrat, Arial, sans-serif' font-size='52' fill='#5f6d84'>Фото пока нет</text>
    </svg>`,
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
    finish: {
      ru: 'Чистовая',
      en: 'Turnkey',
      ka: 'სრული რემონტით',
    },
    description: {
      ru: 'Добавьте описание объекта.',
      en: 'Add property description.',
      ka: 'დაამატეთ ობიექტის აღწერა.',
    },
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
  const [newImageUrl, setNewImageUrl] = useState('')
  const [saveState, setSaveState] = useState('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const selected = useMemo(() => working.find((x) => x.id === selectedId), [working, selectedId])
  const adminTypes = TYPE_VALUES.filter((x) => x !== 'Все')
  const filteredByType = useMemo(() => {
    const prefix = TYPE_TO_PREFIX[selectedType] || 'property'
    return working
      .filter((x) => x.type === selectedType)
      .sort((a, b) => extractIdNumber(b.id, prefix) - extractIdNumber(a.id, prefix))
  }, [working, selectedType])

  useEffect(() => {
    setWorking(JSON.parse(JSON.stringify(items)))
    if (!selectedId && items[0]?.id) setSelectedId(items[0].id)
  }, [items])

  useEffect(() => {
    if (filteredByType.length === 0) return
    const existsInGroup = filteredByType.some((x) => x.id === selectedId)
    if (!existsInGroup) {
      setSelectedId(filteredByType[0].id)
    }
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
    const sources = [
      '/data/properties/land.json',
      '/data/properties/house.json',
      '/data/properties/apartment.json',
      '/data/properties/commercial.json',
    ]
    const parts = await Promise.all(
      sources.map((src) => fetch(`${src}?t=${Date.now()}`).then((r) => (r.ok ? r.json() : []))),
    )
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
    const maxInGroup = working
      .filter((x) => x.type === selectedType)
      .reduce((max, item) => Math.max(max, extractIdNumber(item.id, prefix)), 0)
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
      window.setTimeout(() => {
        saveJson(next)
      }, 0)
      return next
    })
  }

  const addGalleryImage = () => {
    if (!selected || !newImageUrl.trim()) return
    const next = [...(selected.images || []), newImageUrl.trim()]
    updateSelected({ images: next, image: selected.image || next[0] || '' })
    setNewImageUrl('')
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
          <button type="button" onClick={saveJson} disabled={saveState === 'saving'}>
            {saveState === 'saving' ? 'Сохраняю...' : saveState === 'saved' ? 'Сохранено' : saveState === 'error' ? 'Ошибка' : 'Сохранить'}
          </button>
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
              <button
                key={item.id}
                type="button"
                className={`admin-list-item ${item.id === selectedId ? 'active' : ''}`}
                onClick={() => setSelectedId(item.id)}
              >
                <strong>{item.id}</strong>
                <span>{localizeField(item, 'title', lang) || 'Без названия'}</span>
              </button>
            ))}
            <button
              type="button"
              className="admin-list-item admin-list-item-add"
              onClick={addProperty}
              aria-label="Добавить новую карточку"
            >
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
                        <input
                          className="admin-visual-input admin-visual-title-input"
                          value={selected.title?.[lng] || ''}
                          onChange={(e) => updateLocal('title', lng, e.target.value)}
                          placeholder={`Title ${lng.toUpperCase()}`}
                        />
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
                          <button type="button" className="admin-thumb-cover" onClick={() => makeCoverByIndex(idx)}>
                            {selected.image === img ? 'Главная' : 'Сделать главной'}
                          </button>
                        </div>
                      ))}
                      <button type="button" className="admin-visual-thumb-add" onClick={addGalleryImagePrompt}>+</button>
                    </div>
                  </div>

                  <aside className="admin-visual-side">
                    <div className="admin-visual-facts">
                      <div>
                        <span>Район</span>
                        <select
                          className="admin-visual-input"
                          value={selected.district || 'Шуахевский'}
                          onChange={(e) => {
                            const district = e.target.value
                            const firstCity = CITY_BY_DISTRICT[district]?.[0]
                            updateSelected({
                              district,
                              city: firstCity ? { ...firstCity } : selected.city,
                            })
                          }}
                        >
                          {DISTRICT_VALUES.filter((x) => x !== 'Все').map((x) => <option key={x} value={x}>{x}</option>)}
                        </select>
                      </div>
                      <div>
                        <span>Город</span>
                        <select
                          className="admin-visual-input"
                          value={currentCityLabel}
                          onChange={(e) => {
                            const next = cityOptions.find((x) => x.ru === e.target.value)
                            if (!next) return
                            updateSelected({ city: { ...next } })
                          }}
                        >
                          {cityOptions.map((c) => <option key={c.ru} value={c.ru}>{c.ru}</option>)}
                        </select>
                      </div>
                      <div>
                        <span>Телефон</span>
                        <input className="admin-visual-input" value={selected.phone ?? ''} onChange={(e) => updateSelected({ phone: e.target.value })} />
                      </div>
                      <div>
                        <span>Локация (lat,lng)</span>
                        <input
                          className="admin-visual-input"
                          value={selected.mapPoint ?? ''}
                          onChange={(e) => updateSelected({ mapPoint: e.target.value })}
                          onBlur={(e) => {
                            const parsed = parseMapPointInput(e.target.value)
                            if (!parsed) return
                            updateSelected({ mapPoint: formatMapPoint(parsed) })
                          }}
                          placeholder="41.795199, 41.855980"
                        />
                      </div>
                      <div>
                        <span>Площадь участка</span>
                        <input className="admin-visual-input" value={selected.areaSotok ?? ''} type="number" onChange={(e) => updateSelected({ areaSotok: toNumber(e.target.value) })} />
                      </div>
                      {selected.type === 'Земельный участок' ? (
                        <div>
                          <span>Статус участка</span>
                          <select className="admin-visual-input" value={selected.landStatus || 'Все'} onChange={(e) => updateSelected({ landStatus: e.target.value })}>
                            {LAND_STATUS_VALUES.map((x) => <option key={x} value={x}>{x}</option>)}
                          </select>
                        </div>
                      ) : null}
                      <div>
                        <span>Цена за сотку</span>
                        <input className="admin-visual-input" value={selected.pricePerSotok ?? ''} type="number" onChange={(e) => updateSelected({ pricePerSotok: toNumber(e.target.value) })} />
                      </div>
                      <div>
                        <span>Расстояние до моря</span>
                        <input className="admin-visual-input" value={selected.distanceToSeaKm ?? ''} type="number" onChange={(e) => updateSelected({ distanceToSeaKm: toNumber(e.target.value) })} />
                      </div>
                      <div>
                        <span>Цена</span>
                        <div className="admin-visual-price-edit">
                          <input
                            className="admin-visual-input admin-visual-price-input"
                            value={selected.price ?? ''}
                            onChange={(e) => updateSelected({ price: toNumber(e.target.value) })}
                            type="number"
                            placeholder="Цена"
                          />
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

  if (isAuthed) {
    return <AdminPage items={items} lang={lang} />
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <h1>Admin Login</h1>
        <p>Вход только по логину и паролю.</p>
        <form onSubmit={onSubmit} className="admin-login-form">
          <label>
            <span>Логин</span>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              placeholder="Введите логин"
            />
          </label>
          <label>
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Введите пароль"
            />
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

  if (loading) return <div className="app-shell" />

  return (
    <Routes>
      <Route path="/" element={<HomePage items={data} lang={lang} setLang={setLang} />} />
      <Route path="/property/:id" element={<PropertyPage items={data} lang={lang} setLang={setLang} />} />
      <Route path="/admin" element={<AdminGuard items={data} lang={lang} />} />
      <Route path="*" element={<LegacyRedirect />} />
    </Routes>
  )
}
