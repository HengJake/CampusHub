import { CourseManagement } from "../../component/schoolAdminDashboard/IntakeCourseManagement/CourseManagement";
import { ModuleManagement } from "../../component/schoolAdminDashboard/IntakeCourseManagement/ModuleManagement";
import { IntakeManagement } from "../../component/schoolAdminDashboard/IntakeCourseManagement/IntakeManagement";
import { IntakeCoursesDisplay } from "../../component/schoolAdminDashboard/IntakeCourseManagement/IntakeCoursesDisplay";
import { SemesterModuleManagement } from "../../component/schoolAdminDashboard/IntakeCourseManagement/SemesterModuleManagement";
import {
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Box,
  Grid,
  GridItem,
  VStack,
  Text,
  Divider
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export function CourseManagementPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (location.state?.activeTab !== undefined) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <Box >
      <VStack spacing={6} align="stretch">
        {/* Page Header */}
        <Box>
          <Text fontSize="3xl" fontWeight="bold" color="gray.800">
            Academic Management
          </Text>
          <Text color="gray.600">
            Manage intakes, courses, modules, and semester planning
          </Text>
        </Box>

        {/* Two Column Layout */}
        <Grid templateColumns={'1fr'} gap={8}>
          {/* Left Column - Intake Course & Semester Management */}
          <GridItem>
            <Box>
              <Text fontSize="xl" fontWeight="semibold" mb={4} color="gray.700">
                Course Planning & Semesters
              </Text>
              <Tabs variant="enclosed" colorScheme="blue" height="fit-content" index={activeTab} onChange={setActiveTab}>
                <TabList>
                  <Tab>Intake Courses</Tab>
                  <Tab>Semester Modules</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel p={4} pt={5}>
                    <IntakeCoursesDisplay />
                  </TabPanel>
                  <TabPanel p={4} pt={5}>
                    <SemesterModuleManagement />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </GridItem>

          {/* Right Column - Individual Data Management */}
          <GridItem>
            <Box>
              <Text fontSize="xl" fontWeight="semibold" mb={4} color="gray.700">
                Data Management
              </Text>
              <Tabs variant="enclosed" colorScheme="green" height="fit-content">
                <TabList>
                  <Tab>Intake</Tab>
                  <Tab>Courses</Tab>
                  <Tab>Modules</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel p={4} pt={5}>
                    <IntakeManagement />
                  </TabPanel>
                  <TabPanel p={4} pt={5}>
                    <CourseManagement />
                  </TabPanel>
                  <TabPanel p={4} pt={5}>
                    <ModuleManagement />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
}

