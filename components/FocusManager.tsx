'use client'

import { useEffect } from 'react'

export default function FocusManager() {
  useEffect(() => {
    let isKeyboardUser = false

    // Detect keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow')) {
        isKeyboardUser = true
        document.body.classList.add('keyboard-user')
        document.body.classList.remove('mouse-user')
      }
    }

    // Detect mouse navigation
    const handleMouseDown = () => {
      isKeyboardUser = false
      document.body.classList.add('mouse-user')
      document.body.classList.remove('keyboard-user')
    }

    // Handle focus trap for modals
    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        
        const modal = document.querySelector('.focus-trap')
        if (modal) {
          const modalFocusableElements = modal.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
          
          if (modalFocusableElements.length > 0) {
            const firstElement = modalFocusableElements[0] as HTMLElement
            const lastElement = modalFocusableElements[modalFocusableElements.length - 1] as HTMLElement
            
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }
      }
    }

    // Handle escape key for modals and dropdowns
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Close any open modals
        const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"]')
        modals.forEach(modal => {
          const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement
          if (closeButton) {
            closeButton.click()
          }
        })

        // Close any open dropdowns
        const dropdowns = document.querySelectorAll('.dropdown-menu')
        dropdowns.forEach(dropdown => {
          dropdown.classList.remove('open')
        })

        // Clear search inputs
        const searchInputs = document.querySelectorAll('input[type="search"], input[aria-label*="search"], input[aria-label*="Search"]')
        searchInputs.forEach(input => {
          if (input instanceof HTMLInputElement) {
            input.value = ''
            input.blur()
          }
        })
      }
    }

    // Handle arrow key navigation for carousels and lists
    const handleArrowNavigation = (e: KeyboardEvent) => {
      const activeElement = document.activeElement
      if (!activeElement) return

      const carousel = activeElement.closest('[role="region"][aria-label*="carousel"], [role="region"][aria-label*="slider"]')
      if (carousel) {
        const items = carousel.querySelectorAll('[role="option"], [role="slide"], .carousel-item')
        const currentIndex = Array.from(items).indexOf(activeElement as Element)
        
        if (currentIndex !== -1) {
          let nextIndex = currentIndex
          
          switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
              e.preventDefault()
              nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
              break
            case 'ArrowRight':
            case 'ArrowDown':
              e.preventDefault()
              nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
              break
            case 'Home':
              e.preventDefault()
              nextIndex = 0
              break
            case 'End':
              e.preventDefault()
              nextIndex = items.length - 1
              break
          }
          
          if (nextIndex !== currentIndex) {
            (items[nextIndex] as HTMLElement).focus()
          }
        }
      }
    }

    // Initialize with mouse user (most common)
    document.body.classList.add('mouse-user')

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleFocusTrap)
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleArrowNavigation)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleFocusTrap)
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleArrowNavigation)
    }
  }, [])

  return null
}