"use client"

import type { ReactNode } from "react"

interface SectionWrapperProps {
  children: ReactNode
  className?: string
  id?: string
}

export default function SectionWrapper({ children, className = "", id }: SectionWrapperProps) {
  return (
    <section id={id} className={`min-h-screen transition-all duration-500 ease-in-out ${className}`}>
      {children}
    </section>
  )
}
