import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Grid,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
} from "@chakra-ui/react";
import { AcademicEventsSection } from "./AcademicEventsSection";

export function IntakeFormModal({
    isOpen,
    onClose,
    isEditing,
    formData,
    setFormData,
    newEvent,
    setNewEvent,
    addAcademicEvent,
    removeAcademicEvent,
    handleSubmit,
    showToast
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent maxW="4xl">
                <ModalHeader>{isEditing ? "Edit Intake" : "Add New Intake"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Tabs>
                        <TabList>
                            <Tab>Basic Information</Tab>
                            <Tab>Academic Events</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Grid templateColumns="1fr 1fr" gap={4}>
                                    <FormControl isRequired>
                                        <FormLabel>Intake Name</FormLabel>
                                        <Input
                                            value={formData.intakeName}
                                            onChange={(e) => setFormData({ ...formData, intakeName: e.target.value })}
                                            placeholder="January 2024 Intake"
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Intake Month</FormLabel>
                                        <Select
                                            value={formData.intakeMonth}
                                            onChange={(e) => setFormData({ ...formData, intakeMonth: e.target.value })}
                                        >
                                            <option value="">Select Month</option>
                                            <option value="January">January</option>
                                            <option value="May">May</option>
                                            <option value="September">September</option>
                                        </Select>
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Registration Start Date</FormLabel>
                                        <Input
                                            type="date"
                                            value={formData.registrationStartDate}
                                            onChange={(e) => setFormData({ ...formData, registrationStartDate: e.target.value })}
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Registration End Date</FormLabel>
                                        <Input
                                            type="date"
                                            value={formData.registrationEndDate}
                                            onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Orientation Date</FormLabel>
                                        <Input
                                            type="date"
                                            value={formData.orientationDate}
                                            onChange={(e) => setFormData({ ...formData, orientationDate: e.target.value })}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="planning">Planning</option>
                                            <option value="registration_open">Registration Open</option>
                                            <option value="registration_closed">Registration Closed</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Active Status</FormLabel>
                                        <Select
                                            value={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </TabPanel>

                            <TabPanel>
                                <AcademicEventsSection
                                    formData={formData}
                                    setFormData={setFormData}
                                    newEvent={newEvent}
                                    setNewEvent={setNewEvent}
                                    addAcademicEvent={addAcademicEvent}
                                    removeAcademicEvent={removeAcademicEvent}
                                    showToast={showToast}
                                />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleSubmit}>
                        {isEditing ? "Update" : "Add"} Intake
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}