import { useState, useEffect } from "react"
import { useAcademicStore } from "../../../../store/academic.js"
import { useUserStore } from "../../../../store/user.js"
import { useAuthStore } from "../../../../store/auth.js"
import { useShowToast } from "../../../../store/utils/toast.js"

export function useStudentManagement() {
    // Basic hooks
    const { createUserWithoutJWT, modifyUser } = useUserStore()
    const {
        students,
        courses,
        intakeCourses,
        semesters,
        fetchCoursesBySchoolId,
        fetchStudentsBySchoolId,
        fetchIntakeCoursesBySchoolId,
        fetchSemestersBySchoolId,
        createStudent,
        updateStudent,
        deleteStudent,
    } = useAcademicStore()
    const { initializeAuth } = useAuthStore()
    const showToast = useShowToast()

    // State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        courseId: "",
        intakeId: "",
        currentYear: 1,
        currentSemester: 1,
    })
    const [isEdit, setIsEdit] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [studentToDelete, setStudentToDelete] = useState(null)

    // Validation
    const validateField = (field, value) => {
        switch (field) {
            case 'name':
                return !value.trim() ? "Name is required" : ""
            case 'email':
                return !value.trim() ? "Email is required" : ""
            case 'password':
                return !isEdit && !value ? "Password is required" : ""
            case 'phoneNumber':
                return !value.trim() ? "Phone is required" : ""
            case 'courseId':
                return !value ? "Course is required" : ""
            case 'intakeId':
                return !value ? "Intake is required" : ""
            default:
                return ""
        }
    }

    // Form handling
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const isFormValid = () => {
        return formData.name && formData.email && formData.phoneNumber &&
            formData.courseId && formData.intakeId &&
            (isEdit || formData.password)
    }

    // Filter students
    const filteredStudents = students.filter(student => {
        const matchesSearch = !searchTerm ||
            student.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || student.status === statusFilter
        return matchesSearch && matchesStatus
    })

    // CRUD Operations
    const handleSubmit = async () => {
        try {
            // Create user
            const userData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                role: "student"
            }
            const userResult = await createUserWithoutJWT(userData)
            console.log("🚀 ~ handleSubmit ~ userResult:", userResult)

            if (!userResult.success) {
                showToast.error("Error creating user", userResult.message)
                return
            }

            // Create student
            const studentData = {
                userId: userResult.data._id,
                intakeCourseId: formData.intakeCourseId,
                currentYear: formData.currentYear,
                currentSemester: formData.currentSemester,
                status: "enrolled",
            }

            const studentResult = await createStudent(studentData)

            if (!studentResult.success) {
                showToast.error("Error creating student", studentResult.message)
                return
            }

            showToast.success("Student created successfully")
            resetForm()
            fetchStudentsBySchoolId()
            return { success: true }
        } catch (error) {
            showToast.error("Error", error.message)
            return { success: false, message: error.message }
        }
    }

    const handleEdit = (student) => {
        setIsEdit(true)
        setSelectedStudent(student)
        setFormData({
            name: student.userId?.name || "",
            email: student.userId?.email || "",
            password: "",
            phoneNumber: student.userId?.phoneNumber || "",
            courseId: student.intakeCourseId?.courseId?._id || "",
            intakeId: student.intakeCourseId?.intakeId?._id || "",
            currentYear: student.currentYear || 1,
            currentSemester: student.currentSemester || 1,
        })
    }

    const handleUpdate = async () => {
        try {
            // Update user
            const userData = {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                role: "student"
            }

            if (formData.password) {
                userData.password = formData.password
            }

            const userResult = await modifyUser(selectedStudent.userId._id, userData)

            if (!userResult.success) {
                showToast.error("Error updating user", userResult.message)
                return
            }

            // Update student
            const studentData = {
                currentYear: formData.currentYear,
                currentSemester: formData.currentSemester,
            }

            const studentResult = await updateStudent(selectedStudent._id, studentData)

            if (!studentResult.success) {
                showToast.error("Error updating student", studentResult.message)
                return
            }

            showToast.success("Student updated successfully")
            resetForm()
            fetchStudentsBySchoolId()
            return { success: true }
        } catch (error) {
            showToast.error("Error", error.message)
            return { success: false, message: error.message }
        }
    }

    const handleDelete = async () => {
        try {
            const result = await deleteStudent(studentToDelete)
            if (result.success) {
                showToast.success("Student deleted successfully")
                fetchStudentsBySchoolId()
            } else {
                showToast.error("Error deleting student", result.message)
            }
        } catch (error) {
            showToast.error("Error", error.message)
        }
        setIsDeleteOpen(false)
        setStudentToDelete(null)
    }

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            phoneNumber: "",
            courseId: "",
            intakeId: "",
            currentYear: 1,
            currentSemester: 1,
        })
        setIsEdit(false)
        setSelectedStudent(null)
    }

    // Initialize data
    useEffect(() => {
        const init = async () => {
            const authResult = await initializeAuth()
            if (authResult.success) {
                fetchIntakeCoursesBySchoolId()
                fetchStudentsBySchoolId()
                fetchCoursesBySchoolId()
                fetchSemestersBySchoolId()
            }
        }
        init()
    }, [])

    // Update intakeCourseId when course or intake changes
    useEffect(() => {
        if (formData.courseId && formData.intakeId) {
            const found = intakeCourses.find(ic =>
                ic.courseId._id === formData.courseId &&
                ic.intakeId._id === formData.intakeId
            )
            if (found) {
                setFormData(prev => ({ ...prev, intakeCourseId: found._id }))
            }
        }
    }, [formData.courseId, formData.intakeId, intakeCourses])

    // Reset year and semester when course changes
    useEffect(() => {
        if (formData.courseId) {
            // Reset to default values when course changes
            setFormData(prev => ({
                ...prev,
                currentYear: 1,
                currentSemester: 1
            }))
        }
    }, [formData.courseId])

    return {
        // State
        formData,
        isEdit,
        selectedStudent,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        isDeleteOpen,
        setIsDeleteOpen,
        studentToDelete,
        setStudentToDelete,

        // Data
        students: filteredStudents,
        courses,
        intakeCourses,
        semesters,

        // Functions
        handleInputChange,
        isFormValid,
        handleSubmit,
        handleEdit,
        handleUpdate,
        handleDelete,
        resetForm,
    }
}
