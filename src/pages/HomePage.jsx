import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Filters from '../components/Filters'
import ContactOverlay from '../components/ContactOverlay'
import { getText, LOCALE_BY_LANG, localizeValue, nextLang } from '../i18n/messages'
import { localizeField } from '../lib/properties'
import '../styles/home.css'

export default function HomePage({ items, lang, setLang }) {
  const location = useLocation()
  const t = getText(lang)
  const locale = LOCALE_BY_LANG[lang] || 'ru-RU'
  const fmt = (v) => `${new Intl.NumberFormat(locale).format(v)} $`
  const [filters, setFilters] = useState({ type: 'Все', district: 'Все', status: 'Все' })
  const [sortMode, setSortMode] = useState('asc')
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    // Prewarm all catalog images once so scrolling back does not show visible reloading.
    const urls = Array.from(new Set(items.map((x) => x?.image).filter(Boolean)))
    urls.forEach((src) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = src
    })
  }, [items])

  useLayoutEffect(() => {
    const id = location.state?.scrollTarget || location.hash.replace('#', '')
    if (!id) return
    document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }, [location.hash, location.state])

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
      <section className="catalog"><div className="container"><div className="cards">{filtered.length > 0 ? filtered.map((item, index) => (
        <Link key={item.id} className="card card-link" to={`/property/${item.id}`}>
          <div className="card-image-wrap"><div className="card-image-inner"><img src={item.image} alt={localizeValue(lang, item.type)} loading="eager" fetchPriority={index < 6 ? 'high' : 'auto'} decoding="async" draggable={false} /></div></div>
          <h3>{fmt(item.price)}</h3>
          <p>{localizeValue(lang, item.type)}</p>
          <small>{t.common.cityPrefix} {localizeField(item, 'city', lang) || localizeValue(lang, item.district)}</small>
        </Link>
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
      <ContactOverlay t={t} open={contactOpen} onClose={() => setContactOpen(false)} lang={lang} />
      <footer className="site-footer" id="contacts"><div className="container footer-inner"><img className="footer-logo" src="/images/footer-logo.png" alt="KHO" /><p>KHO 2026</p><a href="tel:+995599124618">+ 995 599 124 618</a><a href="mailto:kho.georgia@gmail.com">kho.georgia@gmail.com</a></div></footer>
    </>
  )
}
