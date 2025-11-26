import { motion } from 'framer-motion'

const ProfilePage = ({ mode, onClose, bookings = [] }) => {
  const titleMap = {
    personal: 'Personal Information',
    bookings: 'Your Bookings',
    payment: 'Payment Method',
  }

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-br from-luxury-navy via-luxury-darkBlue to-luxury-slate overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-luxury-gold font-serif text-2xl font-bold">{titleMap[mode] || 'Profile'}</p>
            <p className="text-xs text-luxury-cream/60">Use the fields below to manage your {mode}.</p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-luxury-gold text-luxury-navy text-sm font-semibold hover:brightness-105 transition"
          >
            Back
          </button>
        </div>

        {mode === 'personal' && (
          <motion.div
            className="glass-effect rounded-3xl border border-luxury-gold/30 p-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
                Title
                <select className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60">
                  <option value="">Select</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
                Gender (m/f)
                <select className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60">
                  <option value="">Select</option>
                  <option value="m">m</option>
                  <option value="f">f</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
                Given name
                <input className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60" placeholder="John" />
              </label>
              <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
                Family name
                <input className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60" placeholder="Doe" />
              </label>
              <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
                Born on (YYYY-MM-DD)
                <input className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60" placeholder="2000-01-31" type="date" />
              </label>
              <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
                Email
                <input className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60" placeholder="jane@example.com" type="email" />
              </label>
              <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
                Phone (must start with +)
                <input className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60" placeholder="+12025550123" />
              </label>
              <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
                Passenger ID (from offer)
                <input className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60" placeholder="pas_..." />
              </label>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 rounded-xl bg-luxury-gold text-luxury-navy font-semibold hover:brightness-105 transition" type="button">
                Save
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'bookings' && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {bookings.map((b, idx) => (
              <div key={idx} className="glass-effect rounded-2xl border border-luxury-gold/20 p-4 text-sm text-luxury-cream/90">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {b.logo && <img src={b.logo} alt={b.carrier || b.name || 'logo'} className="h-8 w-8 object-contain" />}
                      <div>
                        <span className="text-luxury-gold font-semibold capitalize">{b.type}</span>
                        <p className="text-xs text-luxury-cream/60">Ref: {b.ref}</p>
                      </div>
                    </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-luxury-cream">{b.amount}</span>
                    {b.status === 'cancelled' && <p className="text-xs text-red-300">Cancelled</p>}
                  </div>
                </div>
                {b.type === 'flight' ? (
                  <>
                    <p className="text-base mt-2">{b.route}</p>
                    <p className="text-xs text-luxury-cream/60">Departure: {b.departure || b.date}</p>
                    {b.arrival && <p className="text-xs text-luxury-cream/60">Arrival: {b.arrival}</p>}
                    {b.carrier && <p className="text-xs text-luxury-cream/60">Airline: {b.carrier}</p>}
                  </>
                ) : (
                  <>
                    <p className="text-base mt-2">{b.name}</p>
                    <p className="text-xs text-luxury-cream/60">{b.date}</p>
                  </>
                )}
              </div>
            ))}
            {bookings.length === 0 && (
              <p className="text-xs text-luxury-cream/50 italic">No bookings yet.</p>
            )}
          </motion.div>
        )}

        {mode === 'payment' && (
          <motion.div
            className="glass-effect rounded-3xl border border-luxury-gold/30 p-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
              Name on card
              <input className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60" placeholder="Jane Doe" />
            </label>
            <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
              Card number
              <input className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60" placeholder="4111111111111111" inputMode="numeric" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
                Expiry (MM/YY)
                <input className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60" placeholder="12/28" inputMode="numeric" />
              </label>
              <label className="flex flex-col gap-1 text-xs text-luxury-cream/70">
                CVC
                <input className="rounded-lg bg-luxury-navy/40 border border-luxury-gold/20 px-3 py-2 text-sm text-luxury-cream focus:outline-none focus:border-luxury-gold/60" placeholder="123" inputMode="numeric" maxLength={4} />
              </label>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 rounded-xl bg-luxury-gold text-luxury-navy font-semibold hover:brightness-105 transition" type="button">
                Save payment method
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
