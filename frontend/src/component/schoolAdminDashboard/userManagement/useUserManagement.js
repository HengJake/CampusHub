import { useState, useEffect } from "react"
import { useAuthStore } from "../../../store/auth.js"
import { useShowToast } from "../../../store/utils/toast.js"

export function useUserManagement() {
    const { initializeAuth } = useAuthStore()
    const showToast = useShowToast()

    // Common state
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)

    // Common validation
    const validateField = (field, value) => {
        switch (field) {
            case 'name':
                return !value.trim() ? "Name is required" : ""
            case 'email':
                return !value.trim() ? "Email is required" : ""
            case 'password':
                return !value ? "Password is required" : ""
            case 'phoneNumber':
                return !value.trim() ? "Phone is required" : ""
            default:
                return ""
        }
    }

    // Common form validation
    const isBasicFormValid = (formData, isEdit = false) => {
        return formData.name && formData.email && formData.phoneNumber &&
            (isEdit || formData.password)
    }

    // Common delete handling
    const handleDelete = async (deleteFunction, itemId) => {
        try {
            const result = await deleteFunction(itemId)
            if (result.success) {
                showToast.success("Item deleted successfully")
                return { success: true }
            } else {
                showToast.error("Error deleting item", result.message)
                return { success: false, message: result.message }
            }
        } catch (error) {
            showToast.error("Error", error.message)
            return { success: false, message: error.message }
        } finally {
            setIsDeleteOpen(false)
            setItemToDelete(null)
        }
    }

    // Common form reset
    const resetBasicForm = (setFormData, setIsEdit, setSelectedItem) => {
        setFormData({
            name: "",
            email: "",
            password: "",
            phoneNumber: "",
        })
        setIsEdit(false)
        setSelectedItem(null)
    }

    // Initialize auth
    useEffect(() => {
        const init = async () => {
            await initializeAuth()
        }
        init()
    }, [])

    return {
        // State
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        isDeleteOpen,
        setIsDeleteOpen,
        itemToDelete,
        setItemToDelete,

        // Functions
        validateField,
        isBasicFormValid,
        handleDelete,
        resetBasicForm,
    }
}
