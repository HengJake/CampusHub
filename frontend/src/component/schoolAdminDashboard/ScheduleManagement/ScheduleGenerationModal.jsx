import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Text,
    Checkbox,
} from "@chakra-ui/react"
import React from "react"

export default function ScheduleGenerationModal({
    isOpen,
    onClose,
    generateExam,
    setGenerateExam,
    onProceed,
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Schedule Generation Info</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text mb={2}>
                        This will generate an <strong>Excel template file</strong> for class schedules.
                    </Text>
                    <Text mb={2}>
                        <strong>Lecturers and rooms are assigned randomly</strong> for now.
                    </Text>
                    <Text mb={2}>
                        <strong>Note:</strong> If you check "Include Exam Schedule", both class and exam schedules will be combined in a single Excel file with a "type" column to differentiate them.
                    </Text>
                    <Text mb={2}>
                        <strong>Import:</strong> Once you have checked the schedule, import the generated Excel file to add schedules to the database.
                    </Text>
                    <Text>
                        Do you wish to proceed?
                    </Text>
                    <Checkbox
                        mt={3}
                        isChecked={generateExam}
                        onChange={(e) => setGenerateExam(e.target.checked)}
                    >
                        Include Exam Schedule
                    </Checkbox>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onProceed}>
                        Yes, Proceed
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
} 