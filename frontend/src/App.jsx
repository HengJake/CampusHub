import { Box, Button } from "@chakra-ui/react";
import { Routes, Route, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useState } from "react";
import { useEffect } from "react";
import React from "react";
import "./general.scss";
import "./component/generalComponent.scss";

// middle ware to control auth
import { SchoolAdminComponent, LecturerComponent, StudentComponent, CompanyAdminComponent } from "./component/common/RoleBasedComponent.jsx";

// Common Pages (camelCase folder/file names, PascalCase components)
import Landing from "./pages/commonPage/landing/landing.jsx";
import Service from "./pages/commonPage/service/service.jsx";
import ContactUs from "./pages/commonPage/contactUs/contactUs.jsx";
import Pricing from "./pages/commonPage/pricing/pricing.jsx";
import Login from "./pages/commonPage/login/login.jsx";
import Signup from "./pages/commonPage/signup/signUpOuter.jsx";
import About from "./pages/commonPage/about/about.jsx";
// delete this when production
import AuthTest from "./pages/authTest.jsx";

// User Pages
// import UserDashboard from "./pages/userPage/userDashboard/userDashboard.jsx";
// import BookFacility from "./pages/userPage/bookFacility/bookFacility.jsx";
// import BookLocker from "./pages/userPage/bookLocker/bookLocker.jsx";
// import ParkingLot from "./pages/userPage/parkingLot/parkingLot.jsx";
// import ClassroomFinder from "./pages/userPage/classroomFinder/classroomFinder.jsx";
// import ClassSchedule from "./pages/userPage/classSchedule/classSchedule.jsx";
// import Result from "./pages/userPage/result/result.jsx";
// import Attendance from "./pages/userPage/attendance/attendance.jsx";
// import BusSchedule from "./pages/userPage/busSchedule/busSchedule.jsx";
// import CampusRide from "./pages/userPage/campusRide/campusRide.jsx";
// import RideDetail from "./pages/userPage/campusRide/RideDetail.jsx";
// import Feedback from "./pages/userPage/feedback/feedback.jsx";
// import UserSetting from "./pages/userPage/userSetting/userSetting.jsx";
// import UserProfile from "./pages/userPage/userProfile/userProfile.jsx";

// School Admin Pages
import { Dashboard as AdminDashboard } from "./pages/schoolAdminPage/Dashboard.jsx";
import { UserManagement } from "./pages/schoolAdminPage/UserManagement.jsx";
import { FacilityManagement } from "./pages/schoolAdminPage/FacilityManagement.jsx";
import { ParkingManagement } from "./pages/schoolAdminPage/ParkingManagement.jsx";
import { LockerManagement } from "./pages/schoolAdminPage/LockerManagement.jsx";
import { BookingManagement } from "./pages/schoolAdminPage/BookingManagement.jsx";
import { FeedbackManagement } from "./pages/schoolAdminPage/FeedbackManagement.jsx";
import { AnnouncementManagement } from "./pages/schoolAdminPage/AnnouncementManagement.jsx";
import { AdminSetting } from "./pages/schoolAdminPage/AdminSetting.jsx";
import { AdminProfile } from "./pages/schoolAdminPage/AdminProfile.jsx";
import { CourseManagementPage } from "./pages/schoolAdminPage/CourseManagement.jsx";
import { AcademicOverview } from "./pages/schoolAdminPage/AcademicOverview.jsx";

// CampusHub Admin Pages
import CampushubDashboard from "./pages/campusHubAdminPage/dashboard.jsx";
import Subscription from "./pages/campusHubAdminPage/subscription-tracking.jsx";
import AnalyticalReport from "./pages/campusHubAdminPage/analytics.jsx";
import ClientManagement from "./pages/campusHubAdminPage/client-management.jsx";
import UserOversight from "./pages/campusHubAdminPage/user-oversight.jsx";
import CampushubSetting from "./pages/campusHubAdminPage/profile-settings.jsx";
// import CampushubProfile from "./pages/campusHubAdminPage/campushubProfile/campushubProfile.jsx";


// set different bar for different pages
import LNavbar from "./component/navBar/landingNavBar";
import RNavBar from "./component/navBar/registrationNavBar";
import HeaderNavbar from "./component/navBar/HeaderNavbar";
import Sidebar from "./component/navBar/Sidebar";

import AdminLogs from "./pages/schoolAdminPage/AdminLogs.jsx";
import CourtsManagement from "./pages/schoolAdminPage/CourtsManagement.jsx";
import ResultsManagement from "./pages/schoolAdminPage/ResultsManagement.jsx";
import ExamsManagement from "./pages/schoolAdminPage/ExamsManagement.jsx";
import Reports from "./pages/schoolAdminPage/Reports.jsx";

