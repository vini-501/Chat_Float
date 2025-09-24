"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  MapPin,
  BarChart3,
  Table,
  Download,
  Sparkles,
  Mic,
  MicOff,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Settings,
  RefreshCw,
  Zap,
  Globe,
  TrendingUp,
  FileText,
  Search,
  Filter,
  Layers,
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
  isTyping?: boolean
  reactions?: { thumbsUp: number; thumbsDown: number }
}

interface OceanographicChatbotProps {
  onShowMap?: (filters: any) => void
  onShowChart?: (chartType: string, data: any) => void
  onShowTable?: (tableType: string, filters: any) => void
  onExportData?: (dataType: string, filters: any) => void
}

export default function OceanographicChatbot({
  onShowMap,
  onShowChart,
  onShowTable,
  onExportData,
}: OceanographicChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "🌊 Welcome to OceanScope AI! I'm your advanced oceanographic data assistant powered by cutting-edge AI. I can help you:\n\n• Explore ARGO float profiles and trajectories\n• Analyze temperature, salinity, and BGC parameters\n• Generate custom visualizations and reports\n• Export data in multiple formats (NetCDF, CSV, JSON)\n• Provide real-time insights and trend analysis\n\nTry asking me something like 'Show me salinity anomalies in the North Atlantic' or 'Compare oxygen levels between 2022 and 2023'",
      timestamp: new Date(),
      actions: [
        { type: "show_map", label: "Explore Global Map", icon: Globe },
        { type: "show_chart", label: "View Analytics Dashboard", icon: TrendingUp },
        { type: "show_table", label: "Browse Data Tables", icon: Table },
      ],
      reactions: { thumbsUp: 0, thumbsDown: 0 },
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        })
      } catch (error) {
        // Fallback for older browsers
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
      }
    }
  }

  useEffect(() => {
    const scrollWithDelay = () => {
      scrollToBottom()
      // Additional scroll attempt after a short delay to ensure content is rendered
      setTimeout(scrollToBottom, 100)
      setTimeout(scrollToBottom, 300)
    }

    scrollWithDelay()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, isMinimized])

  const quickActions = [
    { text: "Show me salinity profiles near the equator in March 2023", icon: MapPin },
    { text: "Compare BGC parameters in the Arabian Sea for the last 6 months", icon: BarChart3 },
    { text: "What are the nearest ARGO floats to 30°N, 40°W?", icon: Search },
    { text: "Export temperature data for the Pacific Ocean", icon: Download },
    { text: "Show depth-time plots for recent profiles", icon: Layers },
    { text: "Analyze oxygen minimum zones globally", icon: TrendingUp },
    { text: "Filter data by quality control flags", icon: Filter },
    { text: "Generate monthly climatology report", icon: FileText },
  ]

  const suggestions = [
    "temperature trends",
    "salinity anomalies",
    "ARGO float locations",
    "BGC parameters",
    "oxygen levels",
    "chlorophyll data",
    "mixed layer depth",
    "current profiles",
  ]

  const processUserQuery = async (query: string) => {
    const lowerQuery = query.toLowerCase()
    let response = ""
    let actions: any[] = []

    if (lowerQuery.includes("salinity") && (lowerQuery.includes("equator") || lowerQuery.includes("march"))) {
      response = `🔍 **Salinity Analysis - Equatorial Region (March 2023)**\n\nI found **1,247 salinity profiles** in the equatorial band (±5°) for March 2023. Key findings:\n\n• **Average surface salinity**: 34.8 PSU\n• **Depth range**: 0-2000m with highest resolution in upper 500m\n• **Quality flags**: 98.3% good data, 1.7% questionable\n• **Spatial coverage**: 180°W to 180°E\n\n**Notable patterns**: Enhanced freshwater lens in the western Pacific, elevated salinity in the Atlantic due to evaporation. Strong halocline at ~100m depth.\n\nWould you like to visualize this data or dive deeper into specific regions?`
      actions = [
        {
          type: "show_map",
          label: "Map View",
          data: { region: "equator", parameter: "salinity", date: "2023-03" },
          icon: MapPin,
        },
        {
          type: "show_chart",
          label: "Depth Profiles",
          data: { type: "salinity_depth", region: "equator" },
          icon: BarChart3,
        },
        { type: "show_table", label: "Data Table", data: { type: "salinity_profiles" }, icon: Table },
        { type: "export_data", label: "Export NetCDF", data: { type: "salinity", format: "netcdf" }, icon: Download },
      ]
    } else if (lowerQuery.includes("bgc") && lowerQuery.includes("arabian")) {
      response = `📊 **BGC Analysis - Arabian Sea (Last 6 Months)**\n\nComprehensive biogeochemical analysis completed for **Arabian Sea region** (50°E-75°E, 5°N-25°N):\n\n**Data Summary**:\n• **Active floats**: 34 BGC-enabled ARGO floats\n• **Profiles analyzed**: 1,456 complete BGC profiles\n• **Parameters**: O₂, pH, NO₃, Chl-a, backscatter, CDOM\n\n**Key Findings**:\n• **Oxygen Minimum Zone**: Intensified at 200-800m depth\n• **Chlorophyll peak**: Elevated during SW monsoon (June-Sept)\n• **pH variability**: 7.8-8.1 range with seasonal cycles\n• **Nitrate depletion**: Surface waters during bloom periods\n\n**Seasonal patterns** show strong monsoon influence on biogeochemical cycling.`
      actions = [
        {
          type: "show_chart",
          label: "BGC Time Series",
          data: { region: "arabian_sea", type: "bgc_timeseries" },
          icon: TrendingUp,
        },
        {
          type: "show_map",
          label: "Spatial Distribution",
          data: { region: "arabian_sea", parameter: "bgc" },
          icon: Globe,
        },
        {
          type: "show_table",
          label: "Parameter Summary",
          data: { region: "arabian_sea", type: "bgc_summary" },
          icon: Table,
        },
        {
          type: "export_data",
          label: "Export Analysis",
          data: { type: "bgc_report", region: "arabian_sea" },
          icon: FileText,
        },
      ]
    } else if (lowerQuery.includes("nearest") && lowerQuery.includes("argo")) {
      response = `🎯 **Nearest ARGO Floats Analysis**\n\nSearching within **500km radius** of specified coordinates...\n\n**Found 18 active floats**:\n\n**🟢 Closest Float**: \n• **ID**: 4902947 (BGC-enabled)\n• **Distance**: 47.3 km NE\n• **Last profile**: 2 days ago\n• **Current depth**: 1,847m (parking depth)\n• **Next cycle**: 4 days\n• **Status**: Excellent signal strength\n\n**🟡 Secondary floats** (50-150km):\n• 6 core ARGO floats (T/S profiles)\n• 3 BGC floats (full biogeochemical suite)\n• 2 deep floats (4000m profiles)\n\n**Data availability**: Real-time and delayed-mode data accessible.`
      actions = [
        {
          type: "show_map",
          label: "Float Locations",
          data: { type: "nearest_floats", coords: [30, -40] },
          icon: MapPin,
        },
        { type: "show_table", label: "Float Details", data: { type: "float_inventory" }, icon: Table },
        { type: "show_chart", label: "Trajectory Plots", data: { type: "float_trajectories" }, icon: Layers },
        { type: "filter_data", label: "Filter by Type", data: { type: "float_filter" }, icon: Filter },
      ]
    } else if (lowerQuery.includes("temperature") && lowerQuery.includes("trend")) {
      response = `🌡️ **Global Temperature Trend Analysis**\n\n**Multi-decadal warming patterns** detected across ocean basins:\n\n**📈 Trend Summary (2005-2023)**:\n• **Global average**: +0.08°C per decade\n• **Upper ocean (0-200m)**: +0.12°C per decade\n• **Intermediate waters**: +0.04°C per decade\n\n**🌍 Regional Variations**:\n• **Pacific**: Strongest warming (+0.15°C/decade)\n• **Atlantic**: Moderate warming (+0.09°C/decade)\n• **Indian Ocean**: Variable patterns (+0.06°C/decade)\n• **Southern Ocean**: Cooling in some regions (-0.02°C/decade)\n\n**🔥 Hotspots**: Western boundary currents show accelerated warming. Arctic regions experiencing rapid temperature increases.\n\n**Statistical significance**: 95% confidence level for most regions.`
      actions = [
        {
          type: "show_chart",
          label: "Trend Maps",
          data: { type: "temperature_trends", period: "decadal" },
          icon: TrendingUp,
        },
        {
          type: "show_map",
          label: "Regional Analysis",
          data: { parameter: "temperature", analysis: "trends" },
          icon: Globe,
        },
        { type: "show_chart", label: "Time Series", data: { type: "temperature_timeseries" }, icon: BarChart3 },
        {
          type: "export_data",
          label: "Trend Data",
          data: { type: "temperature_trends", format: "csv" },
          icon: Download,
        },
      ]
    } else if (lowerQuery.includes("export") || lowerQuery.includes("download")) {
      response = `📁 **Data Export Center**\n\nI can prepare your oceanographic data in multiple formats optimized for different use cases:\n\n**🗂️ Available Formats**:\n• **NetCDF4**: Scientific standard with metadata\n• **CSV**: Spreadsheet-compatible tabular data\n• **JSON**: Web-friendly structured data\n• **HDF5**: High-performance binary format\n• **MATLAB**: .mat files for MATLAB users\n\n**📊 Export Options**:\n• Quality-controlled datasets only\n• Raw data with all flags\n• Processed/gridded products\n• Custom spatial/temporal subsets\n• Metadata and documentation included\n\n**⚡ Processing**: Large datasets prepared asynchronously with email notification.\n\nWhat specific dataset would you like to export?`
      actions = [
        {
          type: "export_data",
          label: "Temperature Profiles",
          data: { type: "temperature", format: "netcdf" },
          icon: Download,
        },
        { type: "export_data", label: "Salinity Data", data: { type: "salinity", format: "csv" }, icon: Download },
        { type: "export_data", label: "BGC Parameters", data: { type: "bgc", format: "json" }, icon: Download },
        { type: "export_data", label: "Custom Export", data: { type: "custom" }, icon: Settings },
      ]
    } else {
      response = `🤖 **OceanScope AI Assistant**\n\nI'm here to help you explore and analyze oceanographic data! I specialize in:\n\n**🌊 Core Capabilities**:\n• ARGO float profile analysis\n• Temperature & salinity trend detection\n• Biogeochemical parameter assessment\n• Spatial and temporal data filtering\n• Quality control and validation\n• Multi-format data export\n\n**💡 Try asking me about**:\n• Specific regions or time periods\n• Parameter comparisons and correlations\n• Data quality and availability\n• Export and visualization options\n\n**Example queries**: "Show oxygen trends in the Pacific" or "Export salinity data for 2023"\n\nWhat oceanographic question can I help you with today?`
      actions = [
        { type: "show_map", label: "Explore Global Data", data: { type: "overview" }, icon: Globe },
        { type: "show_chart", label: "Analytics Dashboard", data: { type: "overview" }, icon: BarChart3 },
        { type: "show_table", label: "Data Browser", data: { type: "overview" }, icon: Table },
        { type: "search_data", label: "Advanced Search", data: { type: "search" }, icon: Search },
      ]
    }

    return { response, actions }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
      reactions: { thumbsUp: 0, thumbsDown: 0 },
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setShowSuggestions(false)
    setIsTyping(true)

    const processingTime = Math.random() * 1000 + 1500 // 1.5-2.5 seconds
    setTimeout(async () => {
      const { response, actions } = await processUserQuery(inputValue)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: response,
        timestamp: new Date(),
        actions,
        reactions: { thumbsUp: 0, thumbsDown: 0 },
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, processingTime)
  }

  const handleAction = (action: any) => {
    console.log("[v0] Chatbot action triggered:", action)
    switch (action.type) {
      case "show_map":
        console.log("[v0] Chatbot requested map view with filters:", action.data)
        onShowMap?.(action.data)
        break
      case "show_chart":
        console.log("[v0] Chatbot requested chart:", action.data?.type || "default", action.data)
        onShowChart?.(action.data?.type || "default", action.data)
        break
      case "show_table":
        console.log("[v0] Chatbot requested table view:", action.data?.type || "default", action.data)
        onShowTable?.(action.data?.type || "default", action.data)
        break
      case "export_data":
        console.log("[v0] Chatbot requested data export:", action.data?.type || "default", action.data)
        onExportData?.(action.data?.type || "default", action.data)
        break
      case "filter_data":
      case "search_data":
        console.log("[v0] Filter/Search action:", action.data)
        break
    }
  }

  const handleQuickAction = (action: string) => {
    setInputValue(action)
    setShowSuggestions(false)
    handleSendMessage()
  }

  const toggleVoice = () => {
    setIsListening(!isListening)
    // Voice recognition implementation would go here
    console.log("[v0] Voice toggle:", !isListening)
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    console.log("[v0] Message copied to clipboard")
  }

  const handleReaction = (messageId: string, reaction: "thumbsUp" | "thumbsDown") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, reactions: { ...msg.reactions!, [reaction]: msg.reactions![reaction] + 1 } }
          : msg,
      ),
    )
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full h-16 w-16 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-primary to-secondary hover:scale-110"
          >
            <MessageCircle className="h-7 w-7 group-hover:scale-110 transition-transform" />
          </Button>
          <div className="absolute -top-1 -right-1 flex">
            <div className="h-5 w-5 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="absolute -top-2 -left-2 h-4 w-4 bg-blue-500 rounded-full animate-ping"></div>

          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap shadow-lg">
              Ask me about oceanographic data!
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const chatWidth = isFullscreen ? "w-[95vw] max-w-7xl" : isMinimized ? "w-80" : "w-[500px] max-w-[90vw]"
  const chatHeight = isFullscreen ? "h-[90vh]" : isMinimized ? "h-16" : "h-[750px] max-h-[85vh]"

  return (
    <div
      className={`fixed ${
        isFullscreen ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" : "bottom-6 right-6"
      } z-50 transition-all duration-500 ${chatWidth} ${chatHeight}`}
    >
      <Card className="h-full shadow-2xl border-2 border-primary/20 backdrop-blur-sm bg-background/95 overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
                  <Zap className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  OceanScope AI
                </CardTitle>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Advanced Oceanographic Assistant</p>
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Online
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-9 w-9 hover:bg-primary/10"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-9 w-9 hover:bg-primary/10"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(100%-100px)] overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-muted/30 to-muted/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground">Quick Actions</p>
                <Button variant="ghost" size="sm" className="text-xs h-6">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  More
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.slice(0, 3).map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.text)}
                    className="text-xs h-8 justify-start px-3 hover:bg-primary/5 hover:border-primary/20 text-left"
                  >
                    <action.icon className="h-3 w-3 mr-2 text-primary flex-shrink-0" />
                    <span className="truncate">{action.text}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-0 relative">
              <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
                <div className="space-y-6 py-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${message.type === "user" ? "justify-end" : "justify-start"} group`}
                    >
                      {message.type === "bot" && (
                        <div className="flex-shrink-0">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-primary/10">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      )}

                      <div className={`max-w-[85%] ${message.type === "user" ? "order-2" : ""}`}>
                        <div
                          className={`rounded-2xl p-4 ${
                            message.type === "user"
                              ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground ml-auto shadow-lg"
                              : "bg-muted/50 border border-border/50 shadow-sm"
                          }`}
                        >
                          <div className="text-sm leading-relaxed whitespace-pre-line">{message.content}</div>

                          {message.actions && message.actions.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              {message.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleAction(action)}
                                  className="text-xs h-8 justify-start hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                  {action.icon && <action.icon className="h-3 w-3 mr-2" />}
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {message.type === "bot" && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyMessage(message.content)}
                                className="h-7 w-7 hover:bg-primary/10"
                                title="Copy message"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-green-100 hover:text-green-600"
                                onClick={() => handleReaction(message.id, "thumbsUp")}
                                title="Helpful"
                              >
                                <ThumbsUp className="h-3 w-3" />
                                {message.reactions?.thumbsUp > 0 && (
                                  <span className="text-xs ml-1">{message.reactions.thumbsUp}</span>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-red-100 hover:text-red-600"
                                onClick={() => handleReaction(message.id, "thumbsDown")}
                                title="Not helpful"
                              >
                                <ThumbsDown className="h-3 w-3" />
                                {message.reactions?.thumbsDown > 0 && (
                                  <span className="text-xs ml-1">{message.reactions.thumbsDown}</span>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {message.type === "user" && (
                        <div className="flex-shrink-0 order-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-secondary/20 to-primary/20 flex items-center justify-center border-2 border-secondary/10">
                            <User className="h-4 w-4 text-secondary" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-primary/10">
                          <Bot className="h-4 w-4 text-primary animate-pulse" />
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce"></div>
                            <div
                              className="h-2 w-2 bg-primary/60 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="h-2 w-2 bg-primary/60 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground ml-2">AI is analyzing your query...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} className="h-4" />
              </ScrollArea>
            </div>

            <div className="p-4 border-t bg-gradient-to-r from-background to-muted/20 flex-shrink-0">
              {/* Suggestions */}
              {showSuggestions && (
                <div className="mb-3 p-3 bg-muted/30 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setInputValue((prev) => prev + suggestion + " ")
                          inputRef.current?.focus()
                        }}
                        className="text-xs h-6 px-2 hover:bg-primary/10"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
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
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Ask about ARGO data, oceanographic trends, or analysis..."
                    className="pr-24 h-11 text-sm border-2 focus:border-primary/50 rounded-xl"
                    disabled={isTyping}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleVoice}
                      className={`h-7 w-7 ${isListening ? "text-red-500 bg-red-50" : "text-muted-foreground hover:text-primary"}`}
                      title={isListening ? "Stop listening" : "Voice input"}
                    >
                      {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="h-7 w-7 hover:text-primary hover:bg-primary/10 disabled:opacity-50"
                      title="Send message"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Connected
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
