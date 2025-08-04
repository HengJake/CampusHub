import {
    FiHome,             // For dashboard
    FiUsers,            // For user management
    FiList,             // For logs
    FiBook,             // For academics
    FiBarChart2,        // For analytics and results
    FiFileText,         // For reports
    FiMessageSquare,    // For feedback
    FiBell,            // For announcements
    FiDollarSign,      // For subscription
    FiTrendingUp,       // For analytics
    FiUserCheck         // For user oversight
} from "react-icons/fi";
import { FaCar, FaParking, FaChalkboardTeacher } from "react-icons/fa";
import { MdMeetingRoom, MdClass, MdEventNote } from "react-icons/md";
import { GiLockers } from "react-icons/gi";
import { GoMegaphone } from "react-icons/go";

const navConfig = {
    student: [
        { label: "Dashboard", path: "/user-dashboard", icon: FiHome },
        { label: "Class Finder☑️", path: "/class-finder", icon: MdClass },
        {
            label: "Facility",
            icon: MdMeetingRoom,
            children: [
                { label: "Parking", path: "/facility/parking", icon: FaParking },
                { label: "Locker", path: "/facility/locker", icon: GiLockers },
                { label: "Courts", path: "/facility/courts", icon: MdMeetingRoom },
                { label: "Study Rooms", path: "/facility/room", icon: MdClass }
            ]
        },
        {
            label: "Academic",
            icon: FiBook,
            children: [
                { label: "Schedule☑️", path: "/academic/schedule", icon: MdEventNote },
                { label: "Exams", path: "/academic/exams", icon: FiFileText },
                { label: "Attendance", path: "/academic/attendance", icon: FiList }
            ]
        },
        { label: "Feedback", path: "/feedback", icon: FiMessageSquare }
    ],

    schoolAdmin: [
        { label: "Dashboard", path: "/admin-dashboard", icon: FiHome },
        { label: "Users☑️", path: "/student-management", icon: FiUsers },
        {
            label: "Facilities",
            icon: MdMeetingRoom,
            children: [
                { label: "Facility Overview", path: "/facility-management", icon: MdMeetingRoom },
                { label: "Parking", path: "/parking-management", icon: FaParking },
                { label: "Lockers", path: "/locker-management", icon: GiLockers },
                { label: "Courts", path: "/admin/courts", icon: MdMeetingRoom },
                { label: "Booking Management", path: "/booking-management", icon: MdEventNote }
            ]
        },
        {
            label: "Academics",
            icon: FiBook,
            children: [
                { label: "Academic Overview", path: "/academic-overview", icon: FiBook },
                { label: "Intake and Course☑️", path: "/course-management", icon: FaChalkboardTeacher },
                { label: "Results☑️", path: "/admin/results", icon: FiBarChart2 },
                { label: "Schedule Manager☑️", path: "/admin/schedule", icon: MdEventNote }
            ]
        },
        { label: "Feedback Management☑️", path: "/feedback-management", icon: FiMessageSquare },
        { label: "Announcement", path: "/announcement-management", icon: GoMegaphone },
    ],

    companyAdmin: [
        { label: "Dashboard", path: "/campushub-dashboard", icon: FiHome },
        { label: "Subscription", path: "/subscription", icon: FiDollarSign },
        { label: "Analytics", path: "/analytical-report", icon: FiTrendingUp },
        { label: "Client Management", path: "/client-management", icon: FiUsers },
        { label: "User Oversight", path: "/user-oversight", icon: FiUserCheck }
    ],
};

export default navConfig; 