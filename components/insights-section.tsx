"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3, Globe, Thermometer, Droplets, Activity, ArrowRight } from "lucide-react"

export default function InsightsSection() {
  const insights = [
    {
      title: "Global Temperature Rise",
      description: "Ocean temperatures have increased by 0.6°C in the upper 2000m since 1969",
      trend: "+0.6°C",
      icon: Thermometer,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Salinity Changes",
      description: "Significant salinity variations detected in major ocean basins",
      trend: "±0.2 PSU",
      icon: Droplets,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Current Patterns",
      description: "Major shifts in ocean circulation patterns affecting global climate",
      trend: "15% change",
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
  ]

  const features = [
    {
      title: "Real-time Analysis",
      description: "Process ARGO float data as it's collected from around the globe",
      icon: TrendingUp,
    },
    {
      title: "Advanced Visualization",
      description: "Interactive charts and maps for comprehensive data exploration",
      icon: BarChart3,
    },
    {
      title: "Global Coverage",
      description: "Access data from over 12,000 active floats worldwide",
      icon: Globe,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 pt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Latest Research
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground text-balance">
            Ocean Insights & Analytics
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            Discover patterns in marine data through advanced analytics and machine learning algorithms. Our platform
            processes millions of data points to reveal critical ocean trends.
          </p>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {insights.map((insight, index) => {
            const Icon = insight.icon
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg ${insight.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${insight.color}`} />
                  </div>
                  <CardTitle className="text-xl">{insight.title}</CardTitle>
                  <div className={`text-2xl font-bold ${insight.color}`}>{insight.trend}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{insight.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Advanced Analytics Platform</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our cutting-edge platform combines real-time data processing with sophisticated visualization tools to
              provide unprecedented insights into ocean behavior and climate patterns.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <Button className="mt-8" size="lg">
              Explore Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Data Coverage</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Active ARGO Floats</span>
                <span className="text-2xl font-bold text-primary">12,847</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ocean Coverage</span>
                <span className="text-2xl font-bold text-secondary">89.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Data Points (Monthly)</span>
                <span className="text-2xl font-bold text-chart-3">2.8M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Quality Score</span>
                <span className="text-2xl font-bold text-chart-4">96.7%</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Latest Update:</strong> New temperature profiles from the Southern Ocean added to the dataset.
              </p>
            </div>
          </div>
        </div>

        {/* Research Areas */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-8 text-center">Research Focus Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Thermometer className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Climate Change</h3>
              <p className="text-sm text-muted-foreground">Tracking ocean warming and its global impact</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplets className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="font-semibold mb-2">Ocean Chemistry</h3>
              <p className="text-sm text-muted-foreground">Monitoring salinity and chemical composition</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Current Systems</h3>
              <p className="text-sm text-muted-foreground">Understanding ocean circulation patterns</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Marine Ecosystems</h3>
              <p className="text-sm text-muted-foreground">Studying habitat changes and biodiversity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
