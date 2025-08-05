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
import ClassFinder from "./pages/studentPage/ClassFinder.jsx";
import StudentDashboard from "./pages/studentPage/StudentDashboard.jsx";
import Profile from "./pages/studentPage/Profile.jsx";
import Feedback from "./pages/studentPage/Feedback.jsx";
import Academic from "./pages/studentPage/Academic.jsx";
import Transportation from "./pages/studentPage/Transportation.jsx";
import StudyRoom from "./pages/studentPage/Booking.jsx";
import Parking from "./pages/studentPage/Parking.jsx";
import Locker from "./pages/studentPage/Locker.jsx";
import Schedule from "./pages/studentPage/Schedule.jsx";
import Exams from "./pages/studentPage/Exams.jsx";
import Attendance from "./pages/studentPage/Attendance.jsx";

// School Admin Pages
import { Dashboard as AdminDashboard } from "./pages/schoolPage/Dashboard.jsx";
import { UserManagement } from "./pages/schoolPage/UserManagement.jsx";
import FacilityManagement from "./pages/schoolPage/FacilityManagement.jsx";
import { ParkingManagement } from "./pages/schoolPage/ParkingManagement.jsx";
import { LockerManagement } from "./pages/schoolPage/LockerManagement.jsx";
import { BookingManagement } from "./pages/schoolPage/BookingManagement.jsx";
import { FeedbackManagement } from "./pages/schoolPage/FeedbackManagement.jsx";
import { AnnouncementManagement } from "./pages/schoolPage/AnnouncementManagement.jsx";
import { AdminSetting } from "./pages/schoolPage/AdminSetting.jsx";
import { AdminProfile } from "./pages/schoolPage/AdminProfile.jsx";
import { CourseManagementPage } from "./pages/schoolPage/CourseManagement.jsx";
import { AcademicOverview } from "./pages/schoolPage/AcademicOverview.jsx";
import ResultsManagement from "./pages/schoolPage/ResultsManagement.jsx";
import ScheduleManagement from "./pages/schoolPage/ScheduleManagement.jsx";

// CampusHub Admin Pages
import CampushubDashboard from "./pages/companyPage/dashboard.jsx";
import Subscription from "./pages/companyPage/subscription-tracking.jsx";
import AnalyticalReport from "./pages/companyPage/analytics.jsx";
import ClientManagement from "./pages/companyPage/client-management.jsx";
import UserOversight from "./pages/companyPage/user-oversight.jsx";
import CampushubSetting from "./pages/companyPage/profile-settings.jsx";


// set different bar for different pages
import LNavbar from "./component/navBar/landingNavBar";
import RNavBar from "./component/navBar/registrationNavBar";
import HeaderNavbar from "./component/navBar/HeaderNavbar";




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
    "/transportation",
    "/facility/parking",
    "/facility/room",
    "/facility/locker",
    "/facility/courts",
    "/academic/schedule",
    "/academic/exams",
    "/academic/attendance",
    "/class-finder"
  ];
  const adminRoutes = [
    "/admin-dashboard",
    "/student-management",
    "/facility-management",
    "/announcement-management",
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
    "/admin/courts",
    "/admin/results",
    "/admin/schedule"];
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
        setMargin("88px");
        setBgColor("brand.userBg");
        setAuthComponent(<StudentComponent />);
        break;
      case "admin":
        setRenderedNavbar(<HeaderNavbar role="schoolAdmin" />);
        setMargin("88px");
        setBgColor("brand.adminBg");
        setAuthComponent(<SchoolAdminComponent />);
        break;
      case "company":
        setRenderedNavbar(<HeaderNavbar role="companyAdmin" />);
        setMargin("88px");
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
        ml={{ base: 0, md: 0, lg: margin }}
        flex="1"
        display={"flex"}
        mt={"64px"}
        pr={{ base: 6, lg: 2 }}
        pl={{ base: 6, lg: 2 }}
        pt={6}
        maxW="100%"
      >
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
          <Route path="/class-finder" element={wrapWithAuth(<ClassFinder />)} />
          <Route path="/user-profile" element={wrapWithAuth(<Profile />)} />
          <Route path="/feedback" element={wrapWithAuth(<Feedback />)} />
          <Route path="/academic" element={wrapWithAuth(<Academic />)} />
          <Route path="/transportation" element={wrapWithAuth(<Transportation />)} />

          {/* User Pages - Facility/Academic subpages */}
          <Route path="/facility/room" element={wrapWithAuth(<StudyRoom />)} />
          <Route path="/facility/parking" element={wrapWithAuth(<Parking />)} />
          <Route path="/facility/locker" element={wrapWithAuth(<Locker />)} />
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
          <Route path="/admin/results" element={wrapWithAuth(<ResultsManagement />)} />
          <Route path="/admin/schedule" element={wrapWithAuth(<ScheduleManagement />)} />

          {/* CampusHub Admin Pages - Require company admin authentication */}
          <Route path="/campushub-dashboard" element={wrapWithAuth(<CampushubDashboard />)} />
          <Route path="/subscription" element={wrapWithAuth(<Subscription />)} />
          <Route path="/analytical-report" element={wrapWithAuth(<AnalyticalReport />)} />
          <Route path="/client-management" element={wrapWithAuth(<ClientManagement />)} />
          <Route path="/user-oversight" element={wrapWithAuth(<UserOversight />)} />
          <Route path="/campushub-setting" element={wrapWithAuth(<CampushubSetting />)} />

        </Routes>
      </Box>
    </Box>
  );
}

export default App;
