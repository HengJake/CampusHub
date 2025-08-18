import { FiBook, FiUsers, FiMonitor } from "react-icons/fi"

export const getStatusColor = (status) => {
    switch (status) {
        case "pending":
            return "yellow";
        case "confirmed":
            return "green";
        case "cancelled":
            return "red";
        case "completed":
            return "blue";
        default:
            return "gray";
    }
}

export const getStatusIcon = (status) => {
    if (typeof status !== 'boolean') return FiBook
    return status ? FiBook : FiBook
}

export const getTypeIcon = (type) => {
    if (!type || typeof type !== 'string') return FiBook
    switch (type) {
        case "Study Room":
            return FiBook
        case "Meeting Room":
            return FiUsers
        case "Seminar Hall":
            return FiMonitor
        default:
            return FiBook
    }
}

export const getTypeColor = (type) => {
    if (!type || typeof type !== 'string') return "gray"
    switch (type) {
        case "Study Room":
            return "blue"
        case "Meeting Room":
            return "purple"
        case "Seminar Hall":
            return "orange"
        default:
            return "gray"
    }
}

export const getCapacityCategory = (capacity) => {
    if (!capacity || typeof capacity !== 'number') return "Small"
    if (capacity <= 4) return "Small"
    if (capacity <= 12) return "Medium"
    return "Large"
}

export const getCapacityCategoryColor = (capacity) => {
    if (!capacity || typeof capacity !== 'number') return "green"
    if (capacity <= 4) return "green"
    if (capacity <= 12) return "blue"
    return "purple"
}

export const getDayOfWeek = (dateString) => {
    const date = new Date(dateString)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
}

export const getAvailableDays = (resource) => {
    if (!resource?.timeslots) return []
    return resource.timeslots.map(ts => ts.dayOfWeek)
}
