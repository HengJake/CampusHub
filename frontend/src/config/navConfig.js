import { FiHome, FiLock, FiCalendar, FiClipboard, FiUsers, FiFileText, FiBook, FiBarChart2, FiList, FiInfo, FiGift, FiBookmark } from "react-icons/fi";
import { FaCar } from "react-icons/fa"

const navConfig = {
    student: [
        { label: "Dashboard", path: "/user-dashboard", icon: FiHome },
        {
            label: "Facility",
            icon: FaCar,
            children: [
                { label: "Parking", path: "/facility/parking", icon: FaCar },
                { label: "Locker", path: "/facility/locker", icon: FiLock },
                { label: "Courts", path: "/facility/courts", icon: FiCalendar }
            ]
        },
        {
            label: "Academic",
            icon: FiBook,
            children: [
                { label: "Schedule", path: "/academic/schedule", icon: FiCalendar },
                { label: "Exams", path: "/academic/exams", icon: FiCalendar },
                { label: "Attendance", path: "/academic/attendance", icon: FiClipboard }
            ]
        },
        { label: "Feedback", path: "/feedback", icon: FiFileText }
    ],

    schoolAdmin: [
        { label: "Dashboard", path: "/admin-dashboard", icon: FiHome },
        {
            label: "User Management",
            icon: FiUsers,
            children: [
                { label: "Users", path: "/student-management", icon: FiUsers },
                { label: "Logs", path: "/admin/logs", icon: FiList }
            ]
        },
        {
            label: "Facilities",
            icon: FaCar,
            children: [
                { label: "Parking", path: "/parking-management", icon: FaCar },
                { label: "Lockers", path: "/locker-management", icon: FiLock },
                { label: "Courts", path: "/admin/courts", icon: FiCalendar }
            ]
        },
        {
            label: "Academics",
            icon: FiBook,
            children: [
                { label: "Results", path: "/admin/results", icon: FiBarChart2 },
                { label: "Exam Schedule", path: "/admin/exams", icon: FiCalendar }
            ]
        },
        { label: "Reports", path: "/admin/reports", icon: FiFileText }
    ],

    companyAdmin: [
        { label: "Dashboard", path: "/campushub-dashboard", icon: FiHome },
        { label: "Company Info", path: "/company/info", icon: FiInfo },
        { label: "Offers", path: "/company/offers", icon: FiGift },
        { label: "Bookings", path: "/company/bookings", icon: FiBookmark }
    ]
};

export default navConfig; 