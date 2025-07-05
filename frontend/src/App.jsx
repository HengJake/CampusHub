// Common Pages (camelCase folder/file names, PascalCase components)
import Landing from "./pages/commonPage/landing/landing.jsx";
import Service from "./pages/commonPage/service/service.jsx";
import ContactUs from "./pages/commonPage/contactUs/contactUs.jsx";
import Pricing from "./pages/commonPage/pricing/pricing.jsx";
import Login from "./pages/commonPage/login/login.jsx";
import Signup from "./pages/commonPage/signup/signUpOuter.jsx";
import About from "./pages/commonPage/about/about.jsx";

// User Pages
import UserDashboard from "./pages/userPage/userDashboard/userDashboard.jsx";
import BookFacility from "./pages/userPage/bookFacility/bookFacility.jsx";
import BookLocker from "./pages/userPage/bookLocker/bookLocker.jsx";
import ParkingLot from "./pages/userPage/parkingLot/parkingLot.jsx";
import ClassroomFinder from "./pages/userPage/classroomFinder/classroomFinder.jsx";
import ClassSchedule from "./pages/userPage/classSchedule/classSchedule.jsx";
import Result from "./pages/userPage/result/result.jsx";
import Attendance from "./pages/userPage/attendance/attendance.jsx";
import BusSchedule from "./pages/userPage/busSchedule/busSchedule.jsx";
import CampusRide from "./pages/userPage/campusRide/campusRide.jsx";
import RideDetail from "./pages/userPage/campusRide/RideDetail.jsx";
import Feedback from "./pages/userPage/feedback/feedback.jsx";
import UserSetting from "./pages/userPage/userSetting/userSetting.jsx";
import UserProfile from "./pages/userPage/userProfile/userProfile.jsx";

// School Admin Pages
import AdminDashboard from "./pages/schoolAdminPage/adminDashboard/adminDashboard.jsx";
import StudentManagement from "./pages/schoolAdminPage/studentManagement/studentManagement.jsx";
import FacilityManagement from "./pages/schoolAdminPage/facilityManagement/facilityManagement.jsx";
import LockerManagement from "./pages/schoolAdminPage/lockerManagement/lockerManagement.jsx";
import ParkingManagement from "./pages/schoolAdminPage/parkingManagement/parkingManagement.jsx";
import BookingManagement from "./pages/schoolAdminPage/bookingManagement/bookingManagement.jsx";
import FeedbackManagement from "./pages/schoolAdminPage/feedbackManagement/feedbackManagement.jsx";
import AnnouncementManagement from "./pages/schoolAdminPage/announcementManagement/announcementManagement.jsx";
import AdminSetting from "./pages/schoolAdminPage/adminSetting/adminSetting.jsx";
import AdminProfile from "./pages/schoolAdminPage/adminProfile/adminProfile.jsx";

// CampusHub Admin Pages
import CampushubDashboard from "./pages/campusHubAdminPage/campushubDashboard/campushubDashboard.jsx";
import Subscription from "./pages/campusHubAdminPage/subscription/subscription.jsx";
import AnalyticalReport from "./pages/campusHubAdminPage/analyticalReport/analyticalReport.jsx";
import ClientManagement from "./pages/campusHubAdminPage/clientManagement/clientManagement.jsx";
import UserOversight from "./pages/campusHubAdminPage/userOversight/userOversight.jsx";
import CampushubSetting from "./pages/campusHubAdminPage/campushubSetting/campushubSetting.jsx";
import CampushubProfile from "./pages/campusHubAdminPage/campushubProfile/campushubProfile.jsx";

import { Box, Button } from "@chakra-ui/react";
import { Routes, Route, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useState } from "react";
import { useEffect } from "react";
import "./general.scss";
import "./component/generalComponent.scss";

// set different bar for different pages
import SANavbar from "./component/navBar/schoolAdminNavBar.jsx";
import CANavbar from "./component/navBar/campusHubAdminNavBar.jsx";

import LNavbar from "./component/navBar/landingNavBar";
import RNavBar from "./component/navBar/registrationNavBar";
import SNavBar from "./component/navBar/studentNavBar";

