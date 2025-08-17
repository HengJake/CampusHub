import {
    Box,
    Button,
    Card,
    CardBody,
    HStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Avatar,
    Text,
    useColorModeValue,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    VStack
} from "@chakra-ui/react"
import { FiEdit, FiTrash2 } from "react-icons/fi"

export function StudentTable({
    students,
    onEdit,
    onDelete
}) {
    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")

    return (
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
                {/* Desktop Table View */}
                <Box display={{ base: "none", lg: "block" }}>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Student</Th>
                                <Th>Course</Th>
                                <Th>Year</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {students.map((student) => (
                                <Tr key={student._id}>
                                    <Td>
                                        <HStack>
                                            <Avatar size="sm" name={student.userId?.name} />
                                            <Box>
                                                <Text fontWeight="medium">{student.userId?.name}</Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    {student.userId?.email}
                                                </Text>
                                            </Box>
                                        </HStack>
                                    </Td>
                                    <Td>
                                        {student.intakeCourseId?.courseId?.courseName || "N/A"}
                                    </Td>
                                    <Td>{student.currentYear}</Td>
                                    <Td>
                                        <Badge colorScheme="green">{student.status}</Badge>
                                    </Td>
                                    <Td>
                                        <HStack spacing={2}>
                                            <Button
                                                size="sm"
                                                colorScheme="blue"
                                                onClick={() => onEdit(student)}
                                            >
                                                <FiEdit />
                                            </Button>
                                            <Button
                                                size="sm"
                                                colorScheme="red"
                                                onClick={() => onDelete(student._id)}
                                            >
                                                <FiTrash2 />
                                            </Button>
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>

                {/* Mobile Accordion View */}
                <Box display={{ base: "block", lg: "none" }}>
                    <Accordion allowMultiple>
                        {students.map((student) => (
                            <AccordionItem key={student._id}>
                                <h2>
                                    <AccordionButton>
                                        <HStack flex={1} align={"center"}>
                                            <VStack align={"start"}>
                                                <Badge colorScheme="gray">Year : {student.currentYear}</Badge>
                                                <Badge colorScheme="gray" variant={"outline"}>{student.intakeCourseId?.courseId?.courseCode || "N/A"}</Badge>
                                            </VStack>

                                            <Box as="span" textAlign="left">
                                                <Text fontWeight="medium">{student.userId?.name || "N/A"}</Text>
                                                <Text fontSize="sm" color="gray.600">{student.userId?.email || "N/A"}</Text>
                                            </Box>
                                        </HStack>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                    <VStack spacing={3} align="stretch">
                                        <Box>
                                            <Text fontWeight="semibold">Course:</Text>
                                            <Text>{student.intakeCourseId?.courseId?.courseName || "N/A"}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="semibold">Year:</Text>
                                            <Text>{student.currentYear}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="semibold">Semester:</Text>
                                            <Text>{student.currentSemester}</Text>
                                        </Box>
                                        <Box>
                                            <Text fontWeight="semibold">Status:</Text>
                                            <Badge colorScheme="green">{student.status}</Badge>
                                        </Box>
                                        <HStack spacing={2} justify="center" pt={2}>
                                            <Button
                                                size="sm"
                                                colorScheme="blue"
                                                onClick={() => onEdit(student)}
                                            >
                                                <FiEdit />
                                            </Button>
                                            <Button
                                                size="sm"
                                                colorScheme="red"
                                                onClick={() => onDelete(student._id)}
                                            >
                                                <FiTrash2 />
                                            </Button>
                                        </HStack>
                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Box>
            </CardBody>
        </Card >
    );
}
