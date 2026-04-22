import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { markerHtml, getNavigationUrl } from '../../utils/stationUtils'
import './MapView.css'

// Ethiopia center
const DEFAULT_CENTER = [9.145, 40.489]
const DEFAULT_ZOOM   = 7

export default function MapView({ stations, selectedId, onLocationFound }) {
  const mapRef       = useRef(null)
  const mapInstance  = useRef(null)
  const markersRef   = useRef({})
  const userMarker   = useRef(null)
  const navigate     = useNavigate()

  // Init map once
  useEffect(() => {
    if (mapInstance.current) return

    mapInstance.current = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    })

    // Satellite View
    const satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
      }
    )

    // White (Voyager) View
    const whiteMap = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '© OpenStreetMap © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    )

    // Add satellite as default
    satellite.addTo(mapInstance.current)

    // Layer control
    const baseMaps = {
      "Satellite View": satellite,
      "White Map": whiteMap
    }
    L.control.layers(baseMaps).addTo(mapInstance.current)

    return () => {
      mapInstance.current?.remove()
      mapInstance.current = null
    }
  }, [])

  // Sync stations → markers
  useEffect(() => {
    if (!mapInstance.current) return
    const map = mapInstance.current

    // Remove old markers not in new set
    const newIds = new Set(stations.map((s) => s.id))
    Object.keys(markersRef.current).forEach((id) => {
      if (!newIds.has(Number(id))) {
        markersRef.current[id].remove()
        delete markersRef.current[id]
      }
    })

    // Add / update markers
    stations.forEach((station) => {
      if (markersRef.current[station.id]) return

      const icon = L.divIcon({
        html: markerHtml(station.station_type, station.status),
        className: '',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -40],
      })

      const marker = L.marker([parseFloat(station.latitude), parseFloat(station.longitude)], { icon })

      const isLimited = !station.phone && station.description?.includes('Limited data available')
      marker.bindPopup(`
        <div class="map-popup">
          <div class="popup-title">${station.name}</div>
          <div class="popup-meta">
            <span class="popup-city">${station.city}</span>
            <span class="popup-status popup-status--${station.status}">${station.status}</span>
            ${isLimited ? '<span class="popup-limited">⚠ Limited data</span>' : ''}
          </div>
          ${station.phone ? `<div class="popup-phone">📞 ${station.phone}</div>` : ''}
          <div class="popup-actions">
            <button class="popup-btn" onclick="window.__navigateTo('/stations/${station.id}')">
              View Details →
            </button>
            <a class="popup-btn popup-btn--nav" href="${getNavigationUrl(station.latitude, station.longitude, station.name)}" target="_blank" rel="noopener noreferrer">
              Navigate ↗
            </a>
          </div>
        </div>
      `)

      marker.addTo(map)
      markersRef.current[station.id] = marker
    })
  }, [stations])

  // Pan/zoom to selected station
  useEffect(() => {
    if (!selectedId || !mapInstance.current) return
    const station = stations.find((s) => s.id === selectedId)
    if (!station) return
    mapInstance.current.flyTo(
      [parseFloat(station.latitude), parseFloat(station.longitude)],
      14,
      { duration: 1 }
    )
    markersRef.current[selectedId]?.openPopup()
  }, [selectedId, stations])

  // Expose navigate to window for popup button
  useEffect(() => {
    window.__navigateTo = navigate
    return () => { delete window.__navigateTo }
  }, [navigate])

  // "Near me" handler
  const handleLocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords
        if (userMarker.current) userMarker.current.remove()

        userMarker.current = L.circleMarker([latitude, longitude], {
          radius: 10,
          color: '#00d4aa',
          fillColor: '#00d4aa',
          fillOpacity: 0.8,
          weight: 3,
        })
          .addTo(mapInstance.current)
          .bindPopup('📍 You are here')
          .openPopup()

        mapInstance.current.flyTo([latitude, longitude], 13, { duration: 1.5 })
        onLocationFound?.({ latitude, longitude })
      },
      () => alert('Could not get your location.')
    )
  }

  return (
    <div className="map-wrapper">
      <div ref={mapRef} className="map-container" />
      <button className="locate-btn" onClick={handleLocate} title="Find stations near me">
        📍 Near Me
      </button>
    </div>
  )
}
