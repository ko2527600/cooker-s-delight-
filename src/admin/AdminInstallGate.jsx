import React, { useState, useEffect } from "react"
import { useInstallPrompt } from "../hooks/useInstallPrompt"
import { motion, AnimatePresence } from "motion/react"
import AdminLogin from "./Login"
import { 
  HiDevicePhoneMobile, HiCheckCircle, HiLockClosed, 
  HiBolt, HiBell, HiChartBar 
} from "react-icons/hi2"

export default function AdminInstallGate() {
  const { isInstallable, isInstalled, 
          triggerInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [justInstalled, setJustInstalled] = useState(false)

  // Check if admin has previously installed or dismissed
  const hasInstalled = isInstalled || 
    localStorage.getItem("cd_admin_installed") === "true"

  const handleInstall = async () => {
    setInstalling(true)
    const success = await triggerInstall()
    setInstalling(false)
    if (success) {
      localStorage.setItem("cd_admin_installed", "true")
      setJustInstalled(true)
      setTimeout(() => setDismissed(true), 2000)
    }
  }

  // If already installed or dismissed after install
  if (hasInstalled || dismissed) {
    return <AdminLogin />
  }

  // Show install gate
  return (
    <div className="min-h-screen flex items-center 
      justify-center p-6"
      style={{ background: "#0f0f0f" }}>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center">
        
        {/* Logo */}
        <div className="mb-8">
          <img src="/assets/logo.jpg" 
            alt="Cookers Delight"
            className="w-20 h-20 rounded-2xl mx-auto mb-4 object-contain"
            style={{ border: "2px solid rgba(236,72,36,0.3)" }}/>
          <h1 className="font-display text-white text-4xl 
            font-light tracking-tight">
            Cookers
            <span className="text-[#EC4824]">Delight</span>
          </h1>
          <p className="text-white/30 text-xs uppercase 
            tracking-[.25em] mt-1">
            Admin Portal
          </p>
        </div>

        {/* Install card */}
        <div className="rounded-2xl p-8 mb-6"
          style={{ 
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.06)"
          }}>
          
          {justInstalled ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-4">
              <div className="text-5xl mb-4 text-green-500 flex justify-center">
                <HiCheckCircle size={64} />
              </div>
              <h2 className="text-white font-bold text-xl mb-2">
                Installed Successfully!
              </h2>
              <p className="text-white/50 text-sm">
                Redirecting to login...
              </p>
            </motion.div>
          ) : (
            <>
              <div className="text-5xl mb-5 text-[#EC4824] flex justify-center">
                <HiDevicePhoneMobile size={64} />
              </div>
              
              <h2 className="text-white font-bold text-xl mb-3">
                Install Required
              </h2>
              
              <p className="text-white/50 text-sm 
                leading-relaxed mb-6">
                For security and the best experience, 
                you must install the 
                <span className="text-[#EC4824] font-bold">
                  {" "}CD Admin App{" "}
                </span>
                before accessing the dashboard.
              </p>

               <div className="space-y-3 mb-8 text-left">
                {[
                  { icon: <HiLockClosed size={16} />, text: "Secure standalone access" },
                  { icon: <HiBolt size={16} />, text: "Faster dashboard performance" },
                  { icon: <HiBell size={16} />, text: "Real-time order notifications" },
                  { icon: <HiChartBar size={16} />, text: "Offline data viewing" },
                ].map((b, i) => (
                  <div key={i} className="flex items-center 
                    gap-3 text-sm text-white/60">
                    <span className="text-[#EC4824]">{b.icon}</span>
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>

              {isInstallable ? (
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="w-full py-4 rounded-xl 
                    text-white font-bold text-sm uppercase 
                    tracking-wider transition-all 
                    hover:opacity-90 disabled:opacity-60
                    flex items-center justify-center gap-3 cursor-pointer"
                  style={{ 
                    background: "linear-gradient(135deg, #872735, #EC4824)",
                    boxShadow: "0 10px 30px rgba(236,72,36,0.3)"
                  }}>
                  {installing ? (
                    <>
                      <div className="w-4 h-4 border-2 
                        border-white/30 border-t-white 
                        rounded-full animate-spin"/>
                      Installing...
                    </>
                  ) : (
                    <>
                      <HiDevicePhoneMobile size={20} />
                      Install CD Admin App
                    </>
                  )}
                </button>
              ) : (
                <div className="rounded-xl p-4 text-sm"
                  style={{ 
                    background: "rgba(236,72,36,0.1)",
                    border: "1px solid rgba(236,72,36,0.2)"
                  }}>
                  <p className="text-[#EC4824] font-bold mb-1">
                    How to install manually:
                  </p>
                  <p className="text-white/50 text-xs 
                    leading-relaxed">
                    Chrome: Click the install icon (⊕) 
                    in the address bar.<br/>
                    Safari iOS: Tap Share → 
                    "Add to Home Screen".<br/>
                    Edge: Click ··· → Apps → 
                    "Install this site as an app".
                  </p>
                  <button
                    onClick={() => {
                      localStorage.setItem(
                        "cd_admin_installed", "true"
                      )
                      setDismissed(true)
                    }}
                    className="mt-3 text-[#EC4824] 
                      text-xs underline cursor-pointer">
                    I've installed it manually → Continue
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-white/20 text-xs">
          Cookers Delight Admin Portal · Secured Access
        </p>
      </motion.div>
    </div>
  )
}
