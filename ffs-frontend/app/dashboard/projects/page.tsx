"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Edit,
  Eye,
  Filter,
  PlusCircle,
  Search,
  Trash2,
  XCircle,
} from "lucide-react"
import { ToastContextProvider, useToast } from "@/components/ui/toast-context"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"

type UserData = {
  email: string
  name: string
  role: string
  organizationType: "SingleDistrict" | "Coop"
  organizationId: string
  permissions: string[]
}

type Project = {
  id: string
  name: string
  description: string
  status: "Planning" | "In Progress" | "Completed" | "On Hold" | "Cancelled"
  startDate: Date | null
  endDate: Date | null
  budget: number
  manager: string
  district: string
  school: string | null
  createdBy: string
  createdAt: Date
  priority: "Low" | "Medium" | "High"
  completionPercentage: number
}

// Sample districts and schools
const districts = [
  {
    id: "1",
    name: "Springfield School District",
    schools: [
      { id: "101", name: "Springfield Elementary School" },
      { id: "102", name: "Springfield Middle School" },
      { id: "103", name: "Springfield High School" },
      { id: "104", name: "Westside Elementary School" },
      { id: "105", name: "Eastside Elementary School" },
    ],
  },
  {
    id: "2",
    name: "Central State Cooperative",
    schools: [],
  },
  {
    id: "3",
    name: "Westview School District",
    schools: [
      { id: "301", name: "Westview Elementary School" },
      { id: "302", name: "Westview Middle School" },
      { id: "303", name: "Westview High School" },
    ],
  },
]

// Sample project managers
const projectManagers = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Sarah Johnson" },
  { id: "3", name: "Michael Brown" },
  { id: "4", name: "Lisa Garcia" },
]

// Sample projects
const sampleProjects: Project[] = [
  {
    id: "proj-001",
    name: "Cafeteria Renovation",
    description: "Complete renovation of the main cafeteria including new equipment and furniture",
    status: "In Progress",
    startDate: new Date("2023-06-01"),
    endDate: new Date("2023-08-15"),
    budget: 250000,
    manager: "John Smith",
    district: "Springfield School District",
    school: "Springfield High School",
    createdBy: "Admin User",
    createdAt: new Date("2023-05-15"),
    priority: "High",
    completionPercentage: 45,
  },
  {
    id: "proj-002",
    name: "Farm to School Program Implementation",
    description: "Establishing partnerships with local farms to supply fresh produce to all district schools",
    status: "Planning",
    startDate: new Date("2023-07-01"),
    endDate: new Date("2024-06-30"),
    budget: 75000,
    manager: "Sarah Johnson",
    district: "Springfield School District",
    school: null, // District-wide project
    createdBy: "Admin User",
    createdAt: new Date("2023-05-20"),
    priority: "Medium",
    completionPercentage: 15,
  },
  {
    id: "proj-003",
    name: "Kitchen Equipment Upgrade",
    description: "Replacing outdated kitchen equipment with energy-efficient models",
    status: "Completed",
    startDate: new Date("2023-03-01"),
    endDate: new Date("2023-04-30"),
    budget: 120000,
    manager: "Michael Brown",
    district: "Westview School District",
    school: "Westview Elementary School",
    createdBy: "Admin User",
    createdAt: new Date("2023-02-15"),
    priority: "Medium",
    completionPercentage: 100,
  },
  {
    id: "proj-004",
    name: "Nutrition Education Program",
    description: "Developing and implementing a comprehensive nutrition education program for students",
    status: "In Progress",
    startDate: new Date("2023-04-15"),
    endDate: new Date("2023-12-15"),
    budget: 45000,
    manager: "Lisa Garcia",
    district: "Springfield School District",
    school: null, // District-wide project
    createdBy: "Admin User",
    createdAt: new Date("2023-03-30"),
    priority: "Medium",
    completionPercentage: 60,
  },
  {
    id: "proj-005",
    name: "Local Vendor Fair",
    description: "Organizing a fair to connect with local food vendors and suppliers",
    status: "On Hold",
    startDate: new Date("2023-08-01"),
    endDate: new Date("2023-08-02"),
    budget: 15000,
    manager: "John Smith",
    district: "Central State Cooperative",
    school: null,
    createdBy: "Admin User",
    createdAt: new Date("2023-05-25"),
    priority: "Low",
    completionPercentage: 30,
  },
]

