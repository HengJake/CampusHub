import { CourseManagement } from "../../component/schoolAdminDashboard/CourseManagement";
import { ModuleManagement } from "../../component/schoolAdminDashboard/ModuleManagement";

import { Tabs, Tab, TabList, TabPanel, TabPanels } from "@chakra-ui/react";

export function CourseManagementPage() {
  return (
    <Tabs variant="enclosed" colorScheme="blue">
      <TabList>
        <Tab>Courses</Tab>
        <Tab>Modules</Tab>
      </TabList>

      <TabPanels>
        <TabPanel><CourseManagement /></TabPanel>
        <TabPanel><ModuleManagement /></TabPanel>
      </TabPanels>
    </Tabs>
  )
}

