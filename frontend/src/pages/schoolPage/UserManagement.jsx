import { StudentManagement } from "../../component/schoolAdminDashboard/userManagement/StudentManagement.jsx";
import { LecturerManagement } from "../../component/schoolAdminDashboard/userManagement/LecturerManagement.jsx";
import { Tabs, Tab, TabList, TabPanel, TabPanels } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export function UserManagement() {
  const location = useLocation();
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  useEffect(() => {
    // Check if we have navigation state with a default tab
    if (location.state?.defaultTab !== undefined) {
      setActiveTabIndex(location.state.defaultTab);
    } else {
      setActiveTabIndex(0); // Default to first tab
    }
  }, [location.state]);

  return (
    <Tabs
      variant="enclosed"
      colorScheme="blue"
      index={activeTabIndex}
      onChange={(index) => setActiveTabIndex(index)}
    >
      <TabList>
        <Tab>Lecturer</Tab>
        <Tab>Students</Tab>
      </TabList>

      <TabPanels>
        <TabPanel p={0} pt={4}><LecturerManagement /></TabPanel>
        <TabPanel p={0} pt={4}>
          <StudentManagement
            selectedIntakeCourse={location.state?.selectedIntakeCourse}
            filterBy={location.state?.filterBy}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

