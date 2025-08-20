import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Select,
    HStack,
    InputGroup,
    InputLeftElement
} from "@chakra-ui/react"
import { FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi"

export function StudentForm({
    formData,
    handleInputChange,
    isEdit,
    courses,
    intakeCourses,
    semesters
}) {
    // Get unique years and semesters for the selected course
    const getCourseSemesters = () => {
        if (!formData.courseId) return { years: [], semesters: [] }

        const courseSemesters = semesters.filter(semester =>
            semester.courseId._id === formData.courseId && semester.isActive
        )

        const ayears = [...new Set(courseSemesters.map(sem => sem.year))].sort()
        const asemesters = [...new Set(courseSemesters.map(sem => sem.semesterNumber))].sort()

        return { years: ayears, semesters: asemesters }
    }

    const { years, semesters: availableSemesters } = getCourseSemesters()

    return (
        <VStack spacing={4} align={"start"}>
            {/* User Information */}
            <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <InputGroup>
                    <InputLeftElement>
                        <FiUser />
                    </InputLeftElement>
                    <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter full name"
                    />
                </InputGroup>
            </FormControl>

            <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                    <InputLeftElement>
                        <FiMail />
                    </InputLeftElement>
                    <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email address"
                    />
                </InputGroup>
            </FormControl>

            {!isEdit && (
                <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                        <InputLeftElement>
                            <FiLock />
                        </InputLeftElement>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Enter password"
                        />
                    </InputGroup>
                </FormControl>
            )}

            <FormControl isRequired>
                <FormLabel>Phone Number</FormLabel>
                <InputGroup>
                    <InputLeftElement>
                        <FiPhone />
                    </InputLeftElement>
                    <Input
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="Enter phone number"
                    />
                </InputGroup>
            </FormControl>

            {/* Academic Information */}
            <FormControl isRequired>
                <FormLabel>Course</FormLabel>
                <Select
                    value={formData.courseId}
                    onChange={(e) => handleInputChange('courseId', e.target.value)}
                    placeholder="Select Course"
                >
                    {courses.map(course => (
                        <option key={course._id} value={course._id}>
                            {course.courseName}
                        </option>
                    ))}
                </Select>
            </FormControl>

            <FormControl isRequired>
                <FormLabel>Intake</FormLabel>
                <Select
                    value={formData.intakeId}
                    onChange={(e) => handleInputChange('intakeId', e.target.value)}
                    placeholder="Select Intake"
                    disabled={!formData.courseId}
                >
                    {intakeCourses
                        .filter(ic => ic.courseId._id === formData.courseId)
                        .map(ic => (
                            <option key={ic.intakeId._id} value={ic.intakeId._id}>
                                {ic.intakeId.intakeName}
                            </option>
                        ))}
                </Select>
            </FormControl>

            <HStack spacing={4}>
                <FormControl isRequired>
                    <FormLabel>Year</FormLabel>
                    <Select
                        value={formData.currentYear}
                        onChange={(e) => handleInputChange('currentYear', parseInt(e.target.value))}
                        disabled={!formData.courseId || years.length === 0}
                        placeholder="Select Year"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>Year {year}</option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Semester</FormLabel>
                    <Select
                        value={formData.currentSemester}
                        onChange={(e) => handleInputChange('currentSemester', parseInt(e.target.value))}
                        disabled={!formData.courseId || availableSemesters.length === 0}
                        placeholder="Select Semester"
                    >
                        {availableSemesters.map(semester => (
                            <option key={semester} value={semester}>Semester {semester}</option>
                        ))}
                    </Select>
                </FormControl>
            </HStack>
        </VStack>
    );
}
