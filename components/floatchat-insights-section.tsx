"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Thermometer, Fish, Globe, Ship, ChevronLeft, ChevronRight, Waves, Brain, TrendingUp, Zap } from "lucide-react"

interface InsightCard {
  id: string
  title: string
  description: string
  predictions: string[]
  iconName: string
  color: string
  gradient: string
}

export default function FloatChatInsightsSection() {
  const [activeCard, setActiveCard] = useState(0)

  const insightCards: InsightCard[] = [
    {
      id: "environmental",
      title: "Environmental Predictions",
      description: "Advanced forecasting of ocean temperature, salinity trends, and thermocline dynamics for climate research and environmental monitoring.",
      predictions: [
        "Sea Temperature Forecasting - Predict average temperatures at specific depths and locations",
        "Salinity Trends - Forecast salinity changes during seasonal patterns like monsoons",
        "Thermocline Depth Prediction - Determine optimal depths for thermal layers",
        "Ocean Stratification & Density - Analyze heat storage capacity and mixing patterns"
      ],
      iconName: "thermometer",
      color: "text-orange-600",
      gradient: "from-orange-500/20 to-red-500/20"
    },
    {
      id: "biological",
      title: "Biological & Ecological Predictions",
      description: "Ecosystem health monitoring and marine life habitat predictions using oceanographic parameters to support conservation efforts.",
      predictions: [
        "Fish Population Density - Identify habitat hotspots based on temperature and salinity zones",
        "Coral Reef Health Indicators - Detect bleaching risks from temperature anomalies",
        "Plankton Growth Zones - Predict nutrient-rich areas using stratification analysis",
        "Marine Biodiversity Mapping - Track ecosystem changes and species distribution"
      ],
      iconName: "fish",
      color: "text-blue-600",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      id: "climate",
      title: "Climate & Large-Scale Predictions",
      description: "Global climate pattern analysis including ENSO events, sea level changes, and long-term ocean warming trends.",
      predictions: [
        "ENSO / Monsoon Predictions - Forecast El Niño and La Niña events using ocean heat content",
        "Sea Level Rise Indicators - Track steric height changes from density variations",
        "Heat Content Forecasting - Project regional ocean warming for climate change studies",
        "Global Circulation Patterns - Analyze large-scale ocean current changes"
      ],
      iconName: "globe",
      color: "text-green-600",
      gradient: "from-green-500/20 to-emerald-500/20"
    },
    {
      id: "navigation",
      title: "Navigation & Operational Predictions",
      description: "Maritime safety and operational efficiency through ocean condition forecasting for shipping, fishing, and marine operations.",
      predictions: [
        "Safe Navigation Zones - Optimize routes based on salinity, density, and ice formation risks",
        "Upwelling Zone Forecasts - Identify nutrient-rich waters for fisheries planning",
        "Marine Heatwave Detection - Early warning system for abnormal warm water patches",
        "Weather Routing Optimization - Enhance fuel efficiency and voyage safety"
      ],
      iconName: "ship",
      color: "text-purple-600",
      gradient: "from-purple-500/20 to-indigo-500/20"
    }
  ]

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "thermometer":
        return <Thermometer className="h-8 w-8" />
      case "fish":
        return <Fish className="h-8 w-8" />
      case "globe":
        return <Globe className="h-8 w-8" />
      case "ship":
        return <Ship className="h-8 w-8" />
      default:
        return <Waves className="h-8 w-8" />
    }
  }

  const nextCard = () => {
    setActiveCard((prev) => (prev + 1) % insightCards.length)
  }

  const prevCard = () => {
    setActiveCard((prev) => (prev - 1 + insightCards.length) % insightCards.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        {/* Animated Ocean Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Wave Animation */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="#ffffff"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="#ffffff"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#ffffff"></path>
          </svg>
        </div>

       
      </section>

      {/* ML Predictions Section */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
              <Brain className="mr-2 h-4 w-4" />
              Machine Learning Models
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              AI-Powered Future
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Predictions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced ML models analyze historical oceanographic data to provide accurate future predictions across multiple domains.
            </p>
          </div>

          {/* ML Model Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "Temperature Forecasting",
                description: "LSTM neural networks predict sea temperatures up to 6 months ahead",
                accuracy: "94.2%",
                icon: <Thermometer className="h-8 w-8 text-orange-500" />,
                gradient: "from-orange-500/10 to-red-500/10"
              },
              {
                title: "Salinity Prediction",
                description: "Random Forest models forecast salinity changes during seasonal patterns",
                accuracy: "91.8%",
                icon: <Waves className="h-8 w-8 text-blue-500" />,
                gradient: "from-blue-500/10 to-cyan-500/10"
              },
              {
                title: "Climate Pattern Analysis",
                description: "Deep learning models detect ENSO events and climate anomalies",
                accuracy: "96.5%",
                icon: <Globe className="h-8 w-8 text-green-500" />,
                gradient: "from-green-500/10 to-emerald-500/10"
              }
            ].map((model, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className={`bg-gradient-to-br ${model.gradient} rounded-2xl p-4 mb-4 w-fit`}>
                    {model.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{model.title}</h3>
                  <p className="text-gray-600 mb-4">{model.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-700">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {model.accuracy} Accuracy
                    </Badge>
                    <Button variant="ghost" size="sm" className="group-hover:bg-blue-50">
                      <Zap className="mr-1 h-4 w-4" />
                      Try Model
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Prediction Domains Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Prediction
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Domains</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore our comprehensive prediction capabilities across four key oceanographic domains.
            </p>
          </div>

          {/* Card Navigation */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <button
              onClick={prevCard}
              className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="flex gap-2">
              {insightCards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveCard(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeCard 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextCard}
              className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Main Card Display */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${insightCards[activeCard].gradient} p-8`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 rounded-2xl bg-white/90 ${insightCards[activeCard].color}`}>
                      {getIcon(insightCards[activeCard].iconName)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {insightCards[activeCard].title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {insightCards[activeCard].description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-6">Key Prediction Capabilities:</h4>
                  <div className="grid gap-4">
                    {insightCards[activeCard].predictions.map((prediction, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className={`w-2 h-2 rounded-full ${insightCards[activeCard].color.replace('text-', 'bg-')} mt-2 flex-shrink-0`}></div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">
                            {prediction.split(' - ')[0]}
                          </h5>
                          <p className="text-gray-600 text-sm">
                            {prediction.split(' - ')[1]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
