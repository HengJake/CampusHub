import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Box, HStack, IconButton, Text, VStack } from "@chakra-ui/react"
import { useFacilityStore } from "../../store/facility.js"
import { useEffect, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons"

export function FacilityUsageChart() {
  const { bookings, fetchBookings } = useFacilityStore()
  const [chartData, setChartData] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month' or 'year'

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    if (bookings.length > 0) {
      const processedData = processBookingData(bookings, currentDate, viewMode)
      setChartData(processedData)
    }
  }, [bookings, currentDate, viewMode])

  const processBookingData = (bookingData, selectedDate, mode) => {
    // Initialize day counts
    const dayCounts = {
      'Monday': 0,
      'Tuesday': 0,
      'Wednesday': 0,
      'Thursday': 0,
      'Friday': 0,
      'Saturday': 0,
      'Sunday': 0
    }

    // Get date range based on mode
    const startDate = new Date(selectedDate)
    const endDate = new Date(selectedDate)

    if (mode === 'month') {
      startDate.setDate(1)
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(0) // Last day of current month
    } else if (mode === 'year') {
      startDate.setMonth(0, 1) // January 1st
      endDate.setMonth(11, 31) // December 31st
    }

    // Process each booking within the date range
    bookingData.forEach(booking => {
      if (booking.bookingDate) {
        const bookingDate = new Date(booking.bookingDate)

        // Check if booking is within the selected date range
        if (bookingDate >= startDate && bookingDate <= endDate) {
          const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long' })

          if (dayCounts.hasOwnProperty(dayOfWeek)) {
            dayCounts[dayOfWeek]++
          }
        }
      }
    })

    // Convert to chart data format
    return Object.entries(dayCounts).map(([day, count]) => ({
      name: day,
      bookings: count
    }))
  }

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate)

    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction)
    } else if (viewMode === 'year') {
      newDate.setFullYear(newDate.getFullYear() + direction)
    }

    setCurrentDate(newDate)
  }

  const formatDisplayDate = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    } else if (viewMode === 'year') {
      return currentDate.getFullYear().toString()
    }
    return ''
  }

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'month' ? 'year' : 'month')
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="bold">
          Facility Usage - {formatDisplayDate()}
        </Text>
        <HStack spacing={2}>
          <IconButton
            aria-label="Previous period"
            icon={<ChevronLeftIcon />}
            size="sm"
            onClick={() => navigateDate(-1)}
          />
          <IconButton
            aria-label="Toggle view mode"
            size="sm"
            onClick={toggleViewMode}
            variant="outline"
            color={"gray.600"}
          >
            <Text fontSize="sm" fontWeight="bold">
              {viewMode === 'month' ? 'M' : 'Y'}
            </Text>
          </IconButton>
          <IconButton
            aria-label="Next period"
            icon={<ChevronRightIcon />}
            size="sm"
            onClick={() => navigateDate(1)}
          />
        </HStack>
      </HStack>

      <Box h="300px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bookings" stroke="#2B6CB0" strokeWidth={2} dot={{ fill: "#2B6CB0" }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </VStack>
  )
}
