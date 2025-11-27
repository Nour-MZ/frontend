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

const PassengerTemplate = ({ offer, onSubmit }) => {
  const passengersFromOffer = offer?.passengers || []
  const initialPassengers = useMemo(() => {
    if (passengersFromOffer.length > 0) {
      return passengersFromOffer.map(p => ({
        ...emptyPassenger(p.id),
        id: p.id || '',
      }))
    }
    // Default to one passenger if none provided
    return [emptyPassenger('')]
  }, [passengersFromOffer])

  const [passengers, setPassengers] = useState(initialPassengers)
  const [paymentType, setPaymentType] = useState('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpMonth, setCardExpMonth] = useState('')
  const [cardExpYear, setCardExpYear] = useState('')
  const [cardCvc, setCardCvc] = useState('')

  const handleChange = (idx, field, value) => {
    let nextVal = value
    if (field === 'phone_number') {
      // Strip spaces and enforce leading +
      nextVal = nextVal.replace(/\s+/g, '')
      if (nextVal && !nextVal.startsWith('+')) {
        nextVal = '+' + nextVal.replace(/^\+*/, '')
      }
    }
    setPassengers(prev => prev.map((p, i) => i === idx ? { ...p, [field]: nextVal } : p))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      const payload = {
        passengers,
        payment_type: paymentType || 'card',
      }
      if (paymentType === 'card' && cardNumber && cardExpMonth && cardExpYear && cardCvc) {
        payload.payment_source = {
          card_number: cardNumber.replace(/\s+/g, ''),
          exp_month: cardExpMonth,
          exp_year: cardExpYear,
          cvc: cardCvc,
          holder_name: cardName,
        }
      }
      onSubmit(payload)
    }
  }

  return (
    <div className="rounded-2xl border border-luxury-gold/20 p-4 text-sm text-luxury-cream/90 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-luxury-cream">Passenger info</p>
        <p className="text-xs text-luxury-cream/60">Match Duffel required fields exactly</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {passengers.map((pax, idx) => (
          <div key={idx} className="rounded-xl bg-luxury-darkBlue/50 p-3 border border-luxury-gold/10 space-y-3">
            <p className="text-sm text-luxury-gold font-semibold">Passenger {idx + 1}</p>
            <div className="grid gap-3 md:grid-cols-2 text-xs">
              {/* Title dropdown */}
              <label className="flex flex-col gap-1">
                <span className="text-luxury-cream/60">title</span>
                <select
                  className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                  value={pax.title || ''}
                  onChange={(e) => handleChange(idx, 'title', e.target.value)}
                  required
                >
                  <option value="" disabled>Select</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                </select>
              </label>

              {/* Gender dropdown */}
              <label className="flex flex-col gap-1">
                <span className="text-luxury-cream/60">gender</span>
                <select
                  className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                  value={pax.gender || ''}
                  onChange={(e) => handleChange(idx, 'gender', e.target.value)}
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
                    onChange={(e) => handleChange(idx, field, e.target.value)}
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
            <p className="text-xs text-luxury-cream/60">Fill every required field before booking.</p>
          </div>
        ))}

        <div className="flex gap-3">
          <div className="flex-1 space-y-2 text-xs">
            <p className="text-luxury-cream/70 font-semibold">Payment</p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment_type"
                  value="card"
                  checked={paymentType === 'card'}
                  onChange={() => setPaymentType('card')}
                />
                <span className="text-luxury-cream/70">Card</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment_type"
                  value="balance"
                  checked={paymentType === 'balance'}
                  onChange={() => setPaymentType('balance')}
                />
                <span className="text-luxury-cream/70">Balance</span>
              </label>
            </div>
            {paymentType === 'card' && (
              <div className="grid md:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-luxury-cream/60">Card number</span>
                  <input
                    className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-luxury-cream/60">Name on card</span>
                  <input
                    className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-luxury-cream/60">Exp. month (MM)</span>
                    <input
                      className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                      value={cardExpMonth}
                      onChange={(e) => setCardExpMonth(e.target.value)}
                      placeholder="12"
                      inputMode="numeric"
                      maxLength={2}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-luxury-cream/60">Exp. year (YY)</span>
                    <input
                      className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                      value={cardExpYear}
                      onChange={(e) => setCardExpYear(e.target.value)}
                      placeholder="30"
                      inputMode="numeric"
                      maxLength={2}
                      required
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-luxury-cream/60">CVC</span>
                  <input
                    className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-luxury-cream text-sm focus:outline-none focus:border-luxury-gold/60"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    inputMode="numeric"
                    maxLength={4}
                    required
                  />
                </label>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-luxury-gold text-luxury-navy font-semibold hover:brightness-105 transition"
          >
            Book Now!
          </button>
        </div>
      </form>
    </div>
  )
}

export default PassengerTemplate
