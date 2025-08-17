// Main combined component
export { UserManagement } from './UserManagement.jsx'

// Individual management components
export { StudentManagement } from './studentM/StudentManagement.jsx'
export { LecturerManagement } from './lecturerM/LecturerManagement.jsx'

// Shared hooks
export { useUserManagement } from './useUserManagement.js'

// Student management sub-components
export { StudentTable } from './studentM/StudentTable.jsx'
export { StudentFilters } from './studentM/StudentFilters.jsx'
export { StudentForm } from './studentM/StudentForm.jsx'
export { StudentModal } from './studentM/StudentModal.jsx'
export { useStudentManagement } from './studentM/useStudentManagement.js'
