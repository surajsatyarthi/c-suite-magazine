import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Global lock counter to handle multiple overlapping modals/popups
// We use a global variable because we want a singleton source of truth for the document body state
let lockCount = 0

export function useBodyScrollLock(isLocked: boolean) {
  const pathname = usePathname()
  
  // Track if THIS instance currently holds a lock
  const lockedRef = useRef(false)

  // 1. Handle Locking/Unlocking based on prop
  useEffect(() => {
    if (isLocked) {
      // Apply Lock
      lockCount++
      lockedRef.current = true
      document.body.style.overflow = 'hidden'
      
      // iOS Safari Fix
      if (typeof window !== 'undefined' && window.navigator && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
         document.body.style.position = 'fixed'
         document.body.style.width = '100%'
      }
      
    } else {
      // Release Lock (if appropriate)
      if (lockedRef.current) {
        lockCount--
        lockedRef.current = false
      }
      
      // Only actually clear styles if count is 0
      if (lockCount <= 0) {
        lockCount = 0 
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
      }
    }

    // Cleanup on Unmount
    return () => {
      if (lockedRef.current) {
        lockCount--
        lockedRef.current = false
      }
      if (lockCount <= 0) {
        lockCount = 0
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
      }
    }
  }, [isLocked])

  // 2. Safety Valve: Reset on Navigation
  useEffect(() => {
    if (lockCount > 0) {
      console.warn('[useBodyScrollLock] Navigation detected. Force unlocking body scroll.')
      lockCount = 0
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      lockedRef.current = false 
    }
  }, [pathname])
}
