// Helper functions for transport components

export const daysOfWeek = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' }
];

export const vehicleTypes = [
    { value: 'bus', label: 'Bus' },
    { value: 'car', label: 'Car' }
];

export const vehicleStatuses = [
    { value: 'available', label: 'Available' },
    { value: 'in_service', label: 'In Service' },
    { value: 'under_maintenance', label: 'Under Maintenance' },
    { value: 'inactive', label: 'Inactive' }
];

export const stopTypes = [
    { value: 'dorm', label: 'Dormitory' },
    { value: 'campus', label: 'Campus' },
    { value: 'bus_station', label: 'Bus Station' }
];

// Cache for day labels to avoid repeated lookups
const dayLabelCache = new Map();
export const getDayLabel = (dayNumber) => {
    if (dayLabelCache.has(dayNumber)) {
        return dayLabelCache.get(dayNumber);
    }
    const day = daysOfWeek.find(d => d.value === dayNumber);
    const label = day ? day.label : 'Unknown';
    dayLabelCache.set(dayNumber, label);
    return label;
};

// Cache for vehicle type labels
const vehicleTypeCache = new Map();
export const getVehicleTypeLabel = (type) => {
    if (vehicleTypeCache.has(type)) {
        return vehicleTypeCache.get(type);
    }
    const vehicleType = vehicleTypes.find(t => t.value === type);
    const label = vehicleType ? vehicleType.label : type;
    vehicleTypeCache.set(type, label);
    return label;
};

// Cache for vehicle status labels
const vehicleStatusCache = new Map();
export const getVehicleStatusLabel = (status) => {
    if (vehicleStatusCache.has(status)) {
        return vehicleStatusCache.get(status);
    }
    const vehicleStatus = vehicleStatuses.find(s => s.value === status);
    const label = vehicleStatus ? vehicleStatus.label : status;
    vehicleStatusCache.set(status, label);
    return label;
};

// Cache for stop type labels
const stopTypeCache = new Map();
export const getStopTypeLabel = (type) => {
    if (stopTypeCache.has(type)) {
        return stopTypeCache.get(type);
    }
    const stopType = stopTypes.find(t => t.value === type);
    const label = stopType ? stopType.label : type;
    stopTypeCache.set(type, label);
    return label;
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'available':
            return 'green';
        case 'in_service':
            return 'blue';
        case 'under_maintenance':
            return 'orange';
        case 'inactive':
            return 'red';
        default:
            return 'gray';
    }
};

// Cache for time format conversions
const timeFormatCache = new Map();
export const convertToTimeFormat = (timeString) => {
    if (!timeString) return '';

    // Check cache first
    const cacheKey = String(timeString);
    if (timeFormatCache.has(cacheKey)) {
        return timeFormatCache.get(cacheKey);
    }

    let result = '';

    // If it's already in HH:mm format, return as is
    if (typeof timeString === 'string' && /^\d{2}:\d{2}$/.test(timeString)) {
        result = timeString;
    }
    // If it's an ISO datetime string, extract time part
    else if (typeof timeString === 'string' && timeString.includes('T')) {
        try {
            const date = new Date(timeString);
            if (!isNaN(date.getTime())) {
                result = date.toTimeString().slice(0, 5); // Extract HH:mm part
            }
        } catch (e) {
            console.warn('Failed to parse datetime string:', timeString, e);
            result = '';
        }
    }
    // If it's a Date object, extract time part
    else if (timeString instanceof Date) {
        try {
            result = timeString.toTimeString().slice(0, 5); // Extract HH:mm part
        } catch (e) {
            console.warn('Failed to convert Date object to time string:', e);
            result = '';
        }
    }
    // If it's any other format, try to parse it as a date
    else {
        try {
            const date = new Date(timeString);
            if (!isNaN(date.getTime())) {
                result = date.toTimeString().slice(0, 5);
            }
        } catch (e) {
            console.warn('Failed to parse time value:', timeString, e);
            result = '';
        }
    }

    // Cache the result
    timeFormatCache.set(cacheKey, result);
    return result;
};

// Cache for formatted time strings
const formattedTimeCache = new Map();
export const formatTime = (timeString) => {
    if (!timeString) return 'N/A';

    // Check cache first
    const cacheKey = String(timeString);
    if (formattedTimeCache.has(cacheKey)) {
        return formattedTimeCache.get(cacheKey);
    }

    let result = 'N/A';

    // If it's already a time string like "HH:mm", format it nicely
    if (typeof timeString === 'string' && timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const minute = parseInt(minutes);

        // Convert to 12-hour format with AM/PM
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');

        result = `${displayHour}:${displayMinute} ${period}`;
    }
    // If it's a Date object, convert to readable time string
    else if (timeString instanceof Date) {
        result = timeString.toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit'
        });
    }
    // If it's a number (minutes since midnight), convert to time
    else if (typeof timeString === 'number') {
        const hours = Math.floor(timeString / 60);
        const minutes = timeString % 60;
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const displayMinute = minutes.toString().padStart(2, '0');

        result = `${displayHour}:${displayMinute} ${period}`;
    }

    // Cache the result
    formattedTimeCache.set(cacheKey, result);
    return result;
};

export const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';

    const start = formatTime(startTime);
    const end = formatTime(endTime);

    if (start === 'N/A' || end === 'N/A') return 'N/A';

    return `${start} - ${end}`;
};

// Cache for duration calculations
const durationCache = new Map();
export const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';

    // Create cache key
    const cacheKey = `${String(startTime)}-${String(endTime)}`;
    if (durationCache.has(cacheKey)) {
        return durationCache.get(cacheKey);
    }

    let startMinutes, endMinutes;

    // Convert start time to minutes since midnight
    if (typeof startTime === 'string' && startTime.includes(':')) {
        const [hours, minutes] = startTime.split(':');
        startMinutes = parseInt(hours) * 60 + parseInt(minutes);
    } else if (startTime instanceof Date) {
        startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    } else if (typeof startTime === 'number') {
        startMinutes = startTime;
    } else {
        return 'N/A';
    }

    // Convert end time to minutes since midnight
    if (typeof endTime === 'string' && endTime.includes(':')) {
        const [hours, minutes] = endTime.split(':');
        endMinutes = parseInt(hours) * 60 + parseInt(minutes);
    } else if (endTime instanceof Date) {
        endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    } else if (typeof endTime === 'number') {
        endMinutes = endTime;
    } else {
        return 'N/A';
    }

    // Handle overnight trips (end time is next day)
    if (endMinutes < startMinutes) {
        endMinutes += 24 * 60; // Add 24 hours
    }

    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    let result;
    if (hours === 0) {
        result = `${minutes} min`;
    } else if (minutes === 0) {
        result = `${hours} hr`;
    } else {
        result = `${hours} hr ${minutes} min`;
    }

    // Cache the result
    durationCache.set(cacheKey, result);
    return result;
};

// Clear cache function for memory management
export const clearUtilsCache = () => {
    dayLabelCache.clear();
    vehicleTypeCache.clear();
    vehicleStatusCache.clear();
    stopTypeCache.clear();
    timeFormatCache.clear();
    formattedTimeCache.clear();
    durationCache.clear();
};
