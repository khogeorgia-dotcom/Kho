import './style.css'

const TYPE_OPTIONS = ['Все', 'Земельный участок', 'Дом', 'Квартира / студия', 'Коммерческая']
const DISTRICT_OPTIONS = ['Все', 'Шуахевский', 'Кедский', 'Кобулетский', 'Хелвачаурский', 'Хулойский']
const LAND_STATUS_OPTIONS = ['Все', 'Сельхоз', 'Не сельхоз']

const app = document.querySelector('#app')

const fmt = (v) => `${new Intl.NumberFormat('ru-RU').format(v)} $`
const fmtNumber = (v) => new Intl.NumberFormat('ru-RU').format(v)
let cleanupPropertySticky = null
let propertiesData = []

const homeTemplate = `
  <header class="site-header">
    <div class="container nav-container header-inner">
      <a class="brand" href="/" aria-label="KHO Georgia"><img src="/images/logo.png" alt="KHO logo" /></a>
      <nav class="nav"><a href="#catalog">КУПИТЬ</a><a href="#sell">ПРОДАТЬ</a><a href="#contacts">КОНТАКТЫ</a></nav>
      <button class="lang-btn" type="button" aria-label="Switch language">◯</button>
    </div>
  </header>

  <section class="hero"><div class="hero-overlay"></div><div class="container hero-inner"><h1>ПОКУПКА И ПРОДАЖА НЕДВИЖИМОСТИ НА АДЖАРСКОМ ПОБЕРЕЖЬЕ<br/>ГРУЗИЯ, БАТУМИ</h1></div></section>

  <section class="filters-wrap" id="catalog"><div class="container"><div class="filters-panel" id="filtersPanel">
    <div class="filter-group custom-group" id="typeGroup">
      <button class="custom-trigger" type="button" data-dd="type" aria-expanded="false">
        <span class="custom-title">Тип недвижимости</span>
        <span class="custom-value" id="typeValue"></span>
        <span class="custom-arrow"></span>
      </button>
      <div class="custom-menu" id="typeMenu"></div>
    </div>
    <div class="filter-group custom-group" id="districtGroup">
      <button class="custom-trigger" type="button" data-dd="district" aria-expanded="false">
        <span class="custom-title">Район</span>
        <span class="custom-value" id="districtValue"></span>
        <span class="custom-arrow"></span>
      </button>
      <div class="custom-menu" id="districtMenu"></div>
    </div>
    <div class="filter-group custom-group status-collapsed" id="landStatusGroup">
      <button class="custom-trigger" type="button" data-dd="status" aria-expanded="false">
        <span class="custom-title">Статус</span>
        <span class="custom-value" id="statusValue"></span>
        <span class="custom-arrow"></span>
      </button>
      <div class="custom-menu" id="statusMenu"></div>
    </div>
    <div class="sort-group"><p>Сортировка по цене</p><div class="sort-actions"><button class="sort-btn active" data-sort="asc">По возрастанию</button><button class="sort-btn" data-sort="desc">По убыванию</button></div></div>
  </div></div></section>

  <section class="catalog"><div class="container"><div class="cards" id="cards"></div></div></section>

  <section class="about-section" id="about"><div class="container about-inner"><div class="about-photo-wrap"><img src="/images/about-person.png" alt="Елена Попова" /></div><div class="about-content"><h2>О нас</h2><p>Главный приоритет нашего дела - благополучие человека.</p><p>Создаем понятные и удобные возможности реализации Ваших целей по приобретению или продаже недвижимости на Аджарском побережье.</p><p>Объявления о собственных объектах или объектах эксклюзивной продажи отмечены цветным логотипом сайта.</p><p>Открыты к партнерским отношениям, с благодарностью - к отзывам, с любовью - к Аджарскому побережью.</p><p>Лучшие пожелания, Елена Попова</p></div></div></section>

  <section class="sell-section" id="sell"><div class="sell-overlay"></div><div class="container sell-inner"><h2>Подайте заявку на продажу</h2><p>Опишите ваш объект и мы разместим его на нашем сайте с указанием ваших контактных данных.</p><button type="button">Подать заявку</button></div></section>

  <footer class="site-footer" id="contacts"><div class="container footer-inner"><img class="footer-logo" src="/images/footer-logo.png" alt="KHO" /><p>KHO 2024</p><a href="tel:+995599124618">+ 995 599 124 618</a><a href="mailto:kho.georgia@gmail.com">kho.georgia@gmail.com</a></div></footer>
`

