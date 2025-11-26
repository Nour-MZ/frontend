import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const formatTime = (iso) => {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

const formatDate = (iso) => {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

const FlightResults = ({ offers = [] }) => {
  const [selected, setSelected] = useState(null)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {offers.map((offer, idx) => {
          const owner = offer.owner || {}
          const price = offer.total_amount || offer.base_amount || offer.price || '—'
          const currency = offer.total_currency || offer.currency || ''
          const firstSlice = offer.slices?.[0]
          const firstSeg = firstSlice?.segments?.[0]
          const depTime = formatTime(firstSeg?.departing_at)
          const arrTime = formatTime(firstSlice?.segments?.slice(-1)[0]?.arriving_at)
          const depDate = formatDate(firstSeg?.departing_at)
          const origin = firstSlice?.origin?.iata_code || firstSeg?.origin || firstSlice?.origin?.name
          const dest = firstSlice?.destination?.iata_code || firstSeg?.destination || firstSlice?.destination?.name
          const stops = (firstSlice?.segments?.length || 1) - 1

          return (
            <motion.button
              key={offer.id}
              onClick={() => setSelected(offer)}
              className="relative w-full text-left glass-effect rounded-2xl p-4 pl-16 hover:border-luxury-gold/60 border border-luxury-gold/20 transition overflow-hidden"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="absolute inset-y-0 left-0 w-12 bg-luxury-gold/15 border-r border-luxury-gold/30 flex items-center justify-center">
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-luxury-gold/20 text-luxury-cream flex items-center justify-center text-sm font-semibold">
                  {idx + 1}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {owner.logo_symbol_url && (
                  <img src={owner.logo_symbol_url} alt={owner.name || 'Airline logo'} className="h-8 w-8 object-contain" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-luxury-cream/70">{owner.name || 'Airline'}</p>
                  <p className="text-lg font-semibold text-luxury-cream">{origin} → {dest}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-luxury-gold">{currency} {price}</p>
                  <p className="text-xs text-luxury-cream/60">{depDate}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-luxury-cream/70">
                <span>{depTime} – {arrTime}</span>
                <span>{firstSlice?.duration || 'Duration n/a'}</span>
                <span>{stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}`}</span>
              </div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
            <motion.div
              className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-luxury-slate/90 p-6 shadow-2xl border border-luxury-gold/30"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center flex-wrap gap-3">
                {selected.owner?.logo_lockup_url && (
                  <img src={selected.owner.logo_lockup_url} alt={selected.owner?.name} className="h-10 object-contain" />
                )}
                <div className="flex-1">
                  <p className="text-lg font-semibold text-luxury-cream">{selected.owner?.name || 'Airline'}</p>
                  <p className="text-sm text-luxury-cream/60">Offer: {selected.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-luxury-gold">{selected.total_currency || selected.currency} {selected.total_amount || selected.base_amount || selected.price}</p>
                  <p className="text-xs text-luxury-cream/60">Expires {formatDate(selected.expires_at)} {formatTime(selected.expires_at)}</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {selected.slices?.map((sl, idx) => (
                  <div key={sl.id || idx} className="rounded-2xl border border-luxury-gold/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-luxury-cream/60">Leg {idx + 1}</p>
                        <p className="text-lg font-semibold text-luxury-cream">
                          {sl.origin?.iata_code || sl.origin?.name} → {sl.destination?.iata_code || sl.destination?.name}
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
                              <p className="text-sm text-luxury-cream/70">{seg.marketing_carrier?.name || 'Carrier'} • {seg.marketing_carrier_flight_number}</p>
                              <p className="text-base text-luxury-cream">
                                {seg.origin?.iata_code || seg.origin} → {seg.destination?.iata_code || seg.destination}
                              </p>
                              <p className="text-xs text-luxury-cream/60">{formatTime(seg.departing_at)} – {formatTime(seg.arriving_at)} • {seg.duration || 'Duration n/a'}</p>
                            </div>
                            <div className="text-right text-xs text-luxury-cream/60">
                              <p>{seg.cabin_class_marketing_name || seg.passengers?.[0]?.cabin_class_marketing_name || 'Cabin n/a'}</p>
                              <p>{seg.passengers?.[0]?.baggages?.map(b => `${b.quantity} ${b.type}`).join(' • ') || 'Bags n/a'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="rounded-2xl border border-luxury-gold/20 p-4 text-sm text-luxury-cream/80">
                  <p>Payment due by: {formatDate(selected.payment_requirements?.payment_required_by)} {formatTime(selected.payment_requirements?.payment_required_by)}</p>
                  <p>Refundable before departure: {selected.conditions?.refund_before_departure?.allowed ? 'Yes' : 'No / not provided'}</p>
                  <p>Change before departure: {selected.conditions?.change_before_departure?.allowed ? 'Yes' : 'No / not provided'}</p>
                </div>

                <div className="rounded-2xl border border-luxury-gold/20 p-4 text-sm text-luxury-cream/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-luxury-cream">Passenger info template</p>
                    <p className="text-xs text-luxury-cream/60">Match Duffel required fields exactly</p>
                  </div>
                  {(selected.passengers || []).map((pax, idx) => (
                    <div key={pax.id || idx} className="rounded-xl bg-luxury-darkBlue/50 p-3 border border-luxury-gold/10 space-y-2">
                      <p className="text-sm text-luxury-gold font-semibold">Passenger {idx + 1} • ID: {pax.id || 'provided by offer'}</p>
                      <div className="grid gap-2 md:grid-cols-2 text-xs">
                        <div className="flex flex-col">
                          <span className="text-luxury-cream/60">title</span>
                          <span className="font-semibold">"Mr" | "Mrs" | "Ms"</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-luxury-cream/60">gender</span>
                          <span className="font-semibold">"m" | "f"</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-luxury-cream/60">given_name</span>
                          <span className="font-semibold">e.g., "John"</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-luxury-cream/60">family_name</span>
                          <span className="font-semibold">e.g., "Doe"</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-luxury-cream/60">born_on</span>
                          <span className="font-semibold">YYYY-MM-DD</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-luxury-cream/60">email</span>
                          <span className="font-semibold">e.g., "john.doe@email.com"</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-luxury-cream/60">phone_number</span>
                          <span className="font-semibold">e.g., "+12025550123"</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-luxury-cream/60">id</span>
                          <span className="font-semibold">{pax.id || 'use provided passenger_id from offer'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-luxury-cream/60">Provide these for each passenger above before booking.</p>
                    </div>
                  ))}
                  {(!selected.passengers || selected.passengers.length === 0) && (
                    <p className="text-xs text-luxury-cream/60">No passenger IDs returned in this offer. You will need one set of details per traveler with: title, gender, given_name, family_name, born_on (YYYY-MM-DD), email, phone_number.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-xl bg-luxury-gold text-luxury-navy hover:brightness-105 transition"
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

export default FlightResults
