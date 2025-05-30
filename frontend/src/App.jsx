import { Box } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import "./general.scss";

// general component
import Navbar from "./component/general/navBar/navBar";
import LandingHome from "./pages/commonPage/landinghome/landinghome";
import SignUp from "./pages/commonPage/signup/signup";
import Login from "./pages/commonPage/login/login";

// user side components
import TwoFAPage from "./pages/userSide/twofa/twofa";
import Dashboard from "./component/userSide/dashboard/dashboard";
import Timetable from "./pages/userSide/timetable/timetable";
import Results from "./pages/userSide/results/results";
import OverallPerformance from "./pages/userSide/overall-performance/overall-performance";
import SignAttendance from "./pages/userSide/sign-attendance/sign-attendance";
import Profile from "./pages/userSide/profile/profile";
import EditProfile from "./component/userSide/edit-profile/edit-profile";
import Settings from "./pages/userSide/settings/settings";
import ClassFinder from "./component/userSide/class-finder/class-finder";
import BookingsDashboard from "./component/userSide/bookings/bookings";
import Transport from "./pages/userSide/transport/transport";
import TransportBooking from "./pages/userSide/transport-booking/transport-booking";
import TransportBookingDetails from "./pages/userSide/transport-booking-details/transport-booking-details";
import MapParkingLot from "./pages/userSide/parking-map/parking-map";
import ParkingReservation from "./pages/userSide/parking-reservation/parking-reservation";
import ParkingPayment from "./pages/userSide/parking-payment/parking-payment";
import GymLockerBooking from "./component/userSide/gym-locker-booking/gym-locker-booking";
import LockerPayment from "./component/userSide/locker-payment/locker-payment";
import LockerDetails from "./component/userSide/locker-details/locker-details";
import CourtBooking from "./component/userSide/court-booking/court-booking";
import CourtPayment from "./component/userSide/court-payment/court-payment";
import CourtPaymentDetails from "./component/userSide/court-payment-details/court-payment-details";

function App() {
  return (
    <Box minH="100vh">
      <Navbar />
      <Routes>
        {/* Basic Routes */}
        <Route path="/" element={<LandingHome />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
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
        <Route path="/transport" element={<Transport />} />
        <Route path="/transport-booking" element={<TransportBooking />} />
        <Route
          path="/transport-booking-details"
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
  );
}

export default App;
