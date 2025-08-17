import {
    Box,
    Button,
    HStack,
    Text,
    useDisclosure,
    VStack,
    useColorModeValue
} from "@chakra-ui/react"
import { FiPlus, FiDownload } from "react-icons/fi"
import { useStudentManagement } from "./useStudentManagement.js"
import { StudentFilters } from "./StudentFilters.jsx"
import { StudentTable } from "./StudentTable.jsx"
import { StudentModal } from "./StudentModal.jsx"
import ComfirmationMessage from "../../../common/ComfirmationMessage.jsx"

export function StudentManagement({ selectedIntakeCourse, filterBy }) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const bgColor = useColorModeValue("white", "gray.800")

    const {
        formData,
        isEdit,
        students,
        courses,
        intakeCourses,
        semesters,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        isDeleteOpen,
        setIsDeleteOpen,
        studentToDelete,
        setStudentToDelete,
        handleInputChange,
        isFormValid,
        handleSubmit,
        handleEdit,
        handleUpdate,
        handleDelete,
        resetForm,
    } = useStudentManagement()

    const openAddModal = () => {
        resetForm()
        onOpen()
    }

    const handleEditStudent = (student) => {
        handleEdit(student)
        onOpen()
    }

    const handleDeleteStudent = (studentId) => {
        setStudentToDelete(studentId)
        setIsDeleteOpen(true)
    }

    const handleModalClose = () => {
        onClose()
        resetForm()
    }

    return (
        <Box flex={1} minH="100vh">
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <HStack justify="space-between">
                    <Box>
                        <Text fontSize="2xl" fontWeight="bold" color="#333333">
                            Student Management
                        </Text>
                        <Text color="gray.600">Manage student accounts and information</Text>
                    </Box>
                    <HStack>
                        <Button leftIcon={<FiDownload />} variant="outline">
                            Export
                        </Button>
                        <Button leftIcon={<FiPlus />} bg="#344E41" color="white" onClick={openAddModal}>
                            Add Student
                        </Button>
                    </HStack>
                </HStack>

                {/* Filters */}
                <StudentFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                {/* Students Table */}
                <StudentTable
                    students={students}
                    onEdit={handleEditStudent}
                    onDelete={handleDeleteStudent}
                />

                {/* Add/Edit Modal */}
                <StudentModal
                    isOpen={isOpen}
                    onClose={handleModalClose}
                    isEdit={isEdit}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    handleUpdate={handleUpdate}
                    isFormValid={isFormValid}
                    courses={courses}
                    intakeCourses={intakeCourses}
                    semesters={semesters}
                />

                {/* Delete Confirmation */}
                <ComfirmationMessage
                    title="Confirm delete student?"
                    description="Student deleted won't be able to be restored"
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    onConfirm={handleDelete}
                />
            </VStack>
        </Box>
    );
}
