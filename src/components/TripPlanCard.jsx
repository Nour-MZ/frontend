import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const formatTime = (iso) => {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

const formatDate = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

const collectImages = (hotel) => {
  const imgs = []
  const seen = new Set()
  const pushImg = (img) => {
    if (!img) return
    const raw = img.path || img.url || img.image
    const src = raw ? `https://photos.hotelbeds.com/giata/bigger/${raw}` : ''
    if (src && !seen.has(src)) {
      seen.add(src)
      imgs.push(src)
    }
  }
  if (Array.isArray(hotel?.images)) {
    hotel.images.forEach(pushImg)
  }
  if (Array.isArray(hotel?.rooms)) {
    hotel.rooms.forEach((room) => {
      if (!room?.rates) return
      room.rates.forEach((rate) => {
        const ri = rate?.room_images
        if (!ri) return
        if (typeof ri === 'string') {
          try {
            const parsed = JSON.parse(ri)
            if (Array.isArray(parsed)) parsed.forEach(pushImg)
          } catch (_) {}
        } else if (Array.isArray(ri)) {
          ri.forEach(pushImg)
        }
      })
    })
  }
  return imgs
}

const TripPlanCard = ({ plan }) => {
  if (!plan) return null

  const { flight, hotel, budget, estimate, origin, destination, departure_date, return_date, nights } = plan
  const [showFlight, setShowFlight] = useState(false)
  const [showHotel, setShowHotel] = useState(false)

  const parseDate = (iso) => {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const addDays = (iso, days) => {
    const d = parseDate(iso)
    if (!d) return null
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  }

  const normalizeYmd = (val) => {
    if (!val) return null
    // Convert YYYYMMDD to YYYY-MM-DD for reliable Date parsing
    const m = /^(\d{4})(\d{2})(\d{2})$/.exec(val)
    if (m) return `${m[1]}-${m[2]}-${m[3]}`
    return val
  }

  const parseDatesFromRateKey = (rateKey) => {
    if (!rateKey || typeof rateKey !== 'string') return { checkIn: null, checkOut: null }
    const parts = rateKey.split('|')
    if (parts.length < 2) return { checkIn: null, checkOut: null }
    return { checkIn: normalizeYmd(parts[0]), checkOut: normalizeYmd(parts[1]) }
  }

  const primaryRate = hotel?.rooms?.[0]?.rates?.[0]
  const rateDates = parseDatesFromRateKey(primaryRate?.rate_key)

  const checkIn = plan.check_in || hotel?.check_in || rateDates.checkIn || departure_date
  let checkOut = plan.check_out || hotel?.check_out || rateDates.checkOut || return_date || null

  const computedNights = (() => {
    if (typeof nights === 'number') return nights
    const ci = parseDate(checkIn)
    const co = parseDate(checkOut)
    if (ci && co) {
      const diffMs = co.getTime() - ci.getTime()
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
      return Math.max(1, diffDays)
    }
    if (ci && !co) {
      return 1
    }
    return null
  })()

  if (!checkOut && checkIn && typeof computedNights === 'number') {
    checkOut = addDays(checkIn, computedNights)
  }

  const flightPrice = flight?.total_amount || flight?.base_amount || flight?.price
  const flightCurrency = flight?.total_currency || flight?.currency
  const hotelPrice = hotel?.min_rate || hotel?.max_rate
  const hotelCurrency = hotel?.currency
  const hotelImages = collectImages(hotel || {})
  const primaryHotelImg = hotelImages[0]

  const cancelPolicy = (() => {
    const policies = primaryRate?.cancellation_policies
    if (!Array.isArray(policies) || policies.length === 0) return null
    const first = policies[0]
    return {
      from: first.from,
      amount: first.amount,
    }
  })()

  return (
    <div className="glass-effect rounded-2xl p-4 border border-luxury-gold/30 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-luxury-cream/60">Trip plan</p>
          <p className="text-lg font-semibold text-luxury-cream">{origin} &rarr; {destination}</p>
          <p className="text-xs text-luxury-cream/60">
            {formatDate(checkIn)}{checkOut ? ` to ${formatDate(checkOut)}` : ''}
          </p>
          {computedNights !== null && (
            <p className="text-xs text-luxury-cream/60">{computedNights} night{computedNights === 1 ? '' : 's'}</p>
          )}
        </div>
        <div className="text-right">
          {budget && (
            <p className="text-sm text-luxury-cream/70">Budget: {budget}</p>
          )}
          {estimate?.total_estimated && (
            <p className="text-sm text-luxury-gold font-semibold">
              Est. total: {estimate.currency || ''} {estimate.total_estimated}
            </p>
          )}
        </div>
      </div>

      {flight && (
        <motion.button
          onClick={() => setShowFlight(true)}
          className="w-full rounded-xl border border-luxury-gold/25 bg-luxury-darkBlue/60 p-3 text-left hover:border-luxury-gold/60 transition"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-luxury-cream/60">Flight</p>
              <p className="text-base font-semibold text-luxury-cream">
                {flight.slices?.[0]?.origin?.iata_code || origin} &rarr; {flight.slices?.[0]?.destination?.iata_code || destination}
              </p>
              <p className="text-xs text-luxury-cream/60">{flight.slices?.[0]?.duration || 'Duration n/a'}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-luxury-gold">
                {flightCurrency} {flightPrice}
              </p>
              <p className="text-xs text-luxury-cream/60">Tap for details</p>
            </div>
          </div>
        </motion.button>
      )}

      {hotel && (
        <motion.button
          onClick={() => setShowHotel(true)}
          className="w-full rounded-xl border border-luxury-gold/25 bg-luxury-darkBlue/60 p-3 text-left hover:border-luxury-gold/60 transition"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-3">
            {primaryHotelImg && (
              <img src={primaryHotelImg} alt={hotel.name || 'Hotel'} className="h-16 w-20 object-cover rounded-lg" />
            )}
            <div className="flex-1">
              <p className="text-xs text-luxury-cream/60">Hotel</p>
              <p className="text-base font-semibold text-luxury-cream">{hotel.name || 'Hotel option'}</p>
              <p className="text-xs text-luxury-cream/60">{hotel.destination}</p>
              {computedNights !== null && (
                <p className="text-[11px] text-luxury-cream/60">{computedNights} night{computedNights === 1 ? '' : 's'}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-luxury-gold">
                {hotelCurrency} {hotelPrice}
              </p>
              <p className="text-xs text-luxury-cream/60">Tap for details</p>
            </div>
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {showFlight && flight && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFlight(false)} />
            <motion.div
              className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-luxury-slate/90 p-6 shadow-2xl border border-luxury-gold/30"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-luxury-cream">{flight.owner?.name || 'Flight offer'}</p>
                  <p className="text-xs text-luxury-cream/60">Offer: {flight.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-luxury-gold">
                    {flightCurrency} {flightPrice}
                  </p>
                  <p className="text-xs text-luxury-cream/60">
                    Expires {formatDate(flight.expires_at)} {formatTime(flight.expires_at)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {flight.slices?.map((sl, idx) => (
                  <div key={sl.id || idx} className="rounded-2xl border border-luxury-gold/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-luxury-cream/60">Leg {idx + 1}</p>
                        <p className="text-lg font-semibold text-luxury-cream">
                          {sl.origin?.iata_code || sl.origin?.name} &rarr; {sl.destination?.iata_code || sl.destination?.name}
                        </p>
                        <p className="text-xs text-luxury-cream/60">{sl.duration || 'Duration n/a'}</p>
                      </div>
                      <div className="text-sm text-luxury-cream/70 text-right">
                        <p>{formatDate(sl.segments?.[0]?.departing_at)} {formatTime(sl.segments?.[0]?.departing_at)}</p>
                        <p>{formatDate(sl.segments?.slice(-1)[0]?.arriving_at)} {formatTime(sl.segments?.slice(-1)[0]?.arriving_at)}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-3">
                      {sl.segments?.map((seg) => (
                        <div key={seg.id} className="rounded-xl bg-luxury-darkBlue/50 p-3 border border-luxury-gold/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-luxury-cream/70">
                                {seg.marketing_carrier?.name || 'Carrier'} - {seg.marketing_carrier_flight_number}
                              </p>
                              <p className="text-base text-luxury-cream">
                                {seg.origin?.iata_code || seg.origin} &rarr; {seg.destination?.iata_code || seg.destination}
                              </p>
                              <p className="text-xs text-luxury-cream/60">
                                {formatTime(seg.departing_at)} - {formatTime(seg.arriving_at)} - {seg.duration || 'Duration n/a'}
                              </p>
                            </div>
                            <div className="text-right text-xs text-luxury-cream/60">
                              <p>{seg.cabin_class_marketing_name || seg.passengers?.[0]?.cabin_class_marketing_name || 'Cabin n/a'}</p>
                              <p>{seg.passengers?.[0]?.baggages?.map(b => `${b.quantity} ${b.type}`).join(' - ') || 'Bags n/a'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowFlight(false)}
                  className="px-4 py-2 rounded-xl bg-luxury-gold text-luxury-navy font-semibold hover:brightness-105 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHotel && hotel && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowHotel(false)} />
            <motion.div
              className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-luxury-slate/90 p-6 shadow-2xl border border-luxury-gold/30"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-luxury-cream">{hotel.name || 'Hotel'}</p>
                  <p className="text-xs text-luxury-cream/60">{hotel.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-luxury-gold">
                    {hotelCurrency} {hotelPrice}
                  </p>
                  <p className="text-xs text-luxury-cream/60">{hotel.destination}</p>
                </div>
              </div>
              <p className="text-sm text-luxury-cream/80 mt-2">{hotel.address}</p>
              {hotel.description && <p className="text-sm text-luxury-cream/70 mt-2">{hotel.description}</p>}
              <div className="text-xs text-luxury-cream/60 mt-2 space-y-1">
                {checkIn && <p>Check-in: {formatDate(checkIn)}</p>}
                {checkOut && <p>Check-out: {formatDate(checkOut)}</p>}
                {computedNights !== null && (
                  <p>Stay length: {computedNights} night{computedNights === 1 ? '' : 's'}</p>
                )}
              </div>
              {hotel.facilities && hotel.facilities.length > 0 && (
                <p className="text-xs text-luxury-cream/60 mt-1">Facilities: {hotel.facilities.join(', ')}</p>
              )}
              <div className="text-xs text-luxury-cream/60 mt-2 space-y-1">
                {hotel.category_code && <p>Category code: {hotel.category_code}</p>}
                {hotel.zone && <p>Zone: {hotel.zone}</p>}
                {hotel.latitude && hotel.longitude && <p>Location: {hotel.latitude}, {hotel.longitude}</p>}
                {primaryRate?.board_name && <p>Board: {primaryRate.board_name}</p>}
                {primaryRate?.payment_type && <p>Payment type: {primaryRate.payment_type}</p>}
                {cancelPolicy && (
                  <p>Cancellation from: {formatDate(cancelPolicy.from)} {formatTime(cancelPolicy.from)} - fee {cancelPolicy.amount}</p>
                )}
              </div>
              {hotelImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {hotelImages.slice(0, 12).map((src, i) => (
                    <img key={i} src={src} alt={`hotel-img-${i}`} className="w-full h-28 object-cover rounded-xl" />
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowHotel(false)}
                  className="px-4 py-2 rounded-xl bg-luxury-gold text-luxury-navy font-semibold hover:brightness-105 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TripPlanCard
