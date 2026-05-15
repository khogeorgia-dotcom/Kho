import { useEffect, useState } from 'react'
import { DISTRICT_VALUES, LAND_STATUS_VALUES, localizeValue, TYPE_VALUES } from '../i18n/messages'

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

export default function Filters({ t, lang, filters, setFilters, sortMode, setSortMode }) {
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
