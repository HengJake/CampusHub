import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Box } from "@chakra-ui/react"
import { mockData } from "../../store/TBI/mockData.js"

export function FacilityUsageChart() {
  return (
    <Box h="300px">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData.chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="bookings" stroke="#2B6CB0" strokeWidth={2} dot={{ fill: "#2B6CB0" }} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  )
}
