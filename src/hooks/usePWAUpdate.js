import { useEffect, useState } from "react"
import { useRegisterSW } from "virtual:pwa-register/react"

export function usePWAUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW registered:", r)
    },
    onRegisterError(error) {
      console.log("SW register error:", error)
    }
  })

  return { needRefresh, updateServiceWorker, 
           setNeedRefresh }
}
