"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash2, Search } from "lucide-react"
import { ToastContextProvider, useToast } from "@/components/ui/toast-context"
import { AddCategoryModal } from "@/components/dashboard/add-category-modal"
import { EditCategoryModal } from "@/components/dashboard/edit-category-modal"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { Input } from "@/components/ui/input"

// Sample bid categories with proper IDs
const initialCategories = [
  { id: "CAT-001", name: "Frozen", description: "Frozen food items including vegetables, meats, and prepared meals" },
  { id: "CAT-002", name: "Bread", description: "Bread products including sandwich bread, rolls, and buns" },
  { id: "CAT-003", name: "Produce", description: "Fresh fruits and vegetables" },
  { id: "CAT-004", name: "Dairy", description: "Milk, cheese, yogurt, and other dairy products" },
  { id: "CAT-005", name: "Meat", description: "Fresh and processed meat products" },
  { id: "CAT-006", name: "Grocery", description: "Shelf-stable food items and pantry staples" },
  { id: "CAT-007", name: "Paper", description: "Paper products including napkins, plates, and towels" },
  { id: "CAT-008", name: "Cleaning", description: "Cleaning supplies and janitorial products" },
].sort((a, b) => a.name.localeCompare(b.name)) // Sort by name

function BidCategoriesContent() {
  const [categories, setCategories] = useState(initialCategories)
  const [displayedCategories, setDisplayedCategories] = useState(initialCategories)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Filter categories based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setDisplayedCategories(categories)
    } else {
      const filtered = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setDisplayedCategories(filtered)
    }
  }, [searchQuery, categories])

  const handleAddCategory = (category: { name: string; description: string }) => {
    // Generate a new ID with the format CAT-XXX
    const newId = `CAT-${(categories.length + 1).toString().padStart(3, "0")}`
    const newCategory = {
      id: newId,
      ...category,
    }
    const updatedCategories = [...categories, newCategory].sort((a, b) => a.name.localeCompare(b.name))
    setCategories(updatedCategories)
    setIsAddModalOpen(false)
    toast({
      title: "Category Added",
      description: `${category.name} has been added successfully.`,
      variant: "success",
    })
  }

  const handleEditCategory = (updatedCategory: { id: string; name: string; description: string }) => {
    const updatedCategories = categories
      .map((category) => (category.id === updatedCategory.id ? updatedCategory : category))
      .sort((a, b) => a.name.localeCompare(b.name))
    setCategories(updatedCategories)
    setIsEditModalOpen(false)
    toast({
      title: "Category Updated",
      description: `${updatedCategory.name} has been updated successfully.`,
      variant: "success",
    })
  }

  const handleDeleteClick = (category: any) => {
    setSelectedCategory(category)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      const updatedCategories = categories.filter((category) => category.id !== selectedCategory.id)
      setCategories(updatedCategories)
      setIsDeleteModalOpen(false)
      toast({
        title: "Category Deleted",
        description: `${selectedCategory.name} has been deleted successfully.`,
        variant: "success",
      })
      setSelectedCategory(null)
    }
  }

  const handleEditClick = (category: any) => {
    setSelectedCategory(category)
    setIsEditModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bid Categories</h1>
          <p className="text-muted-foreground mt-1">Manage bid categories that will be available when creating bids.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
          <CardTitle>Categories</CardTitle>
          <CardDescription>These categories will be available for selection when creating new bids.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-t border-b">
                <TableHead className="py-3 w-[120px]">ID</TableHead>
                <TableHead className="py-3">Category Name</TableHead>
                <TableHead className="py-3">Description</TableHead>
                <TableHead className="text-right py-3 w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? "No categories match your search."
                      : "No categories found. Add a category to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                displayedCategories.map((category, index) => (
                  <TableRow key={category.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <TableCell className="font-mono text-sm text-muted-foreground">{category.id}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => handleEditClick(category)}
                          title="Edit Category"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteClick(category)}
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      <AddCategoryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddCategory} />

      {/* Edit Category Modal */}
      {selectedCategory && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          category={selectedCategory}
          onSave={handleEditCategory}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete the "${selectedCategory?.name}" category? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}

export default function BidCategoriesPage() {
  return (
    <ToastContextProvider>
      <BidCategoriesContent />
    </ToastContextProvider>
  )
}
