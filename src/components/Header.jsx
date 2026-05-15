import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Header({ t, property = false, lang, onLangChange }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const closeMenu = () => setMenuOpen(false)
  const onHome = location.pathname === '/'
  const linkCatalog = onHome ? '#catalog' : '/#catalog'
  const linkSell = onHome ? '#sell' : '/#sell'
  const linkAbout = onHome ? '#about' : '/#about'

  const goToHomeSection = (id) => (event) => {
    event.preventDefault()
    closeMenu()

    if (location.pathname === '/') {
      window.history.pushState(null, '', `#${id}`)
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' })
      return
    }

    navigate({ pathname: '/', hash: `#${id}` }, { state: { scrollTarget: id } })
  }

  return (
    <header className={`site-header ${property ? 'property-header' : ''}`}>
      <div className={`container nav-container header-inner ${property ? 'top-nav' : ''}`}>
        <Link className="brand" to="/" aria-label="KHO Georgia" onClick={closeMenu}><img src="/images/logo.png" alt="KHO logo" /></Link>
        <nav className={`nav ${menuOpen ? 'is-open' : ''}`}>
          <a href={linkCatalog} onClick={goToHomeSection('catalog')}>{t.nav.buy}</a>
          <a href={linkSell} onClick={goToHomeSection('sell')}>{t.nav.sell}</a>
          <a href={linkAbout} onClick={goToHomeSection('about')}>{t.nav.about}</a>
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
