import { Box, Button } from "@chakra-ui/react";
import { Routes, Route, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { useState } from "react";
import "./general.scss";
import "./component/general/generalComponent.scss";

// general component
import LandingHome from "./pages/commonPage/landinghome/landinghome";
import SignUp from "./pages/commonPage/signup/signup";
import Login from "./pages/commonPage/login/login";

// common pages
import About from "./pages/commonPage/about/about";
import Pricing from "./pages/commonPage/pricing/pricing";
import Service from "./pages/commonPage/service/service";
import Contact from "./pages/commonPage/contact/contact";

// user side components
import TwoFAPage from "./pages/userSide/twofa/twofa";
import Dashboard from "./pages/userSide/dashboard/dashboard";
import Timetable from "./pages/userSide/timetable/timetable";
import Results from "./pages/userSide/results/results";
import OverallPerformance from "./pages/userSide/overall-performance/overall-performance";
import SignAttendance from "./pages/userSide/sign-attendance/sign-attendance";
import Profile from "./pages/userSide/profile/profile";
import EditProfile from "./pages/userSide/edit-profile/edit-profile";
import Settings from "./pages/userSide/settings/settings";
import ClassFinder from "./pages/userSide/class-finder/class-finder";
import BookingsDashboard from "./pages/userSide/bookings/bookings";
import BusSchedule from "./pages/userSide/bus-schedule/bus-schedule";
import Transport from "./pages/userSide/transport/transport";
import TransportBooking from "./pages/userSide/transport-booking/transport-booking";
import TransportBookingDetails from "./pages/userSide/transport-booking-details/transport-booking-details";
import MapParkingLot from "./pages/userSide/parking-map/parking-map";
import ParkingReservation from "./pages/userSide/bookings/bookings";
import ParkingPayment from "./pages/userSide/class-finder/class-finder";
import GymLockerBooking from "./pages/userSide/gym-locker-booking/gym-locker-booking";
import LockerPayment from "./pages/userSide/locker-payment/locker-payment";
import LockerDetails from "./pages/userSide/locker-details/locker-details";
import CourtBooking from "./pages/userSide/court-booking/court-booking";
import CourtPayment from "./pages/userSide/court-payment/court-payment";
import CourtPaymentDetails from "./pages/userSide/court-payment-details/court-payment-details";

// set different bar for different pages
import CANavbar from "./component/general/navBar/companyAdminNavBar";
import SANavbar from "./component/general/navBar/schoolAdminNavBar";

import LNavbar from "./component/general/navBar/landingNavBar";
import RNavBar from "./component/general/navBar/registrationNavBar";
import SNavBar from "./component/general/navBar/studentNavBar";

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

  if (path === "/login" || path === "/signup") {
    RenderedNavbar = <RNavBar />;
  } else if (userRole === "user") {
    RenderedNavbar = <SNavBar />;
  } else if (userRole === "admin") {
    RenderedNavbar = <CANavbar />;
  } else if (userRole === "moderator") {
    RenderedNavbar = <SANavbar />;
  } else {
    RenderedNavbar = <LNavbar />;
  }

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Box display="flex" flex="1">
        <Box height={"fit-content"} width={"100%"}>
          {RenderedNavbar}
        </Box>
      </Box>

      <Box ml={"125px"} flex="1">
        <Button onClick={() => setCookie("userRole", "admin", 7)}>
          Set Admin
        </Button>
        <Button onClick={() => setCookie("userRole", "user", 7)}>
          Set User
        </Button>
        <Button onClick={() => setCookie("userRole", "moderator", 7)}>
          Set Moderator
        </Button>
        <Button onClick={() => deleteCookie("userRole")}>Delete Cookie</Button>
        <Button onClick={() => alert(Cookies.get("userRole"))}>
          Log Cookies
        </Button>

        <Routes>
          {/* Basic Routes */}
          <Route path="/" element={<LandingHome />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/service" element={<Service />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/2fa" element={<TwoFAPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/results" element={<Results />} />
          <Route path="/overall-performance" element={<OverallPerformance />} />
          <Route path="/sign-attendance" element={<SignAttendance />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/class-finder" element={<ClassFinder />} />

          {/* Booking-related Routes */}
          <Route path="/bookings" element={<BookingsDashboard />} />
          <Route path="/bus-schedule" element={<BusSchedule />} />
          <Route path="/ride" element={<Transport />} />
          <Route path="/ride-booking" element={<TransportBooking />} />
          <Route
            path="/ride-booking-details"
            element={<TransportBookingDetails />}
          />
          <Route path="/parking-map" element={<MapParkingLot />} />
          <Route path="/parking-reservation" element={<ParkingReservation />} />
          <Route path="/parking-payment" element={<ParkingPayment />} />
          <Route path="/gym-locker-booking" element={<GymLockerBooking />} />
          <Route path="/locker-payment" element={<LockerPayment />} />
          <Route path="/locker-details" element={<LockerDetails />} />
          <Route path="/court-booking" element={<CourtBooking />} />
          <Route path="/court-payment" element={<CourtPayment />} />
          <Route
            path="/court-payment-details"
            element={<CourtPaymentDetails />}
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
