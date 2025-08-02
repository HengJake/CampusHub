import {
    Box,
    Card,
    CardBody,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    HStack,
    VStack,
    Badge,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
    useColorModeValue,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from "@chakra-ui/react";
import { FiMoreVertical, FiEdit, FiTrash2, FiEye, FiBook } from "react-icons/fi";

export function IntakeTable({
    filteredIntakes,
    getIntakeCoursesForIntake,
    handleView,
    handleEdit,
    handleAssignCourses,
    openDeleteDialog
}) {
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    return (
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
                <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
                    Intakes ({filteredIntakes.length})
                </Text>

                {/* Desktop Table View */}
                <Box display={{ base: "none", lg: "block" }}>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Intake Name</Th>
                                <Th>Month</Th>
                                <Th>Registration Period</Th>
                                <Th>Status</Th>
                                <Th>Courses</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredIntakes.map((intake) => {
                                if (!intake) return null;
                                const assignedCourses = getIntakeCoursesForIntake(intake._id);

                                return (
                                    <Tr key={intake._id}>
                                        <Td>
                                            <Box>
                                                <Text fontWeight="medium">{intake.intakeName}</Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    {intake.isActive ? "Active" : "Inactive"}
                                                </Text>
                                            </Box>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme="purple">{intake.intakeMonth}</Badge>
                                        </Td>
                                        <Td>
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="sm">
                                                    Start: {intake.registrationStartDate ? new Date(intake.registrationStartDate).toLocaleDateString() : "N/A"}
                                                </Text>
                                                <Text fontSize="sm">
                                                    End: {intake.registrationEndDate ? new Date(intake.registrationEndDate).toLocaleDateString() : "N/A"}
                                                </Text>
                                            </VStack>
                                        </Td>
                                        <Td>
                                            <Badge
                                                colorScheme={
                                                    intake.status === "completed" ? "green" :
                                                        intake.status === "in_progress" ? "blue" :
                                                            intake.status === "registration_open" ? "orange" :
                                                                intake.status === "registration_closed" ? "red" : "gray"
                                                }
                                            >
                                                {intake.status}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <HStack>
                                                <Badge colorScheme={assignedCourses.length > 0 ? "green" : "red"}>
                                                    {assignedCourses.length} courses
                                                </Badge>
                                                <Button
                                                    size="xs"
                                                    colorScheme="blue"
                                                    variant="outline"
                                                    leftIcon={<FiBook />}
                                                    onClick={() => handleAssignCourses(intake)}
                                                >
                                                    Assign
                                                </Button>
                                            </HStack>
                                        </Td>
                                        <Td>
                                            <Menu>
                                                <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                                                <MenuList>
                                                    <MenuItem icon={<FiEye />} onClick={() => handleView(intake)}>
                                                        View Details
                                                    </MenuItem>
                                                    <MenuItem icon={<FiEdit />} onClick={() => handleEdit(intake)}>
                                                        Edit
                                                    </MenuItem>
                                                    <MenuItem icon={<FiBook />} onClick={() => handleAssignCourses(intake)}>
                                                        Assign Courses
                                                    </MenuItem>
                                                    <MenuItem icon={<FiTrash2 />} onClick={() => openDeleteDialog(intake._id)} color="red.500">
                                                        Delete
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </Td>
                                    </Tr>
                                )
                            })}
                        </Tbody>
                    </Table>
                </Box>

                {/* Mobile Accordion View */}
                <Box display={{ base: "block", lg: "none" }}>
                    <Accordion allowMultiple>
                        {filteredIntakes.map((intake) => {
                            if (!intake) return null;
                            const assignedCourses = getIntakeCoursesForIntake(intake._id);

                            return (
                                <AccordionItem key={intake._id}>
                                    <h2>
                                        <AccordionButton>
                                            <Box as="span" flex="1" textAlign="left">
                                                <Text fontWeight="medium">{intake.intakeName}</Text>
                                                <Text fontSize="sm" color="gray.600">{intake.intakeMonth}</Text>
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4}>
                                        <VStack spacing={3} align="stretch">
                                            <Box>
                                                <Text fontWeight="semibold">Status:</Text>
                                                <Badge colorScheme={intake.status === "completed" ? "green" : "blue"}>
                                                    {intake.status}
                                                </Badge>
                                            </Box>
                                            <Box>
                                                <Text fontWeight="semibold">Registration Period:</Text>
                                                <Text fontSize="sm">
                                                    {intake.registrationStartDate ? new Date(intake.registrationStartDate).toLocaleDateString() : "N/A"} -
                                                    {intake.registrationEndDate ? new Date(intake.registrationEndDate).toLocaleDateString() : "N/A"}
                                                </Text>
                                            </Box>
                                            <Box>
                                                <Text fontWeight="semibold">Assigned Courses:</Text>
                                                <Badge colorScheme={assignedCourses.length > 0 ? "green" : "red"}>
                                                    {assignedCourses.length} courses
                                                </Badge>
                                            </Box>
                                            <HStack spacing={2} justify="center" pt={2}>
                                                <Button size="sm" colorScheme="blue" onClick={() => handleView(intake)}>
                                                    <FiEye />
                                                </Button>
                                                <Button size="sm" colorScheme="blue" onClick={() => handleEdit(intake)}>
                                                    <FiEdit />
                                                </Button>
                                                <Button size="sm" colorScheme="green" onClick={() => handleAssignCourses(intake)}>
                                                    <FiBook />
                                                </Button>
                                                <Button size="sm" colorScheme="red" onClick={() => openDeleteDialog(intake._id)}>
                                                    <FiTrash2 />
                                                </Button>
                                            </HStack>
                                        </VStack>
                                    </AccordionPanel>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                </Box>
            </CardBody>
        </Card>
    );
}