export function localizeField(item, field, lang) {
  const raw = item?.[field]
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw[lang] || raw.ru || raw.en || raw.ka || ''
  }
  return raw || ''
}

const TYPE_I18N_LABELS = {
  'Земельный участок': { ru: 'Земельный участок', en: 'Land plot', ka: 'მიწის ნაკვეთი' },
  Дом: { ru: 'Дом', en: 'House', ka: 'სახლი' },
  'Квартира / студия': { ru: 'Квартира / студия', en: 'Apartment / studio', ka: 'ბინა / სტუდია' },
  Коммерческая: { ru: 'Коммерческая', en: 'Commercial', ka: 'კომერციული' },
}

const normalizeTitleByType = (title, type) => {
  const byType = TYPE_I18N_LABELS[type]
  if (!byType) return title || ''

  if (typeof title === 'string') return { ...byType }
  if (!title || typeof title !== 'object') return { ...byType }

  const ru = String(title.ru || '').trim()
  const en = String(title.en || '').trim()
  const ka = String(title.ka || '').trim()
  const ruMatchesType = ru === byType.ru
  const enLooksRussian = !en || en === ru
  const kaLooksRussian = !ka || ka === ru

  return {
    ru: ru || byType.ru,
    en: ruMatchesType && enLooksRussian ? byType.en : (en || byType.en),
    ka: ruMatchesType && kaLooksRussian ? byType.ka : (ka || byType.ka),
  }
}

export function normalizeProperty(item) {
  const base = item || {}
  const parsedLat = Number(base.mapLat)
  const parsedLng = Number(base.mapLng)
  const hasLatLng = Number.isFinite(parsedLat) && Number.isFinite(parsedLng)
  const normalizedMapPoint =
    (typeof base.mapPoint === 'string' && base.mapPoint.trim()) ||
    (hasLatLng ? `${parsedLat}, ${parsedLng}` : '')
  const normalizedType = base.type || 'Земельный участок'

  return {
    id: base.id || '',
    title: normalizeTitleByType(base.title, normalizedType),
    description: base.description || '',
    city: base.city || '',
    district: base.district || '',
    type: normalizedType,
    landStatus: base.landStatus || 'Все',
    image: base.image || '',
    images: Array.isArray(base.images) && base.images.length ? base.images : base.image ? [base.image] : [],
    price: Number(base.price || 0),
    pricePerSotok: Number(base.pricePerSotok || 0),
    areaSotok: Number(base.areaSotok || 0),
    houseAreaM2: base.houseAreaM2 || null,
    landAreaM2: base.landAreaM2 || null,
    floors: base.floors || null,
    finish: base.finish || '',
    distanceToSeaKm: base.distanceToSeaKm || 0,
    phone: base.phone || '',
    mapPoint: normalizedMapPoint,
    mapLat: hasLatLng ? parsedLat : null,
    mapLng: hasLatLng ? parsedLng : null,
  }
}

export function normalizeProperties(input) {
  if (!Array.isArray(input)) return []
  return input.map(normalizeProperty).filter((x) => x.id)
}
