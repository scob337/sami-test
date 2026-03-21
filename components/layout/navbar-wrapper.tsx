'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'

export function NavbarWrapper() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
  
  if (isAdmin) return null
  
  return <Header />
}
