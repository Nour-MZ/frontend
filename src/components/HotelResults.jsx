import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const collectImages = (hotel) => {
  const imgs = []
  const pushImg = (img) => {
    if (!img) return
    const raw = img.path || img.url || img.image
    const src = raw ? `https://photos.hotelbeds.com/giata/bigger/${raw}` : ''
    if (src) imgs.push(src)
  }
  if (Array.isArray(hotel.images)) {
    hotel.images.forEach(pushImg)
  }
  if (Array.isArray(hotel.rooms)) {
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

const HotelResults = ({ hotels = [] }) => {
  const [selected, setSelected] = useState(null)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {hotels.map((h, idx) => {
          const imgs = collectImages(h)
          const hero = imgs[0]
          return (
            <motion.button
              key={`${h.code || idx}-${idx}`}
              onClick={() => setSelected({ ...h, _images: imgs })}
              className="w-full text-left glass-effect rounded-2xl p-4 hover:border-luxury-gold/60 border border-luxury-gold/20 transition"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center justify-between gap-3">
                {hero && (
                  <img src={hero} alt={h.name || 'Hotel'} className="h-16 w-20 object-cover rounded-xl" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-luxury-cream/70">Hotel #{idx + 1}</p>
                  <p className="text-lg font-semibold text-luxury-cream">{h.name || 'Hotel'}</p>
                  <p className="text-xs text-luxury-cream/60">{h.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-luxury-gold">
                    {h.currency} {h.min_rate || h.max_rate || ''}
                  </p>
                  <p className="text-xs text-luxury-cream/60">{h.destination}</p>
                </div>
              </div>
              <p className="text-xs text-luxury-cream/50 mt-2 truncate">{h.address}</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-luxury-cream">{selected.name || 'Hotel'}</p>
                  <p className="text-xs text-luxury-cream/60">{selected.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-luxury-gold">
                    {selected.currency} {selected.min_rate || selected.max_rate || ''}
                  </p>
                  <p className="text-xs text-luxury-cream/60">{selected.destination}</p>
                </div>
              </div>
              <p className="text-sm text-luxury-cream/80 mt-2">{selected.address}</p>
              {selected.description && <p className="text-sm text-luxury-cream/70 mt-2">{selected.description}</p>}
              {selected.keywords && selected.keywords.length > 0 && (
                <p className="text-xs text-luxury-cream/60 mt-2">Keywords: {selected.keywords.join(', ')}</p>
              )}
              {selected.facilities && selected.facilities.length > 0 && (
                <p className="text-xs text-luxury-cream/60 mt-1">Facilities: {selected.facilities.join(', ')}</p>
              )}
              <div className="text-xs text-luxury-cream/60 mt-2 space-y-1">
                {selected.category_code && <p>Category code: {selected.category_code}</p>}
                {selected.zone && <p>Zone: {selected.zone}</p>}
                {selected.latitude && selected.longitude && <p>Location: {selected.latitude}, {selected.longitude}</p>}
              </div>
              {selected._images && selected._images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selected._images.slice(0, 12).map((src, i) => (
                    <img key={i} src={src} alt={`hotel-img-${i}`} className="w-full h-28 object-cover rounded-xl" />
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setSelected(null)}
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

export default HotelResults
