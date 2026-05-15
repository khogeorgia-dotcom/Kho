import { Fragment, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/Header'
import { getText, LOCALE_BY_LANG, localizeValue, nextLang } from '../i18n/messages'
import { localizeField } from '../lib/properties'
import { parseMapPointInput } from '../utils/mapPoint'
import '../styles/property.css'

export default function PropertyPage({ items, lang, setLang }) {
  const { id } = useParams()
  const t = getText(lang)
  const locale = LOCALE_BY_LANG[lang] || 'ru-RU'
  const fmt = (v) => `${new Intl.NumberFormat(locale).format(v)} $`
  const fmtNum = (v) => new Intl.NumberFormat(locale).format(v)

  const item = items.find((x) => x.id === id)
  const [mainImage, setMainImage] = useState('')
  const [showPhone, setShowPhone] = useState(false)

  useEffect(() => {
    const first = item?.images?.find(Boolean) || item?.image || fallbackImage
    setMainImage(first)
    setShowPhone(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [id, item])

  useEffect(() => {
    document.body.classList.add('is-property')
    return () => document.body.classList.remove('is-property')
  }, [])

  if (!item) return <div className="container not-found">{t.property.notFound}</div>

  const parsedPoint = parseMapPointInput(item.mapPoint)
  const mapLat = parsedPoint?.lat ?? (Number.isFinite(Number(item.mapLat)) ? Number(item.mapLat) : 41.723038)
  const mapLng = parsedPoint?.lng ?? (Number.isFinite(Number(item.mapLng)) ? Number(item.mapLng) : 41.741675)
  const mapSrc = `https://maps.google.com/maps?q=${mapLat},${mapLng}&z=15&output=embed`

  const gallery = (item.images?.filter(Boolean)?.length ? item.images.filter(Boolean) : [item.image]).filter(Boolean)
  const safeGallery = gallery.length ? gallery : [fallbackImage]
  const safeMainImage = mainImage || safeGallery[0] || fallbackImage
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
        <section className="property-layout">
          <div className="property-main">
            <div className="gallery-main"><img src={safeMainImage} alt={localizeField(item, 'title', lang)} /></div>
            <div className="thumbs">{safeGallery.map((src, idx) => <button key={`${src}-${idx}`} className={`thumb ${src === safeMainImage ? 'active' : ''}`} onClick={() => setMainImage(src)} type="button"><img src={src} alt="preview" /></button>)}</div>
            <div className="description">
              {String(localizeField(item, 'description', lang) || '')
                .split('\n')
                .map((line, i) => (
                  <Fragment key={`line-${i}`}>
                    <span>{line}</span>
                    <br />
                    <br />
                  </Fragment>
                ))}
            </div>
          </div>
          <aside className="side-sticky">
            <div className="side-card">
              <h2 className="price">{fmt(item.price)}</h2>
              <button className="phone-btn" type="button" onClick={() => setShowPhone(true)}>{showPhone ? (item.phone || '+995 599 124 618') : t.property.showPhone}</button>
              <div className="specs">{specRows.map(([k, v]) => <div key={k} className="spec-row"><span className="spec-key">{k}</span><span className="spec-val">{v}</span></div>)}</div>
            </div>
          </aside>
        </section>
        <section className="property-map"><iframe loading="lazy" src={mapSrc} /></section>
      </main>
      <footer className="site-footer"><div className="container footer-inner"><img className="footer-logo" src="/images/footer-logo.png" alt="KHO" /><p>KHO 2026</p><a href="tel:+995599124618">+ 995 599 124 618</a><a href="mailto:kho.georgia@gmail.com">kho.georgia@gmail.com</a></div></footer>
    </>
  )
}
  const fallbackImage = '/images/property-placeholder.svg'
