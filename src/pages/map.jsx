import { useState, useEffect, useRef, useCallback } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
} from '@vis.gl/react-google-maps'

const SCATTER_DEG = 0.013

function randomOffset() {
  return SCATTER_DEG * (Math.random() * 2 - 1)
}

export default function MapPage() {
  const [locations, setLocations] = useState([])
  const [selected, setSelected] = useState(null)
  const [geoError, setGeoError] = useState(null)
  const [loading, setLoading] = useState(true)

  const drawerRef = useRef(null)
  const dragStartY = useRef(null)
  const dragStartHeight = useRef(null)
  const [drawerHeight, setDrawerHeight] = useState(48)
  const SNAP_CLOSED = 48
  const SNAP_OPEN = 450

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocations([
          {
            id: 'current',
            lat: coords.latitude,
            lng: coords.longitude,
            label: 'Your location',
            isCurrent: true,
          },
        ])
        setLoading(false)
      },
      () => {
        setGeoError('Unable to retrieve your location. Please allow location access and refresh.')
        setLoading(false)
      },
    )
  }, [])

  const currentLocation = locations.find((l) => l.isCurrent)

  // drag handlers
  const onDragStart = (clientY) => {
    dragStartY.current = clientY
    dragStartHeight.current = drawerHeight
  }

  const onDragMove = useCallback((clientY) => {
    if (dragStartY.current === null) return
    const delta = dragStartY.current - clientY
    const newHeight = Math.min(Math.max(dragStartHeight.current + delta, SNAP_CLOSED), SNAP_OPEN)
    setDrawerHeight(newHeight)
  }, [drawerHeight])

  const onDragEnd = useCallback(() => {
    dragStartY.current = null
  }, [])

  // mouse events
  const onMouseDown = (e) => {
    e.preventDefault()
    onDragStart(e.clientY)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }
  const onMouseMove = useCallback((e) => onDragMove(e.clientY), [onDragMove])
  const onMouseUp = useCallback(() => {
    onDragEnd()
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }, [onDragEnd])

  // touch events
  const onTouchStart = (e) => {
    onDragStart(e.touches[0].clientY)
  }
  const onTouchMove = (e) => {
    onDragMove(e.touches[0].clientY)
  }
  const onTouchEnd = () => {
    onDragEnd()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-base text-base-content">
        Getting your location…
      </div>
    )
  }

  if (geoError) {
    return (
      <div className="flex h-screen items-center justify-center text-error text-center p-6 max-w-sm mx-auto">
        {geoError}
      </div>
    )
  }

  const isOpen = drawerHeight > SNAP_CLOSED

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 60px)' }}>

      {/* Map */}
      <APIProvider apiKey={import.meta.env.VITE_GOOGLEMAPS_API_KEY}>
        <Map
          mapId="a901048759ddd8f0cd3bfd39"
          defaultCenter={{ lat: currentLocation.lat, lng: currentLocation.lng }}
          defaultZoom={14}
          gestureHandling="greedy"
          style={{ width: '100%', height: '100%' }}
        >
          {locations.map((loc) => (
            <AdvancedMarker
              key={loc.id}
              position={{ lat: loc.lat, lng: loc.lng }}
              onClick={() => setSelected(selected?.id === loc.id ? null : loc)}
              title={loc.label}
            >
              <Pin
                background={loc.isCurrent ? '#66cc8a' : '#f68067'}
                borderColor={loc.isCurrent ? '#4ab070' : '#e55a3d'}
                glyphColor="#fff"
              />
            </AdvancedMarker>
          ))}

          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
              pixelOffset={[0, -40]}
            >
              <div style={{ fontSize: '0.875rem', lineHeight: 1.4, minWidth: '150px' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', color: '#111827' }}>
                  {selected.label}
                </strong>
                <p style={{ color: '#6b7280', fontVariantNumeric: 'tabular-nums', marginBottom: '4px' }}>
                  {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}
                </p>
                {selected.isCurrent && (
                  <em className="text-primary" style={{ display: 'block', fontSize: '0.8rem' }}>
                    📍 This is your current location
                  </em>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute left-0 right-0 bottom-0 bg-base-100 rounded-t-2xl shadow-lg flex flex-col"
        style={{
          height: `${drawerHeight}px`,
          transition: dragStartY.current === null ? 'height 0.3s ease' : 'none',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-base-300 mb-1" />
          <span className="text-xs text-base-content/50">
            {isOpen ? 'Drag to close' : `${locations.length} pin${locations.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Pin list */}
        <ul className="overflow-y-auto flex-1">
          {locations.map((loc) => (
            <li
              key={loc.id}
              onClick={() => setSelected(selected?.id === loc.id ? null : loc)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-base-200 hover:bg-base-200 transition-colors ${selected?.id === loc.id ? 'bg-base-200' : ''}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${loc.isCurrent ? 'bg-primary' : 'bg-accent'}`} />
              <div className="flex flex-col gap-0.5 overflow-hidden">
                <strong className="text-sm truncate">{loc.label}</strong>
                <small className="text-xs text-base-content/50 tabular-nums">
                  {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                </small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}