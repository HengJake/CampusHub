import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    Box,
    Text,
    Badge,
    Grid,
    Card,
    CardBody,
} from "@chakra-ui/react";

export function ViewIntakeModal({
    isOpen,
    onClose,
    selectedIntake,
    getIntakeCoursesForIntake
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Intake Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {selectedIntake && (
                        <VStack spacing={4} align="stretch">
                            <HStack>
                                <Box>
                                    <Text fontSize="xl" fontWeight="bold">
                                        {selectedIntake.intakeName}
                                    </Text>
                                    <HStack>
                                        <Badge colorScheme="purple">{selectedIntake.intakeMonth}</Badge>
                                        <Badge colorScheme={selectedIntake.isActive ? "green" : "red"}>
                                            {selectedIntake.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                        <Badge colorScheme="blue">{selectedIntake.status}</Badge>
                                    </HStack>
                                </Box>
                            </HStack>

                            <Grid templateColumns="1fr 1fr" gap={4}>
                                <Box>
                                    <Text fontWeight="semibold">Registration Period:</Text>
                                    <Text fontSize="sm">
                                        {selectedIntake.registrationStartDate ? new Date(selectedIntake.registrationStartDate).toLocaleDateString() : "N/A"} -
                                        {selectedIntake.registrationEndDate ? new Date(selectedIntake.registrationEndDate).toLocaleDateString() : "N/A"}
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="semibold">Orientation Date:</Text>
                                    <Text>{selectedIntake.orientationDate ? new Date(selectedIntake.orientationDate).toLocaleDateString() : "N/A"}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="semibold">Examination Period:</Text>
                                    <Text fontSize="sm">
                                        {selectedIntake.examinationStartDate ? new Date(selectedIntake.examinationStartDate).toLocaleDateString() : "N/A"} -
                                        {selectedIntake.examinationEndDate ? new Date(selectedIntake.examinationEndDate).toLocaleDateString() : "N/A"}
                                    </Text>
                                </Box>
                            </Grid>

                            <Box>
                                <Text fontWeight="semibold">Assigned Courses:</Text>
                                <HStack wrap="wrap" mt={2}>
                                    {getIntakeCoursesForIntake(selectedIntake._id).map((ic) => (
                                        <Badge key={ic._id} colorScheme="green">
                                            {ic.courseId?.courseName || "Unknown Course"}
                                        </Badge>
                                    ))}
                                    {getIntakeCoursesForIntake(selectedIntake._id).length === 0 && (
                                        <Text color="gray.500">No courses assigned</Text>
                                    )}
                                </HStack>
                            </Box>

                            <Box>
                                <Text fontWeight="semibold">Academic Events ({selectedIntake.academicEvents?.length || 0}):</Text>
                                <VStack align="stretch" mt={2}>
                                    {(selectedIntake.academicEvents || []).map((event, index) => (
                                        <Card key={index} variant="outline" size="sm">
                                            <CardBody>
                                                <HStack justify="space-between">
                                                    <VStack align="start" spacing={1}>
                                                        <HStack>
                                                            <Text fontWeight="medium" fontSize="sm">{event.name}</Text>
                                                            <Badge size="sm" colorScheme="blue">{event.type}</Badge>
                                                        </HStack>
                                                        <Text fontSize="xs" color="gray.600">
                                                            {new Date(event.date).toLocaleDateString()}
                                                        </Text>
                                                        {event.description && (
                                                            <Text fontSize="xs">{event.description}</Text>
                                                        )}
                                                    </VStack>
                                                </HStack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                    {(!selectedIntake.academicEvents || selectedIntake.academicEvents.length === 0) && (
                                        <Text color="gray.500" fontSize="sm">No academic events scheduled</Text>
                                    )}
                                </VStack>
                            </Box>
                        </VStack>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}