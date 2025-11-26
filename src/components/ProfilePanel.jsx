import { motion, AnimatePresence } from 'framer-motion'

const ProfilePanel = ({ open, onClose, bookings = [], onOpenPage }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            className="relative ml-auto h-full w-full max-w-lg bg-luxury-slate/95 border-l border-luxury-gold/20 shadow-2xl overflow-y-auto"
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <div className="p-6 border-b border-luxury-gold/20 flex items-center justify-between">
              <div>
                <p className="text-luxury-gold font-serif text-lg font-bold">Profile</p>
                <p className="text-xs text-luxury-cream/60">Bookings, personal info, payment</p>
              </div>
              <button onClick={onClose} className="text-luxury-cream/60 hover:text-luxury-gold">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <section
                className="glass-effect rounded-2xl border border-luxury-gold/20 p-4 space-y-2 cursor-pointer hover:border-luxury-gold/40 transition"
                onClick={() => { onOpenPage && onOpenPage('personal'); onClose(); }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-luxury-gold font-semibold">Personal information</p>
                  <span className="text-xs text-luxury-cream/60">Open page</span>
                </div>
                <p className="text-xs text-luxury-cream/60">Edit your details</p>
              </section>

              <section
                className="glass-effect rounded-2xl border border-luxury-gold/20 p-4 space-y-2 cursor-pointer hover:border-luxury-gold/40 transition"
                onClick={() => { onOpenPage && onOpenPage('bookings'); onClose(); }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-luxury-gold font-semibold">Bookings</p>
                  <span className="text-xs text-luxury-cream/60">{bookings.length} total</span>
                </div>
                <p className="text-xs text-luxury-cream/60">View your flights and hotels</p>
              </section>

              <section
                className="glass-effect rounded-2xl border border-luxury-gold/20 p-4 space-y-2 cursor-pointer hover:border-luxury-gold/40 transition"
                onClick={() => { onOpenPage && onOpenPage('payment'); onClose(); }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-luxury-gold font-semibold">Payment method</p>
                  <span className="text-xs text-luxury-cream/60">Open page</span>
                </div>
                <p className="text-xs text-luxury-cream/60">Add or update your card</p>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ProfilePanel
