import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button
} from "@chakra-ui/react"
import { StudentForm } from "./StudentForm.jsx"

export function StudentModal({
    isOpen,
    onClose,
    isEdit,
    formData,
    handleInputChange,
    handleSubmit,
    handleUpdate,
    isFormValid,
    courses,
    intakeCourses,
    semesters
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {isEdit ? "Edit Student" : "Add New Student"}
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <StudentForm
                        formData={formData}
                        handleInputChange={handleInputChange}
                        isEdit={isEdit}
                        courses={courses}
                        intakeCourses={intakeCourses}
                        semesters={semesters}
                    />
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={isEdit ? handleUpdate : handleSubmit}
                        isDisabled={!isFormValid()}
                    >
                        {isEdit ? "Update" : "Create"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
