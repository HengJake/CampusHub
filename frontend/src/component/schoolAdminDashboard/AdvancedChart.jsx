"use client"

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Box, Select, HStack, Text } from "@chakra-ui/react"
import { useState } from "react"
import { mockData } from "../../../../../Vercel Gen/V4/src/data/mockData"

const COLORS = ["#2B6CB0", "#4299E1", "#63B3ED", "#90CDF4", "#BEE3F8"]

export function AdvancedChart({ title = "Facility Usage Analytics" }) {
  const [chartType, setChartType] = useState("line")
  const [dataType, setDataType] = useState("bookings")

  const renderChart = () => {
    const data = mockData.chartData

    switch (chartType) {
      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey={dataType} stroke="#2B6CB0" fill="#2B6CB0" fillOpacity={0.3} />
          </AreaChart>
        )

      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey={dataType} fill="#2B6CB0" />
          </BarChart>
        )

      case "pie":
        const pieData = data.map((item, index) => ({
          name: item.name,
          value: item[dataType],
          color: COLORS[index % COLORS.length],
        }))
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )

      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataType}
              stroke="#2B6CB0"
              strokeWidth={3}
              dot={{ fill: "#2B6CB0", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        )
    }
  }

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="semibold">
          {title}
        </Text>
        <HStack spacing={3}>
          <Select size="sm" value={dataType} onChange={(e) => setDataType(e.target.value)} w="120px">
            <option value="bookings">Bookings</option>
            <option value="users">Users</option>
            <option value="revenue">Revenue</option>
          </Select>
          <Select size="sm" value={chartType} onChange={(e) => setChartType(e.target.value)} w="100px">
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="bar">Bar</option>
            <option value="pie">Pie</option>
          </Select>
        </HStack>
      </HStack>

      <Box h="350px">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}
