import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { fetchStation, createReview } from '../api/stations'
import { useAuth } from '../context/AuthContext'
import {
  getTypeBadgeClass, getStatusBadgeClass,
  getTypeLabel, getTypeIcon, getStatusLabel,
  getChargerLabel, renderStars, markerHtml
} from '../utils/stationUtils'
import { ArrowLeft, Star, Phone, MapPin, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import './StationDetailPage.css'

export default function StationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [station,  setStation]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [rating,   setRating]   = useState(0)
  const [hovered,  setHovered]  = useState(0)
  const [comment,  setComment]  = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchStation(id)
      .then(({ data }) => setStation(data))
      .catch(() => toast.error('Station not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleReview = async (e) => {
    e.preventDefault()
    if (!rating) return toast.error('Please select a star rating')
    setSubmitting(true)
    try {
      await createReview({ station: Number(id), rating, comment })
      toast.success('Review submitted!')
      setRating(0); setComment('')
      const { data } = await fetchStation(id)
      setStation(data)
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0] || 'Could not submit review'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="detail-page">
      <div className="loading-center"><div className="spinner" /><span>Loading...</span></div>
    </div>
  )
  if (!station) return (
    <div className="detail-page">
      <div className="loading-center"><p>Station not found</p></div>
    </div>
  )

  const markerIcon = L.divIcon({
    html: markerHtml(station.station_type, station.status),
    className: '', iconSize: [38, 38], iconAnchor: [19, 38],
  })

  const stars = renderStars(station.average_rating)

  return (
    <div className="detail-page">
      <div className="detail-scroll">
        {/* Back */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to Map
        </button>

        {/* Header */}
        <div className="detail-header">
          <div className="detail-icon">{getTypeIcon(station.station_type)}</div>
          <div className="detail-title-group">
            <h1 className="detail-title">{station.name}</h1>
            <div className="detail-location">
              <MapPin size={13} /> {station.address || station.city}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="detail-badges">
          <span className={getTypeBadgeClass(station.station_type)}>
            {getTypeLabel(station.station_type)}
          </span>
          <span className={getStatusBadgeClass(station.status)}>
            {getStatusLabel(station.status)}
          </span>
          {station.station_type === 'ev' && (
            <span className="badge badge-ev"><Zap size={10} />{getChargerLabel(station.charger_type)}</span>
          )}
        </div>

        {/* Rating */}
        {stars && (
          <div className="detail-rating">
            <div className="stars">
              {stars.map((s, i) => <span key={i} className={`star ${s.filled ? 'filled' : ''}`}>★</span>)}
            </div>
            <span>{station.average_rating} · {station.review_count} review{station.review_count !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Description */}
        {station.description && (
          <div className="detail-section">
            <h2>About</h2>
            <p className="detail-desc">{station.description}</p>
          </div>
        )}

        {/* Info grid */}
        <div className="detail-info-grid">
          <div className="info-item"><span className="info-label">City</span><span>{station.city}</span></div>
          {station.phone && <div className="info-item"><span className="info-label">Phone</span><a href={`tel:${station.phone}`} className="info-link"><Phone size={12}/> {station.phone}</a></div>}
          <div className="info-item"><span className="info-label">Added by</span><span>{station.created_by_username || 'Anonymous'}</span></div>
        </div>

        {/* Mini map */}
        <div className="detail-section">
          <h2>Location</h2>
          <div className="mini-map-wrapper">
            <MapContainer
              center={[parseFloat(station.latitude), parseFloat(station.longitude)]}
              zoom={15} style={{ height: '220px', borderRadius: '12px' }}
              zoomControl={false} scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="© OpenStreetMap © CARTO"
              />
              <Marker position={[parseFloat(station.latitude), parseFloat(station.longitude)]} icon={markerIcon} />
            </MapContainer>
          </div>
        </div>

        {/* Reviews */}
        <div className="detail-section">
          <h2>Reviews</h2>
          {station.reviews?.length === 0 && (
            <p className="no-reviews">No reviews yet. Be the first!</p>
          )}
          <div className="reviews-list">
            {station.reviews?.map((r) => (
              <div key={r.id} className="review-item">
                <div className="review-header">
                  <span className="review-user">{r.user_username}</span>
                  <div className="stars">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={`star ${i <= r.rating ? 'filled' : ''}`}>★</span>
                    ))}
                  </div>
                </div>
                {r.comment && <p className="review-comment">{r.comment}</p>}
              </div>
            ))}
          </div>

          {/* Add review form */}
          {user ? (
            <form className="review-form" onSubmit={handleReview}>
              <h3>Leave a Review</h3>
              <div className="star-picker">
                {[1,2,3,4,5].map(i => (
                  <button
                    key={i} type="button"
                    className={`star-pick ${i <= (hovered || rating) ? 'active' : ''}`}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(i)}
                  >★</button>
                ))}
              </div>
              <textarea
                className="input"
                rows={3}
                placeholder="Share your experience (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <p className="sign-in-prompt">
              <a href="/auth">Sign in</a> to leave a review.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
