"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Menu, X } from "lucide-react"

interface NavigationProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { id: "home", label: "Home" },
    { id: "insights", label: "Features" },
    { id: "dashboard", label: "Dashboard" },
    { id: "chatbot", label: "Chat" },
    { id: "about", label: "About" },
  ]

  const handleSectionChange = (section: string) => {
    onSectionChange(section)
    setIsMobileMenuOpen(false)

    // Smooth scroll to top when changing sections
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || activeSection !== "home"
          ? "bg-white/95 backdrop-blur-sm border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center gap-2 cursor-pointer transition-colors hover:opacity-80"
            onClick={() => handleSectionChange("home")}
          >
            <MessageCircle
              className={`h-8 w-8 transition-colors ${
                isScrolled || activeSection !== "home" ? "text-primary" : "text-white"
              }`}
            />
            <span
              className={`text-2xl font-bold transition-colors ${
                isScrolled || activeSection !== "home" ? "text-foreground" : "text-white"
              }`}
            >
              FloatChat
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  activeSection === item.id
                    ? "text-primary border-b-2 border-primary pb-1"
                    : isScrolled || activeSection !== "home"
                      ? "text-muted-foreground hover:text-primary"
                      : "text-white/90 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button
              onClick={() => handleSectionChange("chatbot")}
              className={`transition-all duration-200 ${
                isScrolled || activeSection !== "home"
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-white text-primary hover:bg-white/90"
              }`}
            >
              Start Chatting
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden transition-colors ${
              isScrolled || activeSection !== "home" ? "text-foreground" : "text-white"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`text-left text-sm font-medium transition-colors hover:text-primary px-2 py-1 rounded ${
                    activeSection === item.id ? "text-primary bg-primary/10" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Button className="mt-2" onClick={() => handleSectionChange("chatbot")}>
                Start Chatting
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
