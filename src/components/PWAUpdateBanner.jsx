import { usePWAUpdate } from "../hooks/usePWAUpdate"
import { motion, AnimatePresence } from "motion/react"

export default function PWAUpdateBanner() {
  const { needRefresh, updateServiceWorker, 
          setNeedRefresh } = usePWAUpdate()

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[999]
            flex items-center justify-between
            px-6 py-3 text-white text-sm font-medium"
          style={{ background: "#EC4824" }}>
          <span>
            🎉 New version of CD Boat available!
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => setNeedRefresh(false)}
              className="opacity-70 hover:opacity-100
                text-xs uppercase tracking-wider">
              Later
            </button>
            <button
              onClick={() => updateServiceWorker(true)}
              className="bg-white text-[#EC4824] 
                font-bold text-xs uppercase tracking-wider
                px-4 py-1.5 rounded-sm">
              Update Now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
