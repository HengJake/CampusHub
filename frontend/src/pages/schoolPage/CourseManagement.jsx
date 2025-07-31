import { CourseManagement } from "../../component/schoolAdminDashboard/IntakeCourseManagement/CourseManagement";
import { ModuleManagement } from "../../component/schoolAdminDashboard/IntakeCourseManagement/ModuleManagement";
import { IntakeManagement } from "../../component/schoolAdminDashboard/IntakeCourseManagement/IntakeManagement";

import { Tabs, Tab, TabList, TabPanel, TabPanels } from "@chakra-ui/react";

export function CourseManagementPage() {
  return (
    <Tabs variant="enclosed" colorScheme="blue">
      <TabList>
      <Tab>Intake</Tab>
        <Tab>Courses</Tab>
        <Tab>Modules</Tab>
      </TabList>

      <TabPanels>
        <TabPanel><IntakeManagement /></TabPanel>
        <TabPanel><CourseManagement /></TabPanel>
        <TabPanel><ModuleManagement /></TabPanel>
      </TabPanels>
    </Tabs>
  )
}