function propertyTemplate(item) {
  const gallery = item.images?.length ? item.images : [item.image]
  const specRows = []

  if (item.type === 'Земельный участок') {
    specRows.push(['Площадь участка', `${item.areaSotok || '-'} соток`])
    specRows.push(['Статус участка', item.landStatus || '-'])
    specRows.push(['Цена за сотку', item.pricePerSotok ? fmt(item.pricePerSotok) : '-'])
  }

  if (item.type === 'Дом') {
    specRows.push(['Площадь дома', item.houseAreaM2 ? `${fmtNumber(item.houseAreaM2)} кв.м.` : '-'])
    specRows.push(['Количество этажей', item.floors || '-'])
    specRows.push(['Вид отделки', item.finish || 'чистовая'])
    specRows.push(['Площадь участка', item.landAreaM2 ? `${fmtNumber(item.landAreaM2)} кв.м.` : '-'])
  }

  if (item.type === 'Квартира / студия') {
    specRows.push(['Площадь квартиры', item.flatAreaM2 ? `${fmtNumber(item.flatAreaM2)} кв.м.` : '-'])
    specRows.push(['Этаж', item.floor || '-'])
    specRows.push(['Комнат', item.rooms || '-'])
  }

  if (item.type === 'Коммерческая') {
    specRows.push(['Площадь', item.commercialAreaM2 ? `${fmtNumber(item.commercialAreaM2)} кв.м.` : '-'])
    specRows.push(['Назначение', item.purpose || 'коммерческое'])
  }

  specRows.push(['Расстояние до моря', `${item.distanceToSeaKm || '-'} км`])
  specRows.push(['Район', item.district])

  return `
  <header class="site-header property-header">
    <div class="container nav-container header-inner top-nav">
      <a class="brand" href="/" aria-label="KHO Georgia"><img src="/images/logo.png" alt="KHO logo" /></a>
      <nav class="nav"><a href="/">КУПИТЬ</a><a href="/?#sell">ПРОДАТЬ</a><a href="/?#about">О НАС</a></nav>
      <button class="lang-btn" type="button" aria-label="Switch language">◯</button>
    </div>
  </header>
  <section class="top-hero"><div class="top-overlay"></div></section>
  <main class="container property-page">
    <h1 class="property-title">${item.title}</h1>
    <div class="location">📍 г. ${item.city || item.district}</div>
    <section class="property-layout" id="propertyLayout">
      <div>
        <div class="gallery-main"><img id="mainImage" src="${gallery[0]}" alt="${item.title}" /></div>
        <div class="thumbs">${gallery.map((src,i)=>`<button class="thumb ${i===0?'active':''}" data-src="${src}"><img src="${src}"/></button>`).join('')}</div>
        <div class="description">${String(item.description||'').replace(/\n/g,'<br><br>')}</div>
      </div>
      <aside class="side-sticky" id="sideSticky">
        <div class="side-card">
          <h2 class="price">${fmt(item.price)}</h2>
          <button class="phone-btn" id="phoneBtn">Показать номер</button>
          <div class="specs">
            ${specRows.map(([k, v]) => `<div class="spec-row"><span class="spec-key">${k}</span><span class="spec-val">${v}</span></div>`).join('')}
          </div>
        </div>
      </aside>
    </section>
    <section class="property-map"><iframe loading="lazy" src="https://maps.google.com/maps?q=41.723038,41.741675&z=15&output=embed"></iframe></section>
  </main>
  <footer class="site-footer"><div class="container footer-inner"><img class="footer-logo" src="/images/footer-logo.png" alt="KHO" /><p>KHO 2024</p><a href="tel:+995599124618">+ 995 599 124 618</a><a href="mailto:kho.georgia@gmail.com">kho.georgia@gmail.com</a><div class="footer-socials"><a href="https://www.facebook.com/share/f5ytusCqkLTKirtz/?mibextid=qi2Omg" target="_blank" rel="noreferrer">f</a><a href="https://www.instagram.com/lifeisbatumi?igsh=enp6dHFyeGljb2R4" target="_blank" rel="noreferrer">i</a><a href="#" aria-disabled="true">▶</a></div></div></footer>
  `
}

