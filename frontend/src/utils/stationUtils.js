// Utility: get badge class from station_type or status
export function getTypeBadgeClass(type) {
  const map = { ev: 'ev', fuel: 'fuel', garage: 'garage', carwash: 'carwash', service: 'service' }
  return `badge badge-${map[type] || 'ev'}`
}

export function getStatusBadgeClass(status) {
  return `badge badge-${status}`
}

export function getTypeLabel(type) {
  const map = {
    ev: 'EV Charger', fuel: 'Fuel Station', garage: 'Garage',
    carwash: 'Car Wash', service: 'Car Service'
  }
  return map[type] || type
}

export function getTypeIcon(type) {
  const map = { ev: '⚡', fuel: '⛽', garage: '🔧', carwash: '🚿', service: '🚗' }
  return map[type] || '📍'
}

export function getChargerLabel(type) {
  const map = { fast: 'Fast DC', slow: 'Slow AC', unknown: 'Unknown' }
  return map[type] || type
}

export function getStatusLabel(status) {
  const map = { available: 'Available', busy: 'Busy', offline: 'Offline' }
  return map[status] || status
}

export function renderStars(rating) {
  if (!rating) return null
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push({ filled: i <= Math.round(rating) })
  }
  return stars
}

// Build custom Leaflet icon HTML per type
export function markerHtml(type, status) {
  const colors = {
    ev: '#00d4aa', fuel: '#f59e0b', garage: '#8b5cf6',
    carwash: '#3b82f6', service: '#ec4899'
  }
  const icons = { ev: '⚡', fuel: '⛽', garage: '🔧', carwash: '🚿', service: '🚗' }
  const opacity = status === 'offline' ? '0.5' : '1'
  const color = colors[type] || '#00d4aa'
  const icon  = icons[type]  || '📍'

  return `
    <div style="
      width:38px;height:38px;
      background:${color};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 12px rgba(0,0,0,0.4);
      opacity:${opacity};
      border:2px solid rgba(255,255,255,0.2);
    ">
      <span style="transform:rotate(45deg);font-size:16px;line-height:1;">${icon}</span>
    </div>
  `
}

// Generate navigation link (Google Maps)
export function getNavigationUrl(lat, lng, name) {
  const query = encodeURIComponent(`${name} ${lat},${lng}`)
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}