function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>(sampleProjects)
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(sampleProjects)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  // New project form state
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "Planning",
    startDate: null as Date | null,
    endDate: null as Date | null,
    budget: "",
    manager: "",
    district: "",
    school: "",
    priority: "Medium",
  })

  // Schools for selected district
  const [availableSchools, setAvailableSchools] = useState<{ id: string; name: string }[]>([])

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserData
        setUserData(parsedUser)
      } catch (e) {
        console.error("Failed to parse user data:", e)
      }
    }
  }, [])

  // Update available schools when district changes
  useEffect(() => {
    if (newProject.district) {
      const district = districts.find((d) => d.id === newProject.district)
      setAvailableSchools(district?.schools || [])
    } else {
      setAvailableSchools([])
    }
  }, [newProject.district])

  // Filter projects based on search query, district, status, and active tab
  useEffect(() => {
    let filtered = [...projects]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (proj) =>
          proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proj.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by district
    if (selectedDistrict !== "All Districts") {
      filtered = filtered.filter((proj) => proj.district === selectedDistrict)
    }

    // Filter by status
    if (selectedStatus !== "All Statuses") {
      filtered = filtered.filter((proj) => proj.status === selectedStatus)
    }

    // Filter by tab
    if (activeTab === "active") {
      filtered = filtered.filter((proj) => proj.status === "In Progress" || proj.status === "Planning")
    } else if (activeTab === "completed") {
      filtered = filtered.filter((proj) => proj.status === "Completed")
    } else if (activeTab === "onhold") {
      filtered = filtered.filter((proj) => proj.status === "On Hold" || proj.status === "Cancelled")
    }

    setFilteredProjects(filtered)
  }, [searchQuery, selectedDistrict, selectedStatus, projects, activeTab])

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newProject.name || !newProject.district || !newProject.manager) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Create new project
    const newProj: Project = {
      id: `proj-${Math.floor(Math.random() * 1000)}`,
      name: newProject.name,
      description: newProject.description,
      status: newProject.status as "Planning",
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      budget: Number.parseFloat(newProject.budget) || 0,
      manager: projectManagers.find((m) => m.id === newProject.manager)?.name || "",
      district: districts.find((d) => d.id === newProject.district)?.name || "",
      school: newProject.school
        ? districts.find((d) => d.id === newProject.district)?.schools.find((s) => s.id === newProject.school)?.name ||
          null
        : null,
      createdBy: userData?.name || "Current User",
      createdAt: new Date(),
      priority: newProject.priority as "Medium",
      completionPercentage: 0,
    }

    setProjects([newProj, ...projects])
    setIsAddDialogOpen(false)
    toast({
      title: "Success",
      description: "Project created successfully",
      variant: "success",
    })

    // Reset form
    setNewProject({
      name: "",
      description: "",
      status: "Planning",
      startDate: null,
      endDate: null,
      budget: "",
      manager: "",
      district: "",
      school: "",
      priority: "Medium",
    })
  }

  const handleEditProject = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedProject && newProject.name && newProject.district && newProject.manager) {
      // Update project
      const updatedProjects = projects.map((proj) =>
        proj.id === selectedProject.id
          ? {
              ...proj,
              name: newProject.name,
              description: newProject.description,
              status: newProject.status as "Planning" | "In Progress" | "Completed" | "On Hold" | "Cancelled",
              startDate: newProject.startDate,
              endDate: newProject.endDate,
              budget: Number.parseFloat(newProject.budget) || 0,
              manager: projectManagers.find((m) => m.id === newProject.manager)?.name || proj.manager,
              district: districts.find((d) => d.id === newProject.district)?.name || proj.district,
              school: newProject.school
                ? districts.find((d) => d.id === newProject.district)?.schools.find((s) => s.id === newProject.school)
                    ?.name || null
                : null,
              priority: newProject.priority as "Low" | "Medium" | "High",
            }
          : proj,
      )

      setProjects(updatedProjects)
      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Project updated successfully",
        variant: "success",
      })
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
    }
  }

  const handleViewProject = (project: Project) => {
    setSelectedProject(project)
    setIsViewDialogOpen(true)
  }

  const handleEditClick = (project: Project) => {
    setSelectedProject(project)

    // Find IDs for the current project's district, school, and manager
    const districtId = districts.find((d) => d.name === project.district)?.id || ""
    const schoolId = project.school
      ? districts.find((d) => d.name === project.district)?.schools.find((s) => s.name === project.school)?.id || ""
      : ""
    const managerId = projectManagers.find((m) => m.name === project.manager)?.id || ""

    // Set form values
    setNewProject({
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget.toString(),
      manager: managerId,
      district: districtId,
      school: schoolId,
      priority: project.priority,
    })

    // Update available schools for the selected district
    if (districtId) {
      const district = districts.find((d) => d.id === districtId)
      setAvailableSchools(district?.schools || [])
    }

    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedProject) {
      // In a real app, you would call an API to delete the project
      const updatedProjects = projects.filter((proj) => proj.id !== selectedProject.id)
      setProjects(updatedProjects)
      setIsDeleteModalOpen(false)
      toast({
        title: "Success",
        description: "Project deleted successfully",
        variant: "success",
      })
    }
  }

  const isAdmin = userData?.role === "Administrator"

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Planning":
        return "bg-blue-50 text-blue-700"
      case "In Progress":
        return "bg-green-50 text-green-700"
      case "Completed":
        return "bg-purple-50 text-purple-700"
      case "On Hold":
        return "bg-amber-50 text-amber-700"
      case "Cancelled":
        return "bg-red-50 text-red-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  // Get priority badge color
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-blue-50 text-blue-700"
      case "Medium":
        return "bg-amber-50 text-amber-700"
      case "High":
        return "bg-red-50 text-red-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and track projects across your schools and districts.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Project Management</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="p-2">
                    <Label className="text-xs">District</Label>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Districts">All Districts</SelectItem>
                        {districts.map((district) => (
                          <SelectItem key={district.id} value={district.name}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-2">
                    <Label className="text-xs">Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Statuses">All Statuses</SelectItem>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription>View and manage projects for your schools and districts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="onhold">On Hold</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <ProjectTable
                projects={filteredProjects}
                onView={handleViewProject}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isAdmin={isAdmin}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            </TabsContent>
            <TabsContent value="active" className="space-y-4">
              <ProjectTable
                projects={filteredProjects}
                onView={handleViewProject}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isAdmin={isAdmin}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            </TabsContent>
            <TabsContent value="completed" className="space-y-4">
              <ProjectTable
                projects={filteredProjects}
                onView={handleViewProject}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isAdmin={isAdmin}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            </TabsContent>
            <TabsContent value="onhold" className="space-y-4">
              <ProjectTable
                projects={filteredProjects}
                onView={handleViewProject}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isAdmin={isAdmin}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>Create a new project for your school or district.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProject}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Brief description of the project"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Select
                  value={newProject.district}
                  onValueChange={(value) => setNewProject({ ...newProject, district: value, school: "" })}
                  required
                >
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">School (Optional)</Label>
                <Select
                  value={newProject.school}
                  onValueChange={(value) => setNewProject({ ...newProject, school: value })}
                  disabled={!newProject.district || availableSchools.length === 0}
                >
                  <SelectTrigger id="school">
                    <SelectValue
                      placeholder={availableSchools.length === 0 ? "No schools available" : "Select school"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="district-wide">District-wide (No specific school)</SelectItem>
                    {availableSchools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={newProject.status}
                  onValueChange={(value) => setNewProject({ ...newProject, status: value })}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={newProject.priority}
                  onValueChange={(value) => setNewProject({ ...newProject, priority: value })}
                  required
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <DatePicker
                  date={newProject.startDate}
                  setDate={(date) => setNewProject({ ...newProject, startDate: date })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <DatePicker
                  date={newProject.endDate}
                  setDate={(date) => setNewProject({ ...newProject, endDate: date })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Project Manager *</Label>
                <Select
                  value={newProject.manager}
                  onValueChange={(value) => setNewProject({ ...newProject, manager: value })}
                  required
                >
                  <SelectTrigger id="manager">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProject}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-name">Project Name *</Label>
                <Input
                  id="edit-name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Brief description of the project"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-district">District *</Label>
                <Select
                  value={newProject.district}
                  onValueChange={(value) => setNewProject({ ...newProject, district: value, school: "" })}
                  required
                >
                  <SelectTrigger id="edit-district">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-school">School (Optional)</Label>
                <Select
                  value={newProject.school}
                  onValueChange={(value) => setNewProject({ ...newProject, school: value })}
                  disabled={!newProject.district || availableSchools.length === 0}
                >
                  <SelectTrigger id="edit-school">
                    <SelectValue
                      placeholder={availableSchools.length === 0 ? "No schools available" : "Select school"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="district-wide">District-wide (No specific school)</SelectItem>
                    {availableSchools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select
                  value={newProject.status}
                  onValueChange={(value) => setNewProject({ ...newProject, status: value })}
                  required
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority *</Label>
                <Select
                  value={newProject.priority}
                  onValueChange={(value) => setNewProject({ ...newProject, priority: value })}
                  required
                >
                  <SelectTrigger id="edit-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <DatePicker
                  date={newProject.startDate}
                  setDate={(date) => setNewProject({ ...newProject, startDate: date })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <DatePicker
                  date={newProject.endDate}
                  setDate={(date) => setNewProject({ ...newProject, endDate: date })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-budget">Budget ($)</Label>
                <Input
                  id="edit-budget"
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-manager">Project Manager *</Label>
                <Select
                  value={newProject.manager}
                  onValueChange={(value) => setNewProject({ ...newProject, manager: value })}
                  required
                >
                  <SelectTrigger id="edit-manager">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Project Dialog */}
      {selectedProject && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProject.name}</DialogTitle>
              <DialogDescription>
                Created by {selectedProject.createdBy} on {format(new Date(selectedProject.createdAt), "MMMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getStatusBadgeClass(selectedProject.status)}>
                  {selectedProject.status}
                </Badge>
                <Badge variant="outline" className={getPriorityBadgeClass(selectedProject.priority)}>
                  {selectedProject.priority} Priority
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Description</h3>
                  <p className="text-sm text-gray-500">{selectedProject.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Project Timeline</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        {selectedProject.startDate
                          ? format(new Date(selectedProject.startDate), "MMM d, yyyy")
                          : "Not set"}{" "}
                        -{" "}
                        {selectedProject.endDate ? format(new Date(selectedProject.endDate), "MMM d, yyyy") : "Not set"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Budget</h3>
                    <p className="text-sm text-gray-500">${selectedProject.budget.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium">District</h3>
                  <p className="text-sm text-gray-500">{selectedProject.district}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">School</h3>
                  <p className="text-sm text-gray-500">
                    {selectedProject.school || "District-wide (No specific school)"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Project Manager</h3>
                  <p className="text-sm text-gray-500">{selectedProject.manager}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Completion Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${selectedProject.completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{selectedProject.completionPercentage}% Complete</p>
              </div>
            </div>

            <DialogFooter>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEditClick(selectedProject)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Button>
              )}
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {selectedProject && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Project"
          description={`Are you sure you want to delete "${selectedProject.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  )
}

interface ProjectTableProps {
  projects: Project[]
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  isAdmin: boolean
  getStatusBadgeClass: (status: string) => string
}

function ProjectTable({ projects, onView, onEdit, onDelete, isAdmin, getStatusBadgeClass }: ProjectTableProps) {
  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Planning":
        return <ClipboardList className="h-4 w-4 text-blue-500" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-green-500" />
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-purple-500" />
      case "On Hold":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "Cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <ClipboardList className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>District/School</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timeline</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No projects found
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{project.district}</span>
                    {project.school && <span className="text-xs text-muted-foreground">{project.school}</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(project.status)}
                    <Badge variant="outline" className={getStatusBadgeClass(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {project.startDate ? format(new Date(project.startDate), "MMM d, yyyy") : "Not set"} -{" "}
                  {project.endDate ? format(new Date(project.endDate), "MMM d, yyyy") : "Not set"}
                </TableCell>
                <TableCell>{project.manager}</TableCell>
                <TableCell>${project.budget.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => onView(project)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => onEdit(project)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(project)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <ToastContextProvider>
      <ProjectsContent />
    </ToastContextProvider>
  )
}
