"use client"

import { Box, Flex, Text, Icon } from "@chakra-ui/react"
import { Accessibility } from "lucide-react" // Lucide icons are still useful

export function LockerCard({ id, status, isAccessible, onClick }) {
  let bgColor = "gray.200"
  let textColor = "gray.700"
  let cursor = "pointer"
  let hoverBg = "gray.300"

  if (status === "booked") {
    bgColor = "#E74C3C" // Red
    textColor = "white"
    cursor = "not-allowed"
    hoverBg = "#E74C3C" // No hover effect for booked
  } else if (status === "accessible") {
    bgColor = "#3498DB" // Blue
    textColor = "white"
    hoverBg = "#2980B9"
  }

  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      borderRadius="lg"
      w="130px"
      h="180px"
      fontSize="lg"
      fontWeight="semibold"
      boxShadow="sm"
      cursor={cursor}
      transition="background-color 0.2s"
      bg={bgColor}
      color={textColor}
      _hover={{ bg: hoverBg }}
      opacity={status === "booked" ? 0.7 : 1}
      onClick={() => status !== "booked" && onClick(id)}
      aria-label={`Locker ${id}, status: ${status}`}
      role="button"
      tabIndex={status === "booked" ? -1 : 0}
    >
      <Text>{id.toString().padStart(2, "0")}</Text>
      <Box position="absolute" right={2} top={2} h={8} w={2} borderRadius="full" bg="white" /> {/* Handle */}
      {isAccessible && <Icon as={Accessibility} position="absolute" bottom={2} right={2} h={6} w={6} color="white" />}
    </Flex>
  )
}