function setupPropertySticky() {
  if (cleanupPropertySticky) cleanupPropertySticky()

  const layout = document.querySelector('#propertyLayout')
  const sticky = document.querySelector('#sideSticky')
  const card = sticky?.querySelector('.side-card')
  const stopEl = document.querySelector('.property-map')
  if (!layout || !sticky || !card || !stopEl) return

  const headerOffset = 106
  const gutter = 18

  const reset = () => {
    sticky.style.position = 'relative'
    sticky.style.top = '0'
    sticky.style.left = '0'
    sticky.style.width = ''
  }

  const update = () => {
    if (window.innerWidth <= 900) {
      reset()
      return
    }

    const layoutRect = layout.getBoundingClientRect()
    const layoutTop = window.scrollY + layoutRect.top
    const layoutLeft = window.scrollX + layoutRect.left
    const layoutWidth = layoutRect.width
    const stickyWidth = sticky.offsetWidth
    const cardHeight = card.offsetHeight
    const stopTop = window.scrollY + stopEl.getBoundingClientRect().top

    const startY = layoutTop - headerOffset
    const endY = stopTop - cardHeight - gutter - headerOffset
    const y = window.scrollY

    if (y <= startY) {
      reset()
      return
    }

    if (y > endY) {
      sticky.style.position = 'absolute'
      sticky.style.top = `${Math.max(0, stopTop - layoutTop - cardHeight - gutter)}px`
      sticky.style.left = `${layoutWidth - stickyWidth}px`
      sticky.style.width = `${stickyWidth}px`
      return
    }

    sticky.style.position = 'fixed'
    sticky.style.top = `${headerOffset}px`
    sticky.style.left = `${layoutLeft + layoutWidth - stickyWidth}px`
    sticky.style.width = `${stickyWidth}px`
  }

  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()

  cleanupPropertySticky = () => {
    window.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
    reset()
  }
}

function getCurrentPropertyId() {
  return new URLSearchParams(window.location.search).get('property')
}

function renderProperty(item) {
    document.body.classList.add('is-property')
    if (cleanupPropertySticky) cleanupPropertySticky()
    app.innerHTML = propertyTemplate(item)
    const mainImage = document.querySelector('#mainImage')
    document.querySelectorAll('.thumb').forEach((t)=>t.addEventListener('click', ()=>{
      document.querySelectorAll('.thumb').forEach((x)=>x.classList.remove('active'))
      t.classList.add('active')
      mainImage.src = t.dataset.src
    }))
    const phoneBtn = document.querySelector('#phoneBtn')
    phoneBtn?.addEventListener('click', ()=>{phoneBtn.textContent = item.phone || '+995 599 124 618'; phoneBtn.disabled=true})
    setupPropertySticky()
}

