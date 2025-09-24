"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, MessageCircle, Sparkles, Zap, Brain, Globe, BarChart3, Database, ArrowRight } from "lucide-react"
import OceanographicChatbot from "@/components/oceanographic-chatbot"

export default function ChatbotSection() {
  const [showChatbot, setShowChatbot] = useState(false)

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze oceanographic patterns and trends in real-time",
    },
    {
      icon: Globe,
      title: "Global Data Access",
      description: "Query data from over 12,000 ARGO floats worldwide with natural language commands",
    },
    {
      icon: BarChart3,
      title: "Instant Visualizations",
      description: "Generate charts, maps, and graphs instantly based on your research questions",
    },
    {
      icon: Database,
      title: "Smart Data Export",
      description: "Export custom datasets in multiple formats with intelligent filtering and processing",
    },
  ]

  const capabilities = [
    "Analyze temperature and salinity profiles across ocean basins",
    "Track biogeochemical parameters and oxygen minimum zones",
    "Compare multi-year trends and seasonal variations",
    "Identify ARGO float locations and trajectories",
    "Generate custom reports and data visualizations",
    "Export data in NetCDF, CSV, JSON, and other formats",
    "Provide quality control insights and data validation",
    "Answer complex oceanographic research questions",
  ]

  const exampleQueries = [
    {
      query: "Show me salinity anomalies in the North Atlantic for 2023",
      description: "Analyze regional salinity patterns and identify anomalous conditions",
    },
    {
      query: "Compare oxygen levels between the Pacific and Indian Ocean",
      description: "Cross-basin comparison of biogeochemical parameters",
    },
    {
      query: "What are the temperature trends in the Southern Ocean?",
      description: "Long-term climate analysis and trend detection",
    },
    {
      query: "Export BGC data for the Arabian Sea in CSV format",
      description: "Custom data extraction with specific formatting requirements",
    },
  ]

  const handleStartChat = () => {
    setShowChatbot(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 pt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="mb-4 text-lg px-4 py-2">
            AI Assistant
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground text-balance">
            Meet Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              AI Ocean Expert
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-4xl mx-auto text-pretty">
            Powered by advanced AI, our oceanographic assistant understands natural language queries and provides
            instant insights from global ARGO float data. Ask complex questions and get intelligent, actionable answers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={handleStartChat} className="px-8 py-4 text-lg font-semibold">
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Conversation
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold bg-transparent">
              <Zap className="mr-2 h-5 w-5" />
              View Examples
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Capabilities and Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Capabilities */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Our AI assistant can handle complex oceanographic queries and provide detailed analysis across multiple
                parameters and time scales.
              </p>
              <div className="space-y-3">
                {capabilities.map((capability, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{capability}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Example Queries */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-secondary" />
                Example Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Try these example queries to see how our AI can help with your oceanographic research.
              </p>
              <div className="space-y-4">
                {exampleQueries.map((example, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="font-medium text-sm mb-2 text-primary">"{example.query}"</div>
                    <div className="text-xs text-muted-foreground">{example.description}</div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6" onClick={handleStartChat}>
                Try These Examples
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Ask Your Question</h3>
              <p className="text-muted-foreground">
                Type your oceanographic question in natural language. No need to learn complex query syntax.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">2. AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI processes your query, accesses relevant ARGO data, and performs sophisticated analysis.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Get Results</h3>
              <p className="text-muted-foreground">
                Receive detailed answers with visualizations, data tables, and actionable insights.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-8">Powered by Real Data</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold mb-2">12,847</div>
              <div className="text-blue-100">Active ARGO Floats</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">2.8M</div>
              <div className="text-blue-100">Monthly Data Points</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">89.3%</div>
              <div className="text-blue-100">Ocean Coverage</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">96.7%</div>
              <div className="text-blue-100">Data Quality</div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Chatbot */}
      {showChatbot && (
        <OceanographicChatbot
          onShowMap={(filters) => console.log("Map requested:", filters)}
          onShowChart={(chartType, data) => console.log("Chart requested:", chartType, data)}
          onShowTable={(tableType, filters) => console.log("Table requested:", tableType, filters)}
          onExportData={(dataType, filters) => console.log("Export requested:", dataType, filters)}
        />
      )}
    </div>
  )
}
