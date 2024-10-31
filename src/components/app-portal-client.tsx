'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type AppClientPortalInterface = {
  children: React.ReactNode
  selector: string
  onClose?: () => void
}

const AppClientPortal = ({ children, selector }: AppClientPortalInterface) => {
  const ref = useRef<Element | null>(null)
  useEffect(() => {
    ref.current = document.getElementById(selector)
  }, [selector])
  return ref.current ? createPortal(children, ref.current) : null
}

export default AppClientPortal