function renderHome(items) {
  document.body.classList.remove('is-property')
  if (cleanupPropertySticky) cleanupPropertySticky()
  app.innerHTML = homeTemplate
  const cardsEl = document.querySelector('#cards')
  const typeValue = document.querySelector('#typeValue')
  const districtValue = document.querySelector('#districtValue')
  const statusValue = document.querySelector('#statusValue')
  const typeMenu = document.querySelector('#typeMenu')
  const districtMenu = document.querySelector('#districtMenu')
  const statusMenu = document.querySelector('#statusMenu')
  const triggers = document.querySelectorAll('.custom-trigger')
  const groups = document.querySelectorAll('.custom-group')
  const landStatusGroup = document.querySelector('#landStatusGroup')
  const sortButtons = document.querySelectorAll('.sort-btn')
  let sortMode = 'asc'
  let selectedType = 'Все'
  let selectedDistrict = 'Все'
  let selectedStatus = 'Все'

  const closeMenus = () => {
    groups.forEach((g) => g.classList.remove('open'))
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'))
  }

  const renderMenu = (menu, options, selected, onSelect) => {
    menu.innerHTML = options
      .map((opt) => `<button class="custom-option ${opt === selected ? 'active' : ''}" type="button" data-value="${opt}">${opt}</button>`)
      .join('')
    menu.querySelectorAll('.custom-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        onSelect(btn.dataset.value || 'Все')
        closeMenus()
        render()
      })
    })
  }

  const renderDropdowns = () => {
    typeValue.textContent = selectedType
    districtValue.textContent = selectedDistrict
    statusValue.textContent = selectedStatus
    renderMenu(typeMenu, TYPE_OPTIONS, selectedType, (v) => {
      selectedType = v
      if (selectedType !== 'Земельный участок') selectedStatus = 'Все'
    })
    renderMenu(districtMenu, DISTRICT_OPTIONS, selectedDistrict, (v) => {
      selectedDistrict = v
    })
    renderMenu(statusMenu, LAND_STATUS_OPTIONS, selectedStatus, (v) => {
      selectedStatus = v
    })
  }

  const updateLandStatusVisibility = ()=>{
    const show = selectedType === 'Земельный участок'
    landStatusGroup.classList.toggle('status-collapsed', !show)
  }

  const getFiltered = ()=>{
    const t = selectedType
    const d = selectedDistrict
    const l = selectedStatus
    const list = items.filter((x)=>{
      const okT = t==='Все' || x.type===t
      const okD = d==='Все' || x.district===d
      const okL = l==='Все' || x.type!=='Земельный участок' || x.landStatus===l
      return okT && okD && okL
    })
    list.sort((a,b)=>sortMode==='asc'?a.price-b.price:b.price-a.price)
    return list
  }

  const render = ()=>{
    updateLandStatusVisibility()
    renderDropdowns()
    cardsEl.innerHTML = getFiltered().map((item)=>`
      <a class="card card-link" href="/?property=${item.id}">
        <div class="card-image-wrap"><img src="${item.image}" alt="${item.type}" loading="lazy" /></div>
        <h3>${fmt(item.price)}</h3>
        <p>${item.type}</p>
        <small>г. ${item.city || item.district}</small>
      </a>
    `).join('')
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const group = trigger.closest('.custom-group')
      const willOpen = !group.classList.contains('open')
      closeMenus()
      if (willOpen) {
        group.classList.add('open')
        trigger.setAttribute('aria-expanded', 'true')
      }
    })
  })

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.custom-group')) closeMenus()
  })

  sortButtons.forEach((b)=>b.addEventListener('click', ()=>{
    sortButtons.forEach((x)=>x.classList.remove('active'))
    b.classList.add('active')
    sortMode = b.dataset.sort
    render()
  }))

  render()
}

function renderRoute() {
  const propertyId = getCurrentPropertyId()
  if (propertyId) {
    const item = propertiesData.find((x)=>x.id===propertyId)
    if (!item) {
      document.body.classList.add('is-property')
      app.innerHTML = '<div class="container not-found">Объект не найден</div>'
      return
    }
    renderProperty(item)
    return
  }
  renderHome(propertiesData)
}

function applyHashScroll() {
  if (!window.location.hash) {
    window.scrollTo({ top: 0, behavior: 'auto' })
    return
  }
  const target = document.querySelector(window.location.hash)
  if (target) {
    target.scrollIntoView({ behavior: 'auto', block: 'start' })
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
}

function navigate(url) {
  if (url === `${window.location.pathname}${window.location.search}${window.location.hash}`) return
  history.pushState({}, '', url)
  renderRoute()
  applyHashScroll()
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]')
  if (!link) return
  if (link.target === '_blank' || link.hasAttribute('download')) return
  const href = link.getAttribute('href')
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return
  const dest = new URL(href, window.location.origin)
  if (dest.origin !== window.location.origin) return
  event.preventDefault()
  navigate(`${dest.pathname}${dest.search}${dest.hash}`)
})

window.addEventListener('popstate', () => {
  renderRoute()
  applyHashScroll()
})

fetch('/data/properties.json')
  .then((r) => r.json())
  .then((data) => {
    propertiesData = Array.isArray(data) ? data : []
    renderRoute()
    applyHashScroll()
  })
  .catch(() => {
    app.innerHTML = '<div class="container not-found">Ошибка загрузки данных</div>'
  })
