import { useNavigate } from 'react-router-dom'
import { MapPin, Star, ChevronRight } from 'lucide-react'
import {
  getTypeBadgeClass, getStatusBadgeClass,
  getTypeLabel, getTypeIcon, getStatusLabel, renderStars
} from '../../utils/stationUtils'
import './StationCard.css'

export default function StationCard({ station, isSelected, onClick }) {
  const navigate = useNavigate()
  const stars = renderStars(station.average_rating)

  return (
    <div
      className={`station-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick?.(station.id)}
    >
      <div className="station-card-header">
        <div className="station-type-icon">{getTypeIcon(station.station_type)}</div>
        <div className="station-card-info">
          <h3 className="station-name">{station.name}</h3>
          <div className="station-location">
            <MapPin size={12} />
            <span>{station.city}</span>
          </div>
        </div>
        <button
          className="station-card-arrow"
          onClick={(e) => { e.stopPropagation(); navigate(`/stations/${station.id}`) }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="station-card-badges">
        <span className={getTypeBadgeClass(station.station_type)}>
          {getTypeLabel(station.station_type)}
        </span>
        <span className={getStatusBadgeClass(station.status)}>
          {getStatusLabel(station.status)}
        </span>
      </div>

      {stars && (
        <div className="station-rating">
          <div className="stars">
            {stars.map((s, i) => (
              <span key={i} className={`star ${s.filled ? 'filled' : ''}`}>★</span>
            ))}
          </div>
          <span className="rating-text">
            {station.average_rating} ({station.review_count})
          </span>
        </div>
      )}
    </div>
  )
}
