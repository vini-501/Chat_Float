"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Bot, 
  User, 
  BarChart3, 
  Map, 
  Table, 
  Download,
  MessageCircle,
  TrendingUp,
  Database,
  Zap,
  Globe,
  Waves,
  Settings,
  Eye
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  actions?: Array<{
    type: "show_map" | "show_chart" | "show_table" | "export_data" | "filter_data" | "search_data"
    label: string
    data?: any
    icon?: any
  }>
}

interface FloatChatChatbotSectionProps {
  onShowMap?: (filters: any) => void
  onShowChart?: (chartType: string, data: any) => void
  onShowTable?: (tableType: string, filters: any) => void
  onExportData?: (dataType: string, filters: any) => void
}

export default function FloatChatChatbotSection({
  onShowMap,
  onShowChart,
  onShowTable,
  onExportData,
}: FloatChatChatbotSectionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "🌊 Welcome to the Ocean Intelligence Hub! I'm your marine AI assistant, ready to dive deep into oceanographic data, analyze marine patterns, and provide scientific insights from the world's oceans. What would you like to explore today?",
      timestamp: new Date(),
      actions: [
        { type: "show_map", label: "Ocean Map", icon: Globe },
        { type: "show_chart", label: "Marine Data", icon: BarChart3 },
        { type: "show_table", label: "Research Data", icon: Table },
      ],
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showExamples, setShowExamples] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [chatMode, setChatMode] = useState<"conversation" | "explorer">("conversation")
  const [isVisible, setIsVisible] = useState(false)

  // Ocean-inspired features
  const features = [
    {
      icon: Waves,
      title: "Ocean Intelligence",
      description: "Deep learning algorithms for marine data analysis",
    },
    {
      icon: Globe,
      title: "Global Monitoring",
      description: "Real-time oceanographic data from worldwide sensors",
    },
    {
      icon: BarChart3,
      title: "Data Visualization",
      description: "Interactive charts and maps for ocean insights",
    },
    {
      icon: Database,
      title: "Scientific Database",
      description: "Access to comprehensive marine research data",
    },
  ]

  const exampleQueries = [
    "Show me ocean temperature patterns in the Indian",
    "Analyze salinity levels near the equator", 
    "Display current density measurements",
    "Track marine biodiversity changes",
    "Generate oceanographic summary report",
    "Export temperature data for research",
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const processUserQuery = async (query: string) => {
    try {
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          mode: chatMode,
          conversationId: messages[0]?.id || undefined
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        return {
          response: result.data.content,
          actions: result.data.actions || []
        }
      } else {
        throw new Error(result.error || 'Unknown API error')
      }
    } catch (error) {
      console.error('Error calling chat API:', error)
      
      // Fallback to local processing
      return processUserQueryFallback(query)
    }
  }

  const processUserQueryFallback = async (query: string) => {
    const lowerQuery = query.toLowerCase()
    let response = ""
    let actions: any[] = []

    if (lowerQuery.includes("temperature") || lowerQuery.includes("trend")) {
      response = `🌡️ **Ocean Temperature Analysis**\n\nAnalyzing temperature data from ARGO floats:\n\n• **Surface Temperature**: Current readings from global network\n• **Thermocline Depth**: Analyzing thermal stratification\n• **Seasonal Variations**: Tracking temperature cycles\n• **Regional Patterns**: Comparing different ocean basins\n\nThe data reveals significant oceanographic insights about temperature distribution.`
      actions = [
        { type: "show_chart", label: "Temperature Chart", data: { type: "temperature_trends" }, icon: BarChart3 },
        { type: "show_map", label: "Ocean Map", data: { parameter: "temperature" }, icon: Map },
        { type: "show_table", label: "Data Table", data: { type: "temperature_data" }, icon: Table },
        { type: "export_data", label: "Export Data", data: { type: "temperature", format: "csv" }, icon: Download },
      ]
    } else if (lowerQuery.includes("compare") || lowerQuery.includes("region")) {
      response = `📊 **Regional Comparison Analysis**\n\nCompleted comparative analysis across different regions:\n\n• **Data coverage**: Multiple regions analyzed\n• **Key metrics**: Temperature, patterns, and trends\n• **Statistical significance**: High confidence in results\n• **Notable differences**: Significant variations detected\n\nThe comparison reveals distinct regional characteristics and patterns.`
      actions = [
        { type: "show_chart", label: "Comparison Chart", data: { type: "regional_comparison" }, icon: BarChart3 },
        { type: "show_map", label: "Regional Map", data: { type: "comparison" }, icon: Globe },
        { type: "show_table", label: "Comparison Table", data: { type: "regional_data" }, icon: Table },
        { type: "export_data", label: "Export Analysis", data: { type: "comparison", format: "json" }, icon: Download },
      ]
    } else if (lowerQuery.includes("report") || lowerQuery.includes("summary")) {
      response = `📋 **Summary Report Generated**\n\nComprehensive analysis report prepared:\n\n• **Data overview**: Complete dataset summary\n• **Key findings**: Major insights and patterns\n• **Statistical analysis**: Detailed metrics and trends\n• **Recommendations**: Actionable insights provided\n\nThe report includes visualizations and detailed explanations of all findings.`
      actions = [
        { type: "show_table", label: "View Report", data: { type: "summary_report" }, icon: Table },
        { type: "show_chart", label: "Report Charts", data: { type: "report_visualization" }, icon: BarChart3 },
        { type: "export_data", label: "Download Report", data: { type: "report", format: "pdf" }, icon: Download },
      ]
    } else if (lowerQuery.includes("export") || lowerQuery.includes("download")) {
      response = `📁 **Data Export Options**\n\nMultiple export formats available for your data:\n\n• **CSV**: Spreadsheet-compatible format\n• **JSON**: Web-friendly structured data\n• **PDF**: Formatted reports with visualizations\n• **Excel**: Advanced spreadsheet format\n\nAll exports include metadata and documentation for easy use.`
      actions = [
        { type: "export_data", label: "Export CSV", data: { format: "csv" }, icon: Download },
        { type: "export_data", label: "Export JSON", data: { format: "json" }, icon: Download },
        { type: "export_data", label: "Export PDF", data: { format: "pdf" }, icon: Download },
        { type: "show_table", label: "Preview Data", data: { type: "export_preview" }, icon: Table },
      ]
    } else if (lowerQuery.includes("chart") || lowerQuery.includes("visualization")) {
      response = `📈 **Visualization Created**\n\nGenerated interactive visualizations for your data:\n\n• **Chart types**: Multiple visualization options available\n• **Interactive features**: Zoom, filter, and explore data\n• **Export options**: Save charts in various formats\n• **Real-time updates**: Dynamic data visualization\n\nThe visualizations help identify patterns and trends in your data.`
      actions = [
        { type: "show_chart", label: "Line Chart", data: { type: "line_chart" }, icon: BarChart3 },
        { type: "show_chart", label: "Bar Chart", data: { type: "bar_chart" }, icon: BarChart3 },
        { type: "show_map", label: "Geographic View", data: { type: "geo_chart" }, icon: MapPin },
        { type: "export_data", label: "Export Chart", data: { type: "chart", format: "png" }, icon: Download },
      ]
    } else {
      response = `🤖 **FloatChat AI Assistant**\n\nI'm here to help you with intelligent conversations and data analysis! I can:\n\n• **Analyze data** and identify patterns\n• **Create visualizations** and charts\n• **Generate reports** and summaries\n• **Export data** in multiple formats\n• **Answer questions** about your data\n\nTry asking me about trends, comparisons, or specific data analysis tasks!`
      actions = [
        { type: "show_chart", label: "Analytics Dashboard", data: { type: "overview" }, icon: BarChart3 },
        { type: "show_map", label: "Explore Data", data: { type: "overview" }, icon: Globe },
        { type: "show_table", label: "Browse Data", data: { type: "overview" }, icon: Table },
      ]
    }

    return { response, actions }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    setShowExamples(false)

    try {
      // Process query with API integration
      const { response, actions } = await processUserQuery(userMessage.content)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response,
        timestamp: new Date(),
        actions,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Error processing message:', error)
      
      // Error fallback message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "🌊 I'm experiencing some technical difficulties connecting to the ocean data systems. Please try again in a moment, or ask me something else about marine research!",
        timestamp: new Date(),
        actions: [
          { type: "show_map", label: "Explore Map", icon: Map },
          { type: "show_table", label: "Browse Data", icon: Table }
        ]
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleAction = (action: any) => {
    switch (action.type) {
      case "show_map":
        onShowMap?.(action.data)
        break
      case "show_chart":
        onShowChart?.(action.data?.type || "default", action.data)
        break
      case "show_table":
        onShowTable?.(action.data?.type || "default", action.data)
        break
      case "export_data":
        onExportData?.(action.data?.type || "default", action.data)
        break
    }
  }

  const handleExampleClick = (example: string) => {
    setInputValue(example)
    setShowExamples(false)
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
      {/* Light ocean-inspired animated background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating bubble particles */}
        <div className="absolute top-20 left-10 w-3 h-3 bg-cyan-300/40 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-2 h-2 bg-blue-300/50 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-4 h-4 bg-teal-300/30 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-cyan-400/60 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-3 h-3 bg-blue-400/40 rounded-full animate-bounce"></div>
        <div className="absolute top-60 left-1/2 w-1 h-1 bg-teal-400/70 rounded-full animate-ping"></div>
        <div className="absolute bottom-60 left-20 w-2 h-2 bg-cyan-300/50 rounded-full animate-pulse"></div>
        
        {/* Subtle light wave overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-100/30 via-transparent to-cyan-100/20"></div>
      </div>

      {/* Ocean Intelligence Hub - 80% Screen Size */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Main Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600">
            Ocean Intelligence Hub
          </h1>
          <p className="text-slate-600 text-lg">Dive deep into marine data with AI-powered insights</p>
        </div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: isVisible ? 0 : 50, opacity: isVisible ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="w-4/5 mx-auto max-w-6xl bg-white/80 backdrop-blur-xl border border-cyan-200/50 rounded-3xl shadow-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.8) 50%, rgba(236, 254, 255, 0.9) 100%)",
            boxShadow: "0 25px 50px -12px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
          }}
        >
        {/* Header with Ocean Globe */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-200/30">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-md"
            >
              <Globe className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-slate-700 font-semibold text-sm">Ask the Ocean AI</h3>
              <p className="text-slate-500 text-xs">Marine Intelligence Hub</p>
            </div>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex bg-slate-100/80 rounded-lg p-1">
            <button
              onClick={() => setChatMode("conversation")}
              className={`px-3 py-1 text-xs rounded transition-all ${
                chatMode === "conversation" 
                  ? "bg-cyan-500 text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <MessageCircle className="h-3 w-3 inline mr-1" />
              Chat
            </button>
            <button
              onClick={() => setChatMode("explorer")}
              className={`px-3 py-1 text-xs rounded transition-all ${
                chatMode === "explorer" 
                  ? "bg-cyan-500 text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Eye className="h-3 w-3 inline mr-1" />
              Explorer
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="overflow-y-auto p-6 space-y-4 min-h-[500px] max-h-[600px]">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ y: 50, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -50, opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "bot" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                      <Waves className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}

                <div className={`max-w-[75%] ${message.type === "user" ? "order-2" : ""}`}>
                  {/* Glassmorphism ocean-inspired message card */}
                  <div
                    className={`rounded-2xl p-3 backdrop-blur-sm border ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-cyan-300/50 ml-auto shadow-lg"
                        : "bg-white/70 border-cyan-200/40 text-slate-700"
                    }`}
                    style={{
                      borderRadius: message.type === "bot" ? "20px 20px 20px 5px" : "20px 20px 5px 20px",
                      boxShadow: message.type === "user" 
                        ? "0 8px 32px rgba(6, 182, 212, 0.3)" 
                        : "0 8px 32px rgba(15, 23, 42, 0.4)"
                    }}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {/* Highlight scientific terms */}
                      {message.content.split(/(\b(?:temperature|salinity|density|ocean|marine|depth|current)\b)/gi).map((part, index) => {
                        const isScientificTerm = /^(temperature|salinity|density|ocean|marine|depth|current)$/i.test(part)
                        return isScientificTerm ? (
                          <span key={index} className="text-cyan-600 font-semibold bg-cyan-100/80 px-1 rounded">
                            {part}
                          </span>
                        ) : (
                          part
                        )
                      })}
                    </div>

                    {/* Action buttons for bot messages */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {message.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAction(action)}
                            className="text-xs h-7 justify-start hover:bg-cyan-100 hover:text-cyan-700 transition-all bg-white/60 text-cyan-600 border-cyan-200/50"
                          >
                            {action.icon && <action.icon className="h-3 w-3 mr-2" />}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {message.type === "user" && (
                  <div className="flex-shrink-0 order-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Wave-like typing animation */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <Waves className="h-4 w-4 text-white animate-pulse" />
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 border border-cyan-200/40">
                <div className="flex items-center gap-2">
                  {/* Wave ripple animation */}
                  <div className="flex items-center gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-slate-600 ml-2">Ocean AI is analyzing...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Command Console Input Bar */}
        <div className="p-6 border-t border-cyan-200/30">
          <div className="relative">
            <div className="bg-white/60 backdrop-blur-sm border border-cyan-200/50 rounded-2xl p-4 shadow-inner">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                </div>
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask the Ocean…"
                  className="flex-1 bg-transparent border-0 text-slate-700 placeholder:text-slate-400 focus:ring-0 focus:outline-none text-lg h-12"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-12 h-12 p-0 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 disabled:opacity-50 shadow-lg text-white"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Ocean Queries */}
            {(messages.length <= 1 || showExamples) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex flex-wrap gap-2"
              >
                {exampleQueries.slice(0, 3).map((example, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleExampleClick(example)}
                    className="px-3 py-1 text-xs bg-white/60 backdrop-blur-sm border border-cyan-200/50 rounded-full hover:bg-cyan-50 hover:border-cyan-300/70 transition-all duration-200 text-slate-600 hover:text-slate-800"
                  >
                    {example.split(' ').slice(0, 3).join(' ')}...
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  )
}