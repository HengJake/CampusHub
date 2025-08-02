import { CourseManagement } from "../../component/schoolAdminDashboard/IntakeCourseManagement/CourseManagement";
import { ModuleManagement } from "../../component/schoolAdminDashboard/IntakeCourseManagement/ModuleManagement";
import { IntakeManagement } from "../../component/schoolAdminDashboard/IntakeCourseManagement/IntakeManagement";
import { IntakeCoursesDisplay } from "../../component/schoolAdminDashboard/IntakeCourseManagement/IntakeCoursesDisplay";
import {
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Box
} from "@chakra-ui/react";


export function CourseManagementPage() {
  return (
    <Box>
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Intake</Tab>
          <Tab>Courses</Tab>
          <Tab>Modules</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={4} pt={5}><IntakeManagement /></TabPanel>
          <TabPanel p={0} pt={5}><CourseManagement /></TabPanel>
          <TabPanel p={0} pt={5}><ModuleManagement /></TabPanel>
        </TabPanels>
      </Tabs>
      <IntakeCoursesDisplay />
    </Box >
  )
}

