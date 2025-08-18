import { Tr, Td, Text, Badge, VStack, IconButton } from "@chakra-ui/react"
import { FiTrash2 } from "react-icons/fi"
import { getTypeColor, getStatusColor } from "./utils"

const BookingRow = ({ booking, onDelete }) => {
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatTime = (timeString) => {
        if (!timeString) return "-";
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    };

    const calculateDuration = (startTime, endTime) => {
        const start = new Date(`2024-01-01 ${startTime}`)
        const end = new Date(`2024-01-01 ${endTime}`)
        const duration = (end - start) / (1000 * 60 * 60)
        return duration > 0 ? `${duration.toFixed(1)}h` : "-"
    }

    return (
        <Tr key={booking?._id || Math.random()}>
            <Td>
                <Text fontWeight="medium">{booking?.resourceId?.name || "-"}</Text>
            </Td>
            <Td>
                <Badge colorScheme={getTypeColor(booking?.resourceId?.type)} variant="subtle">
                    {booking?.resourceId?.type || "-"}
                </Badge>
            </Td>
            <Td>
                <VStack align="start" spacing={0}>
                    <Text fontSize="sm">{formatDate(booking?.bookingDate)}</Text>
                    <Text fontSize="xs" color="gray.600">
                        {formatTime(booking?.startTime)} - {formatTime(booking?.endTime)}
                    </Text>
                </VStack>
            </Td>
            <Td>
                <Text fontSize="sm">
                    {calculateDuration(booking?.startTime, booking?.endTime)}
                </Text>
            </Td>
            <Td>
                <Badge colorScheme={getStatusColor(booking?.status)}>
                    {(booking?.status || "-")?.toUpperCase()}
                </Badge>
            </Td>
            <Td>
                <IconButton
                    icon={<FiTrash2 />}
                    colorScheme="red"
                    size="sm"
                    onClick={() => onDelete(booking)}
                    aria-label="Delete booking"
                />
            </Td>
        </Tr>
    )
}

export default BookingRow
