// Common Pages (camelCase folder/file names, PascalCase components)
import Landing from "./pages/commonPage/landing/landing.jsx";
import Service from "./pages/commonPage/service/service.jsx";
import ContactUs from "./pages/commonPage/contactUs/contactUs.jsx";
import Pricing from "./pages/commonPage/pricing/pricing.jsx";
import Login from "./pages/commonPage/login/login.jsx";
import Signup from "./pages/commonPage/signup/signup.jsx";
import LoginCampushub from "./pages/commonPage/loginCampushub/loginCampushub.jsx";
import LoginSchool from "./pages/commonPage/loginSchool/loginSchool.jsx";
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
import "./general.scss";
import "./component/generalComponent.scss";

// set different bar for different pages
import SANavbar from "./component/navBar/schoolAdminNavBar.jsx";
import CANavbar from "./component/navBar/campusHubAdminNavBar.jsx";

import LNavbar from "./component/navBar/landingNavBar";
import RNavBar from "./component/navBar/registrationNavBar";
import SNavBar from "./component/navBar/studentNavBar";

function App() {
  // Set the cookie
  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie =
      name + "=" + encodeURIComponent(value) + expires + "; path=/";
    setUserRole(value);
  }

  // Delete a cookie
  function deleteCookie(name) {
    document.cookie =
      name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUserRole(null);
  }

  const path = useLocation().pathname;
  const [userRole, setUserRole] = useState(Cookies.get("userRole") || null);

  let RenderedNavbar;
  let margin;

  if (
    path === "/login" ||
    path === "/signup" ||
    path === "/login-campushub" ||
    path === "/login-school"
  ) {
    RenderedNavbar = <RNavBar />;
    margin = 0;
  } else if (userRole === "user") {
    RenderedNavbar = <SNavBar />;
    margin = "125px";
  } else if (userRole === "company") {
    RenderedNavbar = <CANavbar />;
    margin = "125px";
  } else if (userRole === "admin") {
    RenderedNavbar = <SANavbar />;
    margin = "125px";
  } else {
    RenderedNavbar = <LNavbar />;
    margin = "0";
  }

  const getBgColor = () => {
    switch (userRole) {
      case "user":
        return "brand.userBg";
      case "company":
        return "brand.companyBg";
      case "admin":
        return "brand.adminBg";
      default:
        return "brand.defaultBg";
    }
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg={getBgColor()}>
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
          <Route path="/login-campushub" element={<LoginCampushub />} />
          <Route path="/login-school" element={<LoginSchool />} />
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
