"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react"; // Still using Lucide icons

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
  Text,
  FormControl,
  FormLabel,
  RadioGroup,
  Stack,
  Radio,
  Select,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useDisclosure, // Chakra hook for modal state
  Input,
} from "@chakra-ui/react";

export function BookingDialog({ isOpen, onClose, lockerId }) {
  const [date, setDate] = useState(new Date());
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("AM");
  const [duration, setDuration] = useState("1"); // in hours
  const [bookingPeriod, setBookingPeriod] = useState("1st");

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const minutes = ["00", "15", "30", "45"];

  const handleBook = () => {
    if (
      lockerId &&
      date &&
      hour &&
      minute &&
      ampm &&
      duration &&
      bookingPeriod
    ) {
      const selectedTime = `${hour}:${minute} ${ampm}`;
      alert(
        `Booking Locker ${lockerId} for ${format(
          date,
          "PPP"
        )} at ${selectedTime} for ${duration} hour(s) (${bookingPeriod} period).`
      );
      // In a real application, send this data to your backend
      console.log({
        lockerId,
        date: format(date, "yyyy-MM-dd"),
        time: selectedTime,
        duration: `${duration} hour(s)`,
        bookingPeriod,
      });
      onClose();
    } else {
      alert("Please fill all booking details.");
    }
  };

  // Chakra UI Popover for date picker
  const {
    isOpen: isCalendarOpen,
    onOpen: onCalendarOpen,
    onClose: onCalendarClose,
  } = useDisclosure();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        p={6}
        borderRadius="3xl"
        boxShadow="lg"
        h={"50%"}
        display={"flex"}
        flexDirection={"column"}
        bgColor={""}
      >
        <ModalHeader pb={0}>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="24px" fontWeight="bold">
              Locker {lockerId?.toString().padStart(2, "0")}
            </Text>
            <ModalCloseButton position="static" />
          </Flex>
        </ModalHeader>
        <ModalBody
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Stack spacing={4} w={"100%"} gap={5}>
            <FormControl>
              <FormLabel fontSize={"18px"}>Booking Date</FormLabel>
              <Input
                type="date"
                value={format(date, "yyyy-MM-dd")}
                onChange={(e) => setDate(new Date(e.target.value))}
                bg="#FF5656"
                color="white"
                _hover={{ bg: "#C0392B" }}
                _focus={{ bg: "#C0392B", boxShadow: "none" }}
                sx={{
                  "&::-webkit-calendar-picker-indicator": {
                    filter: "invert(1)",
                  },
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel srOnly>Booking Time</FormLabel>
              <Flex gap={2} alignItems="center">
                <Select
                  onChange={(e) => setHour(e.target.value)}
                  value={hour}
                  bg="#FF5656"
                  color="white"
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </Select>
                <Text fontSize="xl" fontWeight="bold" color="gray.700">
                  :
                </Text>
                <Select
                  onChange={(e) => setMinute(e.target.value)}
                  value={minute}
                  bg="#FF5656"
                  color="white"
                >
                  {minutes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
                <Flex borderRadius="md" bg="#FF5656" p={1}>
                  <Button
                    variant="ghost"
                    size="sm"
                    h={8}
                    px={2}
                    color={ampm === "AM" ? "#E74C3C" : "white"}
                    bg={ampm === "AM" ? "white" : "transparent"}
                    _hover={{ bg: ampm === "AM" ? "white" : "#C0392B" }}
                    onClick={() => setAmpm("AM")}
                  >
                    AM
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    h={8}
                    px={2}
                    color={ampm === "PM" ? "#E74C3C" : "white"}
                    bg={ampm === "PM" ? "white" : "transparent"}
                    _hover={{ bg: ampm === "PM" ? "white" : "#C0392B" }}
                    onClick={() => setAmpm("PM")}
                  >
                    PM
                  </Button>
                </Flex>
              </Flex>
            </FormControl>

            <FormControl w={"100%"}>
              <FormLabel srOnly>Duration</FormLabel>
              <RadioGroup value={duration} onChange={setDuration}>
                <Stack direction="row" justifyContent="center" spacing={4}>
                  <Button
                    as="label"
                    htmlFor="duration-1"
                    h={10}
                    w={"100%"}
                    px={4}
                    borderRadius="md"
                    borderColor={duration === "1" ? "transparent" : "gray.300"}
                    bg={duration === "1" ? "#FF5656" : "white"}
                    color={duration === "1" ? "white" : "gray.700"}
                    _hover={{ bg: duration === "1" ? "#C0392B" : "gray.100" }}
                    leftIcon={<Clock size={16} />}
                  >
                    1 Hour
                  </Button>
                  {/* Add more duration options if needed */}
                </Stack>
              </RadioGroup>
            </FormControl>

            <Button
              width="full"
              bg="#FF5656"
              color="white"
              _hover={{ bg: "#C0392B" }}
              onClick={handleBook}
            >
              Book
            </Button>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
