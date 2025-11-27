import { useMemo, useState } from 'react'

const emptyPassenger = (idHint) => ({
  id: idHint || '',
  title: '',
  gender: '',
  given_name: '',
  family_name: '',
  born_on: '',
  email: '',
  phone_number: '',
})

const BookingTemplate = ({ template, onSubmit }) => {
  const paxTemplate = template?.passenger_template || {}
  const hotelHolder = template?.hotel_holder || { name: '', surname: '' }
  const hotelRooms = template?.hotel_rooms || []
  const flightOfferId = template?.flight_offer_id
  const hotelRateKey = template?.hotel_rate_key

  const initialPassengers = useMemo(() => {
    if (Array.isArray(paxTemplate.passengers) && paxTemplate.passengers.length > 0) {
      return paxTemplate.passengers.map(p => ({
        ...emptyPassenger(p.id),
        id: p.id || '',
      }))
    }
    return [emptyPassenger('')]
  }, [paxTemplate.passengers])

  const [passengers, setPassengers] = useState(initialPassengers)
  const [holder, setHolder] = useState({ name: hotelHolder.name || '', surname: hotelHolder.surname || '' })
  const [rooms, setRooms] = useState(
    hotelRooms.map((r, idx) => ({
      rateKey: r.rateKey || r.rate_key || hotelRateKey || '',
      paxes: (r.paxes || [{ roomId: idx + 1, type: 'AD', name: '', surname: '', age: 30 }]).map(px => ({
        roomId: px.roomId || idx + 1,
        type: px.type || 'AD',
        name: px.name || '',
        surname: px.surname || '',
        age: px.age || 30,
      })),
    }))
  )
  const [clientReference, setClientReference] = useState(template?.client_reference || '')

  const handlePassengerChange = (idx, field, value) => {
    let nextVal = value
    if (field === 'phone_number') {
      nextVal = nextVal.replace(/\s+/g, '')
      if (nextVal && !nextVal.startsWith('+')) {
        nextVal = '+' + nextVal.replace(/^\+*/, '')
      }
    }
    setPassengers(prev => prev.map((p, i) => (i === idx ? { ...p, [field]: nextVal } : p)))
  }

  const handleHolderChange = (field, value) => {
    setHolder(prev => ({ ...prev, [field]: value }))
  }

  const handlePaxChange = (roomIdx, paxIdx, field, value) => {
    setRooms(prev =>
      prev.map((room, rIdx) => {
        if (rIdx !== roomIdx) return room
        const updatedPaxes = room.paxes.map((px, pIdx) => (pIdx === paxIdx ? { ...px, [field]: value } : px))
        return { ...room, paxes: updatedPaxes }
      })
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit({
        passengers,
        holder,
        rooms,
        client_reference: clientReference,
        flight_offer_id: flightOfferId,
        hotel_rate_key: hotelRateKey,
      })
    }
  }

  return (
    <div className="rounded-2xl border border-luxury-gold/20 p-4 text-sm text-luxury-cream/90 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-luxury-cream">Trip booking details</p>
        <p className="text-xs text-luxury-cream/60">Fill passengers and hotel info</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {passengers.map((pax, idx) => (
          <div key={idx} className="rounded-xl bg-luxury-darkBlue/50 p-3 border border-luxury-gold/10 space-y-3">
            <p className="text-sm text-luxury-gold font-semibold">Passenger {idx + 1}</p>
            <div className="grid gap-3 md:grid-cols-2 text-xs">
              <label className="flex flex-col gap-1">
                <span className="text-luxury-cream/60">title</span>
                <select
                  className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                  value={pax.title || ''}
                  onChange={(e) => handlePassengerChange(idx, 'title', e.target.value)}
                  required
                >
                  <option value="" disabled>Select</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-luxury-cream/60">gender</span>
                <select
                  className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                  value={pax.gender || ''}
                  onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                  required
                >
                  <option value="" disabled>Select</option>
                  <option value="m">m</option>
                  <option value="f">f</option>
                </select>
              </label>

              {[
                { label: 'given_name', field: 'given_name', placeholder: 'John' },
                { label: 'family_name', field: 'family_name', placeholder: 'Doe' },
                { label: 'born_on', field: 'born_on', placeholder: 'YYYY-MM-DD', type: 'date' },
                { label: 'email', field: 'email', placeholder: 'john.doe@email.com', type: 'email' },
                { label: 'phone_number', field: 'phone_number', placeholder: '+12025550123', type: 'tel', pattern: '^\\+\\d+$' },
              ].map(({ label, field, placeholder, type = 'text', pattern }) => (
                <label key={field} className="flex flex-col gap-1">
                  <span className="text-luxury-cream/60">{label}</span>
                  <input
                    className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                    value={pax[field] || ''}
                    onChange={(e) => handlePassengerChange(idx, field, e.target.value)}
                    placeholder={placeholder}
                    required
                    type={type}
                    pattern={pattern}
                    inputMode={field === 'phone_number' ? 'tel' : undefined}
                  />
                </label>
              ))}
              <label className="flex flex-col gap-1">
                <span className="text-luxury-cream/60">id (from offer)</span>
                <input
                  className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm opacity-60 cursor-not-allowed"
                  value={pax.id || ''}
                  disabled
                />
              </label>
            </div>
          </div>
        ))}

        <div className="rounded-xl bg-luxury-darkBlue/50 p-3 border border-luxury-gold/10 space-y-3">
          <p className="text-sm text-luxury-gold font-semibold">Hotel holder</p>
          <div className="grid gap-3 md:grid-cols-2 text-xs">
            <label className="flex flex-col gap-1">
              <span className="text-luxury-cream/60">name</span>
              <input
                className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                value={holder.name}
                onChange={(e) => handleHolderChange('name', e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-luxury-cream/60">surname</span>
              <input
                className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                value={holder.surname}
                onChange={(e) => handleHolderChange('surname', e.target.value)}
                required
              />
            </label>
          </div>
        </div>

        {rooms.map((room, rIdx) => (
          <div key={rIdx} className="rounded-xl bg-luxury-darkBlue/50 p-3 border border-luxury-gold/10 space-y-2 text-xs">
            <p className="text-sm text-luxury-gold font-semibold">Room {rIdx + 1}</p>
            <p className="text-luxury-cream/60 break-all">rateKey: {room.rateKey}</p>
            {room.paxes.map((px, pIdx) => (
              <div key={pIdx} className="grid gap-2 md:grid-cols-4">
                <label className="flex flex-col gap-1">
                  <span className="text-luxury-cream/60">type</span>
                  <select
                    className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-2 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                    value={px.type}
                    onChange={(e) => handlePaxChange(rIdx, pIdx, 'type', e.target.value)}
                  >
                    <option value="AD">AD</option>
                    <option value="CH">CH</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-luxury-cream/60">name</span>
                  <input
                    className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-2 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                    value={px.name}
                    onChange={(e) => handlePaxChange(rIdx, pIdx, 'name', e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-luxury-cream/60">surname</span>
                  <input
                    className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-2 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                    value={px.surname}
                    onChange={(e) => handlePaxChange(rIdx, pIdx, 'surname', e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-luxury-cream/60">age</span>
                  <input
                    type="number"
                    min="0"
                    className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-2 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                    value={px.age}
                    onChange={(e) => handlePaxChange(rIdx, pIdx, 'age', e.target.value)}
                    required
                  />
                </label>
              </div>
            ))}
          </div>
        ))}

        <div className="grid gap-2 text-xs">
          <label className="flex flex-col gap-1">
            <span className="text-luxury-cream/60">client_reference</span>
            <input
              className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
              value={clientReference}
              onChange={(e) => setClientReference(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-luxury-gold text-luxury-navy font-semibold hover:brightness-105 transition"
          >
            Submit booking
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookingTemplate
