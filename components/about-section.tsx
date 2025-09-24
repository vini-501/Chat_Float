"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Waves, Users, Target, Zap, Globe, Shield, ArrowRight } from "lucide-react"

export default function AboutSection() {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "Democratizing access to oceanographic data for researchers worldwide",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Cutting-edge technology for advanced marine data analysis",
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Supporting climate research and ocean conservation efforts",
    },
    {
      icon: Shield,
      title: "Data Integrity",
      description: "Ensuring highest quality standards for scientific research",
    },
  ]

  const team = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief Oceanographer",
      description: "20+ years in marine research and ARGO float technology",
    },
    {
      name: "Alex Rodriguez",
      role: "Lead Data Scientist",
      description: "Expert in machine learning and oceanographic data analysis",
    },
    {
      name: "Dr. James Wilson",
      role: "Platform Architect",
      description: "Specialist in large-scale data visualization and processing",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-100 pt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Waves className="h-12 w-12 text-primary mr-3" />
            <Badge variant="secondary" className="text-lg px-4 py-2">
              About OceanScope
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground text-balance">
            Advancing Ocean Science Through
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              Data Innovation
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-4xl mx-auto text-pretty">
            OceanScope is a cutting-edge platform for oceanographic research, providing scientists and researchers with
            powerful tools to analyze ARGO float data and understand our oceans better. We're committed to making marine
            data accessible, actionable, and impactful.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To democratize access to oceanographic data and provide researchers worldwide with the tools they need
                to understand and protect our oceans. We believe that better data leads to better science, which leads
                to better decisions for our planet's future.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                A world where ocean data is seamlessly accessible, enabling breakthrough discoveries in climate science,
                marine biology, and ocean conservation. We envision a future where data-driven insights guide global
                efforts to protect and sustain our marine ecosystems.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Technology */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Advanced Technology Stack</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Built with modern web technologies and powered by advanced data visualization libraries to handle
                complex oceanographic datasets with precision and speed.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Real-time data processing and visualization</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Machine learning for pattern recognition</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                  <span>Scalable cloud infrastructure</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
                  <span>Interactive geospatial mapping</span>
                </div>
              </div>

              <Button className="mt-8" size="lg">
                Explore Platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Platform Statistics</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">12,847</div>
                  <div className="text-sm text-muted-foreground">Active Floats</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">89.3%</div>
                  <div className="text-sm text-muted-foreground">Ocean Coverage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-chart-3">2.8M</div>
                  <div className="text-sm text-muted-foreground">Monthly Data Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-chart-4">96.7%</div>
                  <div className="text-sm text-muted-foreground">Data Quality</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-md bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore Ocean Data?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join researchers worldwide in advancing our understanding of the oceans
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
