export const parseMapPointInput = (value) => {
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

export const formatMapPoint = ({ lat, lng }) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`
