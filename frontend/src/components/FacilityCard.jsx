import React from 'react';
import { MapPin, Users, CalendarCheck } from 'lucide-react';

export default function FacilityCard({ facility, onBook }) {
  const amenitiesList = facility.amenities 
    ? facility.amenities.split(',').map(a => a.trim()).filter(Boolean)
    : [];

  const getTypeName = (type) => {
    switch (type) {
      case 'AUDITORIUM': return 'Auditorium';
      case 'SEMINAR_HALL': return 'Seminar Hall';
      case 'CONFERENCE_HALL': return 'Conference Hall';
      case 'LABORATORY': return 'Laboratory';
      default: return type || 'Venue';
    }
  };

  const getDefaultImage = (type) => {
    switch (type) {
      case 'AUDITORIUM':
        return 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80';
      case 'SEMINAR_HALL':
        return 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80';
      case 'LABORATORY':
        return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
      case 'CONFERENCE_HALL':
      default:
        return 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80';
    }
  };

  return (
    <div className="facility-card">
      <div className="facility-image-wrapper">
        <img 
          src={facility.imageUrl || getDefaultImage(facility.type)} 
          alt={facility.name} 
          className="facility-image"
          onError={(e) => { e.target.src = getDefaultImage(facility.type); }}
        />
        <div className="facility-badge-type">
          {getTypeName(facility.type)}
        </div>
      </div>

      <div className="facility-card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <h3 className="facility-title">{facility.name}</h3>
          {facility.code && (
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', background: 'var(--color-bg-subtle)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
              {facility.code}
            </span>
          )}
        </div>
        
        <div className="facility-meta">
          <div className="meta-item">
            <MapPin size={15} style={{ color: 'var(--color-primary)' }} />
            <span>{facility.location}</span>
          </div>
          <div className="meta-item">
            <Users size={15} style={{ color: 'var(--color-accent-terracotta)' }} />
            <span>Capacity: {facility.capacity} seats</span>
          </div>
        </div>

        {facility.description && (
          <p className="facility-description">{facility.description}</p>
        )}

        {amenitiesList.length > 0 && (
          <div className="amenities-chips">
            {amenitiesList.slice(0, 4).map((amenity, idx) => (
              <span key={idx} className="amenity-chip">
                {amenity}
              </span>
            ))}
            {amenitiesList.length > 4 && (
              <span className="amenity-chip">+{amenitiesList.length - 4} more</span>
            )}
          </div>
        )}

        <div className="facility-card-footer">
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Available for booking
          </span>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onBook(facility)}
          >
            <CalendarCheck size={15} />
            <span>Book Venue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
