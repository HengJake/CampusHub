import { StudentManagement } from "../../component/schoolAdminDashboard/StudentManagement.jsx";
import { LecturerManagement } from "../../component/schoolAdminDashboard/LecturerManagement.jsx";
import { Tabs, Tab, TabList, TabPanel, TabPanels } from "@chakra-ui/react";

export function UserManagement() {
  return (
    <Tabs variant="enclosed" colorScheme="blue">
      <TabList>
        <Tab>Lecturer</Tab>
        <Tab>Students</Tab>
      </TabList>

      <TabPanels>
        <TabPanel p={0} pt={4}><LecturerManagement /></TabPanel>
        <TabPanel p={0} pt={4}><StudentManagement /></TabPanel>
      </TabPanels>
    </Tabs>
  )
}