import Parking from "./pages/userPage/Parking.jsx";
import Locker from "./pages/userPage/Locker.jsx";
import Courts from "./pages/userPage/Courts.jsx";
import Schedule from "./pages/userPage/Schedule.jsx";
import Exams from "./pages/userPage/Exams.jsx";
import Attendance from "./pages/userPage/Attendance.jsx";
import StudentDashboard from "./pages/userPage/StudentDashboard.jsx";
import Profile from "./pages/userPage/Profile.jsx";
import Feedback from "./pages/userPage/Feedback.jsx";
import Academic from "./pages/userPage/Academic.jsx";

import CompanyInfo from "./pages/campusHubAdminPage/CompanyInfo.jsx";
import Offers from "./pages/campusHubAdminPage/Offers.jsx";
import Bookings from "./pages/campusHubAdminPage/Bookings.jsx";

function App() {
  const path = useLocation().pathname;
  const [RenderedNavbar, setRenderedNavbar] = useState(null);
  const [margin, setMargin] = useState("0");
  const [bgColor, setBgColor] = useState("brand.defaultBg");
  const [authComponent, setAuthComponent] = useState(null);
  const [userRole, setUserRole] = useState(Cookies.get("role") || null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRoutes = [
    "/user-dashboard",
    "/user-profile",
    "/feedback",
    "/academic",
    "/facility",
    "/transportation",
    "/facility/parking",
    "/facility/locker",
    "/facility/courts",
    "/academic/schedule",
    "/academic/exams",
    "/academic/attendance"
  ];
  const adminRoutes = [
    "/admin-dashboard",
    "/student-management",
    "/facility-management",
    "/locker-management",
    "/parking-management",
    "/booking-management",
    "/feedback-management",
    "/academic-management",
    "/course-management",
    "/lecturer-management",
    "/admin-setting",
    "/admin-profile",
    "/academic-overview",
    "/admin/logs",
    "/admin/courts",
    "/admin/results",
    "/admin/exams",
    "/admin/reports"
  ];
  const companyRoutes = [
    "/campushub-dashboard",
    "/subscription",
    "/client-management",
    "/analytical-report",
    "/user-oversight",
    "/campushub-setting",
    "/campushub-profile",
    "/company/info",
    "/company/offers",
    "/company/bookings"
  ];

  const detectRoleFromPath = (path) => {
    // Registration pages
    if (path === "/login" || path === "/signup") {
      return "register";
    }

    // Landing pages
    if (["/", "/service", "/contact-us", "/pricing", "/about"].includes(path)) {
      return "landing";
    }

    // User pages
    if (userRoutes.includes(path)) {
      return "user";
    }

    // Admin pages
    if (adminRoutes.includes(path)) {
      return "admin";
    }

    // Company pages
    if (companyRoutes.includes(path)) {
      return "company";
    }

    // Fallback to landing
    return "landing";
  };

  useEffect(() => {
    const role = detectRoleFromPath(path);

    switch (role) {
      case "register":
        setRenderedNavbar(<RNavBar />);
        setMargin("0");
        setBgColor("brand.defaultBg");
        setAuthComponent(null);
        break;
      case "landing":
        setRenderedNavbar(<LNavbar />);
        setMargin("0");
        setBgColor("brand.defaultBg");
        setAuthComponent(null);
        break;
      case "user":
        setRenderedNavbar(<HeaderNavbar role="student" />);
        setMargin("80px");
        setBgColor("brand.userBg");
        setAuthComponent(<StudentComponent />);
        break;
      case "admin":
        setRenderedNavbar(<HeaderNavbar role="schoolAdmin" />);
        setMargin("80px");
        setBgColor("brand.adminBg");
        setAuthComponent(<SchoolAdminComponent />);
        break;
      case "company":
        setRenderedNavbar(<HeaderNavbar role="companyAdmin" />);
        setMargin("80px");
        setBgColor("brand.companyBg");
        setAuthComponent(<CompanyAdminComponent />);
        break;
      default:
        setRenderedNavbar(<LNavbar />);
        setMargin("0");
        setBgColor("brand.defaultBg");
        setAuthComponent(null)
        break;
    }
  }, [path]);

  // Helper function to wrap component in auth component
  const wrapWithAuth = (component) => {
    if (!authComponent) {
      return component;
    }

    return React.cloneElement(authComponent, {
      children: component,
      onAuthSuccess: ({ schoolId, role }) => {
        console.log(`✅ Authentication successful for ${role} at school ${schoolId}`);
      },
      onAuthError: (error) => {
        console.error('❌ Authentication failed:', error);
      }
    });
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg={bgColor}>
      <Box display="flex">
        <Box height={"fit-content"} width={"100%"}>
          {RenderedNavbar}
        </Box>
      </Box>

      <Box
        ml={margin}
        flex="1"
        display={"flex"}
        // mt={userRole === "student" ? "64px" : ""}
        mt={"64px"}
      >
        {/* <Button
          bg={"gray.900"}
          onClick={() => setCookie("userRole", "admin", 7)}
        >
          Set School
        </Button>
        <Button
          bg={"gray.900"}
          onClick={() => setCookie("userRole", "user", 7)}
        >
          Set User
        </Button>
        <Button
          bg={"gray.900"}
          onClick={() => setCookie("userRole", "company", 7)}
        >
          Set Company
        </Button>
        <Button bg={"gray.900"} onClick={() => deleteCookie("userRole")}>
          Delete Cookie
        </Button>
        <Button bg={"gray.900"} onClick={() => alert(Cookies.get("userRole"))}>
          Log Cookies
        </Button>  */}

        <Routes>
          {/* Common Pages - No auth required */}
          <Route path="/" element={<Landing />} />
          <Route path="/service" element={<Service />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/test" element={<AuthTest />} />

          {/* User Pages - Require student authentication */}
          <Route path="/user-dashboard" element={wrapWithAuth(<StudentDashboard />)} />
          <Route path="/user-profile" element={wrapWithAuth(<Profile />)} />
          <Route path="/feedback" element={wrapWithAuth(<Feedback />)} />
          <Route path="/academic" element={wrapWithAuth(<Academic />)} />
          <Route path="/facility" element={wrapWithAuth(<SFacilityManagement />)} />
          <Route path="/transportation" element={wrapWithAuth(<Transportation />)} />

          {/* User Pages - Facility/Academic subpages */}
          <Route path="/facility/parking" element={wrapWithAuth(<Parking />)} />
          <Route path="/facility/locker" element={wrapWithAuth(<Locker />)} />
          <Route path="/facility/courts" element={wrapWithAuth(<Courts />)} />
          <Route path="/academic/schedule" element={wrapWithAuth(<Schedule />)} />
          <Route path="/academic/exams" element={wrapWithAuth(<Exams />)} />
          <Route path="/academic/attendance" element={wrapWithAuth(<Attendance />)} />

          {/* School Admin Pages - Require school admin authentication */}
          <Route path="/admin-dashboard" element={wrapWithAuth(<AdminDashboard />)} />
          <Route path="/student-management" element={wrapWithAuth(<UserManagement />)} />
          <Route path="/facility-management" element={wrapWithAuth(<FacilityManagement />)} />
          <Route path="/locker-management" element={wrapWithAuth(<LockerManagement />)} />
          <Route path="/parking-management" element={wrapWithAuth(<ParkingManagement />)} />
          <Route path="/booking-management" element={wrapWithAuth(<BookingManagement />)} />
          <Route path="/feedback-management" element={wrapWithAuth(<FeedbackManagement />)} />
          <Route path="/academic-overview" element={wrapWithAuth(<AcademicOverview />)} />
          <Route path="/course-management" element={wrapWithAuth(<CourseManagementPage />)} />
          <Route path="/announcement-management" element={wrapWithAuth(<AnnouncementManagement />)} />
          <Route path="/admin-setting" element={wrapWithAuth(<AdminSetting />)} />
          <Route path="/admin-profile" element={wrapWithAuth(<AdminProfile />)} />

          {/* School Admin Pages - Additional */}
          <Route path="/admin/logs" element={wrapWithAuth(<AdminLogs />)} />
          <Route path="/admin/courts" element={wrapWithAuth(<CourtsManagement />)} />
          <Route path="/admin/results" element={wrapWithAuth(<ResultsManagement />)} />
          <Route path="/admin/exams" element={wrapWithAuth(<ExamsManagement />)} />
          <Route path="/admin/reports" element={wrapWithAuth(<Reports />)} />

          {/* CampusHub Admin Pages - Require company admin authentication */}
          <Route path="/campushub-dashboard" element={wrapWithAuth(<CampushubDashboard />)} />
          <Route path="/subscription" element={wrapWithAuth(<Subscription />)} />
          <Route path="/analytical-report" element={wrapWithAuth(<AnalyticalReport />)} />
          <Route path="/client-management" element={wrapWithAuth(<ClientManagement />)} />
          <Route path="/user-oversight" element={wrapWithAuth(<UserOversight />)} />
          <Route path="/campushub-setting" element={wrapWithAuth(<CampushubSetting />)} />
          {/* <Route path="/campushub-profile" element={wrapWithAuth(<CampushubProfile />)} /> */}

          {/* Company Admin Pages - Additional */}
          <Route path="/company/info" element={wrapWithAuth(<CompanyInfo />)} />
          <Route path="/company/offers" element={wrapWithAuth(<Offers />)} />
          <Route path="/company/bookings" element={wrapWithAuth(<Bookings />)} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
