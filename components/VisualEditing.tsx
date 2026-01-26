'use client'

import VisualEditing from 'next-sanity/visual-editing/client-component'
import { useEffect } from 'react'

export default function VisualEditingComponent() {
  useEffect(() => {
    console.log('🛡️ Sanity Visual Editing Handset: Active')
  }, [])

  return <VisualEditing />
}
