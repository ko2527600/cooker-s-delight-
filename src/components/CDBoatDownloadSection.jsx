import React, { useState } from "react"
import { useInstallPrompt } from "../hooks/useInstallPrompt"
import { motion } from "motion/react"
import { 
  HiShoppingBag, HiMapPin, HiStar, HiBell, 
  HiDevicePhoneMobile, HiRocketLaunch, HiCheckCircle,
  HiArrowDownTray
} from "react-icons/hi2"

export default function CDBoatDownloadSection() {
  const { isInstallable, isInstalled, 
          triggerInstall } = useInstallPrompt()
  const [installed, setInstalled] = useState(isInstalled)

  const handleInstall = async () => {
    const success = await triggerInstall()
    if (success) setInstalled(true)
  }

  return (
    <section className="py-28 relative overflow-hidden"
      style={{ background: "#0e0e0e" }}>
      
      {/* Background glow */}
      <div className="absolute inset-0 opacity-10"
        style={{ 
          background: "radial-gradient(circle at 30% 50%, #EC4824 0%, transparent 60%)"
        }}/>

      <div className="relative max-w-7xl mx-auto px-6 
        lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* LEFT: Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}>
          
          <span className="inline-block text-[10px] 
            font-bold uppercase tracking-[.22em] 
            text-[#EC4824] mb-5 px-3 py-1.5 rounded-sm"
            style={{ background: "rgba(236,72,36,0.12)" }}>
            Now Available
          </span>

          <h2 className="font-display text-white mb-6"
            style={{ 
              fontSize: "clamp(48px,8vw,80px)",
              fontWeight: 300,
              lineHeight: 0.9,
              letterSpacing: "-.02em"
            }}>
            Get the<br/>
            <em className="italic text-[#f8f2e8]">
              CD Boat
            </em>
            <span className="text-[#EC4824]"> App</span>
          </h2>

          <p className="text-white/50 text-base 
            leading-relaxed mb-8 max-w-md">
            Order your favourite Ghanaian and Nigerian 
            meals directly from your phone. Track orders 
            in real-time, earn loyalty points, and enjoy 
            exclusive deals — all in one app.
          </p>

          {/* Features list */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {[
              { icon: <HiShoppingBag size={18} />, text: "Easy ordering" },
              { icon: <HiMapPin size={18} />, text: "Live order tracking" },
              { icon: <HiStar size={18} />, text: "Loyalty rewards" },
              { icon: <HiBell size={18} />, text: "Push notifications" },
              { icon: <HiDevicePhoneMobile size={18} />, text: "Works offline" },
              { icon: <HiRocketLaunch size={18} />, text: "Lightning fast" },
            ].map((f, i) => (
              <div key={i} className="flex items-center 
                gap-2.5">
                <span className="text-[#EC4824]">{f.icon}</span>
                <span className="text-white/60 text-sm">
                  {f.text}
                </span>
              </div>
            ))}
          </div>

          {/* Install Button */}
          {installed ? (
            <div className="flex items-center gap-3 
              text-green-400 font-bold">
              <span className="text-2xl text-green-500">
                <HiCheckCircle size={32} />
              </span>
              <div>
                <p className="font-bold">
                  CD Boat is installed!
                </p>
                <p className="text-white/40 text-sm 
                  font-normal">
                  Open it from your home screen
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <button
              onClick={handleInstall}
              className="flex items-center gap-4 
                px-8 py-4 rounded-sm font-bold 
                text-sm uppercase tracking-wider
                transition-all hover:opacity-90 
                hover:scale-105 cursor-pointer"
              style={{ 
                background: "linear-gradient(135deg, #872735, #EC4824)",
                boxShadow: "0 20px 50px rgba(236,72,36,0.35)"
              }}>
              <HiArrowDownTray size={24} />
              <div className="text-left">
                <p className="text-[9px] opacity-75 
                  font-normal tracking-widest">
                  INSTALL FREE
                </p>
                <p className="text-base font-bold 
                  tracking-normal normal-case">
                  Download CD Boat
                </p>
              </div>
            </button>
          ) : (
            <a
              href="/portal/login"
              className="flex items-center gap-4 
                px-8 py-4 rounded-sm font-bold 
                text-sm uppercase tracking-wider
                transition-all hover:opacity-90 w-fit"
              style={{ 
                background: "linear-gradient(135deg, #872735, #EC4824)"
              }}>
              <HiRocketLaunch size={24} />
              <div className="text-left">
                <p className="text-[9px] opacity-75 
                  font-normal tracking-widest">
                  USE WEB APP
                </p>
                <p className="text-base font-bold 
                  tracking-normal normal-case">
                  Install CD Boat
                </p>
              </div>
            </a>
          )}

          <p className="text-white/25 text-xs mt-4">
            No app store needed · Works on all devices · 
            100% free
          </p>
        </motion.div>

        {/* RIGHT: Phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center">
          
          {/* Phone frame */}
          <div className="relative w-[280px] animate-float">
            
            {/* Phone outer */}
            <div className="w-full rounded-[40px] p-3"
              style={{ 
                background: "#1a1a1a",
                border: "2px solid rgba(255,255,255,0.1)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"
              }}>
              
              {/* Screen */}
              <div className="rounded-[30px] overflow-hidden"
                style={{ background: "#111", minHeight: "560px" }}>
                
                {/* Status bar */}
                <div className="flex justify-between items-center 
                  px-6 pt-4 pb-2">
                  <span className="text-white text-xs font-bold">
                    9:41
                  </span>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-4 h-2 rounded-sm"
                      style={{ background: "#EC4824" }}/>
                  </div>
                </div>

                {/* App header */}
                <div className="px-5 py-4"
                  style={{ 
                    background: "linear-gradient(135deg, #872735, #EC4824)" 
                  }}>
                  <p className="text-white/70 text-[10px] 
                    uppercase tracking-widest mb-1">
                    Good morning 👋
                  </p>
                  <p className="text-white font-bold text-lg">
                    CD Boat
                  </p>
                </div>

                {/* App content preview */}
                <div className="p-4 space-y-3 text-left">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Orders", val: "12" },
                      { label: "Points", val: <span className="flex items-center gap-1"><HiStar size={12} color="#EC4824" /> 340</span> }
                    ].map((s, i) => (
                      <div key={i} className="rounded-xl p-3"
                        style={{ background: "#1a1a1a" }}>
                        <p className="text-white/40 text-[9px]">
                          {s.label}
                        </p>
                        <p className="text-white font-bold text-sm">
                          {s.val}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order card */}
                  <div className="rounded-xl p-3"
                    style={{ background: "#1a1a1a" }}>
                    <div className="flex justify-between 
                      items-center mb-2">
                      <p className="text-white text-xs font-bold">
                        Recent Order
                      </p>
                      <span className="text-[9px] px-2 py-0.5 
                        rounded-full font-bold"
                        style={{ 
                          background: "rgba(236,72,36,0.2)", 
                          color: "#EC4824" 
                        }}>
                        Preparing
                      </span>
                    </div>
                    <p className="text-white/50 text-[10px]">
                      Jollof Rice + Tilapia
                    </p>
                    <p className="text-[#EC4824] font-bold text-sm mt-1">
                      ₵65.00
                    </p>
                  </div>

                  {/* Order button */}
                  <button className="w-full py-3 rounded-xl 
                    text-white font-bold text-xs uppercase 
                    tracking-wider"
                    style={{ 
                      background: "linear-gradient(135deg, #872735, #EC4824)" 
                    }}>
                    <span className="flex items-center justify-center gap-2">
                      Place New Order <HiShoppingBag size={14} />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Glow under phone */}
            <div className="absolute -bottom-8 left-1/2 
              -translate-x-1/2 w-40 h-10 blur-2xl rounded-full"
              style={{ background: "rgba(236,72,36,0.4)" }}/>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
