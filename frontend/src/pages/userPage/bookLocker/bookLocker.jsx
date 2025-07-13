"use client";
import React from "react";

import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

import { LockerCard } from "./locker-card";
import { BookingDialog } from "./booking-dialog";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  RadioGroup,
  Radio,
  Checkbox,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Grid,
  GridItem,
} from "@chakra-ui/react";

const initialLockers = Array.from({ length: 32 }, (_, i) => {
  const id = i + 1;
  let status = "available";
  let isAccessible = false;
  let position = "top";

  if ([2, 3, 6, 7].includes(id)) {
    status = "booked";
  }
  if (id >= 25 && id <= 32) {
    status = "accessible";
    isAccessible = true;
  }

  if (id >= 9 && id <= 16) {
    position = "middle";
  } else if (id >= 17 && id <= 24) {
    position = "bottom";
  } else if (id >= 25 && id <= 32) {
    position = "bottom"; // Accessible lockers are also at the bottom in the image
  }

  return { id, status, isAccessible, position };
});

export default function LockerRoomBookingPage() {
  const [lockers, setLockers] = useState(initialLockers);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedLockerId, setSelectedLockerId] = useState(null);

  const [accessibilityFilter, setAccessibilityFilter] = useState(null);
  const [isDisabilityAccessible, setIsDisabilityAccessible] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(true);
  const [isAccessibilityFilterOpen, setIsAccessibilityFilterOpen] =
    useState(true);
  const [isFloorFilterOpen, setIsFloorFilterOpen] = useState(true);

  const handleLockerClick = (id) => {
    setSelectedLockerId(id);
    setIsBookingDialogOpen(true);
  };

  const handleCloseBookingDialog = () => {
    setIsBookingDialogOpen(false);
    setSelectedLockerId(null);
  };

  const filteredLockers = lockers.filter((locker) => {
    let matchesAccessibility = true;
    if (accessibilityFilter) {
      matchesAccessibility = locker.position === accessibilityFilter;
    }
    if (isDisabilityAccessible) {
      matchesAccessibility = matchesAccessibility && locker.isAccessible;
    }
    return matchesAccessibility;
  });

  return (
    <Box h="100%" display="flex" flexDirection="column">
      <Box flex="1" display="flex">
        <Box w="64" p={6} pr={6}>
          <Box mb={6} display="flex" alignItems="center" gap={2}>
            <SlidersHorizontal size={20} />
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Lockers | Floor 01
            </Text>
          </Box>

          <Box mb={6}>
            <Text mb={4} fontSize="lg" fontWeight="semibold" color="gray.700">
              Filters
            </Text>

            <Accordion allowToggle defaultIndex={[0, 1, 2]} mb={4}>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="medium" color="gray.600">
                    Type
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} pl={2} pt={2}>
                  <Text fontSize="sm" color="gray.500">
                    No type filters available yet.
                  </Text>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="medium" color="gray.600">
                    Accessibility
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} pl={2} pt={2}>
                  <RadioGroup value={accessibilityFilter || ""} onChange={setAccessibilityFilter}>
                    <VStack align="start" spacing={2}>
                      <Radio value="top">Top</Radio>
                      <Radio value="middle">Middle</Radio>
                      <Radio value="bottom">Bottom</Radio>
                    </VStack>
                  </RadioGroup>
                  <HStack mt={4} spacing={2}>
                    <Checkbox
                      isChecked={isDisabilityAccessible}
                      onChange={(e) => setIsDisabilityAccessible(e.target.checked)}
                    />
                    <Text>Disability Accessible</Text>
                  </HStack>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left" fontWeight="medium" color="gray.600">
                    Floor
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} pl={2} pt={2}>
                  <Text fontSize="sm" color="gray.500">
                    Floor 01 (Current)
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
        </Box>

        <Box flex="1" p={6} h={"100%"}>
          <Grid templateColumns="repeat(8, 1fr)" gap={5}>
            {filteredLockers.map((locker) => (
              <GridItem key={locker.id}>
                <LockerCard
                  id={locker.id}
                  status={locker.status}
                  isAccessible={locker.isAccessible}
                  onClick={handleLockerClick}
                />
              </GridItem>
            ))}
          </Grid>
        </Box>
      </Box>

      <BookingDialog
        isOpen={isBookingDialogOpen}
        onClose={handleCloseBookingDialog}
        lockerId={selectedLockerId}
      />
    </Box>
  );
}