function App() {
  const path = useLocation().pathname;
  const [RenderedNavbar, setRenderedNavbar] = useState(null);
  const [margin, setMargin] = useState("0");
  const [bgColor, setBgColor] = useState("brand.defaultBg");

  const [userRole, setUserRole] = useState(Cookies.get("role") || null);

  // Determine role from path
  const detectRoleFromPath = (path) => {
    if (
      path === "/login" ||
      path === "/signup"
    ) {
      return "register";
    } else if (
      path === "/" ||
      path === "/service" ||
      path === "/contact-us" ||
      path === "/pricing" ||
      path === "/about"
    ) {
      return "landing";
    } else if (
      path.startsWith("/user-") ||
      path.startsWith("/book") ||
      path === "/parking-lot" ||
      path === "/class-schedule" ||
      path === "/classroom-finder" ||
      path === "/result" ||
      path === "/attendance" ||
      path === "/bus-schedule" ||
      path === "/campus-ride" ||
      path === "/ride-detail" ||
      path === "/feedback"
    ) {
      return "user";
    } else if (
      path.startsWith("/admin-") ||
      path.includes("-management") ||
      path === "/announcement-management"
    ) {
      return "admin";
    } else if (
      path.startsWith("/campushub-") ||
      path === "/subscription" ||
      path === "/client-management" ||
      path === "/analytical-report" ||
      path === "/user-oversight"
    ) {
      return "company";
    } else {
      return "landing"; // fallback
    }
  };

  useEffect(() => {
    const role = detectRoleFromPath(path);

    switch (role) {
      case "register":
        setRenderedNavbar(<RNavBar />);
        setMargin("0");
        setBgColor("brand.defaultBg");
        break;
      case "landing":
        setRenderedNavbar(<LNavbar />);
        setMargin("0");
        setBgColor("brand.defaultBg");
        break;
      case "user":
        setRenderedNavbar(<SNavBar />);
        setMargin("80px");
        setBgColor("brand.userBg");
        break;
      case "admin":
        setRenderedNavbar(<SANavbar />);
        setMargin("80px");
        setBgColor("brand.adminBg");
        break;
      case "company":
        setRenderedNavbar(<CANavbar />);
        setMargin("80px");
        setBgColor("brand.companyBg");
        break;
      default:
        setRenderedNavbar(<LNavbar />);
        setMargin("0");
        setBgColor("brand.defaultBg");
        break;
    }
  }, [path]);

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg={bgColor}>
      <Box display="flex">
        <Box height={"fit-content"} width={"100%"}>
          {RenderedNavbar}
        </Box>
      </Box>

      <Box ml={margin} flex="1" display={"flex"}>
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
          {/* Common Pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/service" element={<Service />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />

          {/* User Pages */}
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/book-facility" element={<BookFacility />} />
          <Route path="/book-locker" element={<BookLocker />} />
          <Route path="/parking-lot" element={<ParkingLot />} />
          <Route path="/classroom-finder" element={<ClassroomFinder />} />
          <Route path="/class-schedule" element={<ClassSchedule />} />
          <Route path="/result" element={<Result />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/bus-schedule" element={<BusSchedule />} />
          <Route path="/campus-ride" element={<CampusRide />} />
          <Route path="/ride-detail" element={<RideDetail />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/user-setting" element={<UserSetting />} />
          <Route path="/user-profile" element={<UserProfile />} />

          {/* School Admin Pages */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/student-management" element={<StudentManagement />} />
          <Route path="/facility-management" element={<FacilityManagement />} />
          <Route path="/locker-management" element={<LockerManagement />} />
          <Route path="/parking-management" element={<ParkingManagement />} />
          <Route path="/booking-management" element={<BookingManagement />} />
          <Route path="/feedback-management" element={<FeedbackManagement />} />
          <Route
            path="/announcement-management"
            element={<AnnouncementManagement />}
          />
          <Route path="/admin-setting" element={<AdminSetting />} />
          <Route path="/admin-profile" element={<AdminProfile />} />

          {/* CampusHub Admin Pages */}
          <Route path="/campushub-dashboard" element={<CampushubDashboard />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/analytical-report" element={<AnalyticalReport />} />
          <Route path="/client-management" element={<ClientManagement />} />
          <Route path="/user-oversight" element={<UserOversight />} />
          <Route path="/campushub-setting" element={<CampushubSetting />} />
          <Route path="/campushub-profile" element={<CampushubProfile />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
