"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import FloatChatHero from "@/components/floatchat-hero"
import SectionWrapper from "@/components/section-wrapper"
import OceanographicDashboard from "@/components/oceanographic-dashboard"
import FloatChatInsightsSection from "@/components/floatchat-insights-section"
import AboutSection from "@/components/about-section"
import FloatChatChatbotSection from "@/components/floatchat-chatbot-section"

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("home")
  const [isLoading, setIsLoading] = useState(false)

  const handleSectionChange = (section: string) => {
    if (section === activeSection) return

    setIsLoading(true)

    // Add a small delay for smooth transition
    setTimeout(() => {
      setActiveSection(section)
      setIsLoading(false)
    }, 150)
  }

  const renderSection = () => {
    if (isLoading) {
      return (
        <SectionWrapper className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </SectionWrapper>
      )
    }

    switch (activeSection) {
      case "home":
        return <FloatChatHero />

      case "insights":
        return <FloatChatInsightsSection />

      case "dashboard":
        return <OceanographicDashboard />

      case "chatbot":
        return <FloatChatChatbotSection 
          onShowMap={(filters) => console.log("Map requested:", filters)}
          onShowChart={(chartType, data) => console.log("Chart requested:", chartType, data)}
          onShowTable={(tableType, filters) => console.log("Table requested:", tableType, filters)}
          onExportData={(dataType, filters) => console.log("Export requested:", dataType, filters)}
        />

      case "about":
        return <AboutSection />

      default:
        return <FloatChatHero />
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation activeSection={activeSection} onSectionChange={handleSectionChange} />
      <main className="transition-all duration-300">{renderSection()}</main>
    </div>
  )
}
