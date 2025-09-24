"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Waves } from "lucide-react"

export default function MarineHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 marine-gradient">
        <div className="absolute inset-0 wave-pattern opacity-30"></div>

        {/* Animated wave layers */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg
            className="wave-animation"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{ height: "120px", width: "100%" }}
          >
            <path
              d="M0,60 C150,100 350,0 600,60 C850,120 1050,20 1200,60 L1200,120 L0,120 Z"
              fill="rgba(255,255,255,0.1)"
            />
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 w-full">
          <svg
            className="wave-slow"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{ height: "100px", width: "100%" }}
          >
            <path
              d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,120 L0,120 Z"
              fill="rgba(255,255,255,0.2)"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <div className="float-animation mb-8">
            <Waves className="h-16 w-16 mx-auto mb-6 text-white/90" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
            Explore the Ocean's
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
              Hidden Depths
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto text-pretty">
            Advanced oceanographic research platform powered by ARGO float data. Discover marine insights through
            cutting-edge geospatial visualization and AI-driven analysis.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold">
              Explore Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold bg-transparent"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">12,847</div>
              <div className="text-blue-100">Active Floats</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">89.3%</div>
              <div className="text-blue-100">Ocean Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">2.8M</div>
              <div className="text-blue-100">Data Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">96.7%</div>
              <div className="text-blue-100">Data Quality</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
