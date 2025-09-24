"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  MapPin,
  Calendar,
  Thermometer,
  Droplets,
  Gauge,
  Waves,
} from "lucide-react"
import type { ArgoProfile } from "@/lib/database"

interface DataTablesProps {
  profiles?: ArgoProfile[]
  loading?: boolean
  onRefresh?: () => void
}

export default function DataTables({ profiles: initialProfiles, loading: initialLoading, onRefresh }: DataTablesProps) {
  const [profiles, setProfiles] = useState<ArgoProfile[]>(initialProfiles || [])
  const [loading, setLoading] = useState(initialLoading || false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof ArgoProfile>("DATE")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Fetch profiles if not provided
  useEffect(() => {
    if (!initialProfiles) {
      fetchProfiles()
    }
  }, [initialProfiles])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/data/profiles?limit=100')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProfiles(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort profiles
  const filteredAndSortedProfiles = useMemo(() => {
    let filtered = profiles.filter(profile => 
      profile.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.latitude.toString().includes(searchTerm) ||
      profile.longitude.toString().includes(searchTerm)
    )

    filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      return 0
    })

    return filtered
  }, [profiles, searchTerm, sortField, sortDirection])

  const handleSort = (field: keyof ArgoProfile) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatValue = (value: any, field: string) => {
    if (value === null || value === undefined) return 'N/A'
    
    if (field.includes('temp') || field.includes('psal') || field.includes('pres')) {
      return typeof value === 'number' ? value.toFixed(2) : value
    }
    
    if (field === 'DATE') {
      return new Date(value).toLocaleDateString()
    }
    
    if (field === 'latitude' || field === 'longitude') {
      return typeof value === 'number' ? value.toFixed(3) : value
    }
    
    return value.toString()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5" />
            ARGO Profile Data
          </CardTitle>
          <CardDescription>
            Real-time oceanographic profile data from ARGO floats
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={onRefresh || fetchProfiles}>
              <Download className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading profiles...</span>
            </div>
          )}

          {/* Data Table */}
          {!loading && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('file')}
                    >
                      <div className="flex items-center gap-2">
                        File ID
                        {sortField === 'file' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('DATE')}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date
                        {sortField === 'DATE' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('latitude')}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                        {sortField === 'latitude' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('shallow_temp_mean')}
                    >
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        Temp (°C)
                        {sortField === 'shallow_temp_mean' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('shallow_psal_mean')}
                    >
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        Salinity
                        {sortField === 'shallow_psal_mean' && (
                          sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedProfiles.map((profile) => (
                    <TableRow key={profile.file}>
                      <TableCell className="font-mono text-sm">
                        {profile.file.substring(0, 20)}...
                      </TableCell>
                      <TableCell>
                        {formatValue(profile.DATE, 'DATE')}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatValue(profile.latitude, 'latitude')}°N</div>
                          <div className="text-muted-foreground">{formatValue(profile.longitude, 'longitude')}°E</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatValue(profile.shallow_temp_mean, 'temp')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatValue(profile.shallow_psal_mean, 'psal')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={profile.profile_temp_qc === 'A' ? 'default' : 'secondary'}
                        >
                          {profile.profile_temp_qc || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Results Summary */}
          {!loading && (
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <span>
                Showing {filteredAndSortedProfiles.length} of {profiles.length} profiles
              </span>
              <span>
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
