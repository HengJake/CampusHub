import {
    Box,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorModeValue
} from "@chakra-ui/react"
import { StudentManagement } from "./studentM/StudentManagement.jsx"
import { LecturerManagement } from "./lecturerM/LecturerManagement.jsx"

export function UserManagement({ selectedIntakeCourse, filterBy }) {
    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")

    return (
        <Box flex={1} minH="100vh" bg={bgColor}>
            <Tabs variant="enclosed" colorScheme="green">
                <TabList borderBottom="2px" borderColor={borderColor}>
                    <Tab
                        _selected={{
                            color: "green.500",
                            borderColor: "green.500",
                            bg: "green.50"
                        }}
                        _hover={{ bg: "green.50" }}
                    >
                        Student Management
                    </Tab>
                    <Tab
                        _selected={{
                            color: "blue.500",
                            borderColor: "blue.500",
                            bg: "blue.50"
                        }}
                        _hover={{ bg: "blue.50" }}
                    >
                        Lecturer Management
                    </Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <StudentManagement
                            selectedIntakeCourse={selectedIntakeCourse}
                            filterBy={filterBy}
                        />
                    </TabPanel>
                    <TabPanel>
                        <LecturerManagement
                            selectedIntakeCourse={selectedIntakeCourse}
                            filterBy={filterBy}
                        />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}
