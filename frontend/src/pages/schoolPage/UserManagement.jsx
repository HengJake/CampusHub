import { UserManagement as UserManagementComponent } from "../../component/schoolAdminDashboard/userManagement/UserManagement.jsx";
import { useLocation } from "react-router-dom";

export function UserManagement() {
  const location = useLocation();

  return (
    <UserManagementComponent
      selectedIntakeCourse={location.state?.selectedIntakeCourse}
      filterBy={location.state?.filterBy}
    />
  );
}

