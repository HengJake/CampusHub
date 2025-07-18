"use client"

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  RadioGroup,
  Radio,
  HStack,
} from "@chakra-ui/react"
import { useState } from "react"
import { useStudentStore } from "../../store/TBI/studentStore"

export function LostFoundModal({ isOpen, onClose }) {
  const [itemType, setItemType] = useState("lost")
  const [itemName, setItemName] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [contactInfo, setContactInfo] = useState("")

  const { reportLostItem } = useStudentStore()
  const toast = useToast()

  const handleSubmit = () => {
    if (!itemName || !description || !location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const item = {
      item: itemName,
      description,
      location,
      contactInfo,
      type: itemType,
    }

    reportLostItem(item)

    toast({
      title: itemType === "lost" ? "Lost Item Reported" : "Found Item Reported",
      description: `Your ${itemType} item report has been submitted successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    // Reset form
    setItemType("lost")
    setItemName("")
    setDescription("")
    setLocation("")
    setContactInfo("")
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Report Lost/Found Item</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Report Type</FormLabel>
              <RadioGroup value={itemType} onChange={setItemType}>
                <HStack spacing={6}>
                  <Radio value="lost">Lost Item</Radio>
                  <Radio value="found">Found Item</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Item Name</FormLabel>
              <Input
                placeholder="e.g., iPhone 13, Blue Backpack, Laptop"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Detailed description of the item (color, brand, distinctive features, etc.)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Location</FormLabel>
              <Select
                placeholder={itemType === "lost" ? "Where did you last see it?" : "Where did you find it?"}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="Library - 1st Floor">Library - 1st Floor</option>
                <option value="Library - 2nd Floor">Library - 2nd Floor</option>
                <option value="Student Center">Student Center</option>
                <option value="Cafeteria">Cafeteria</option>
                <option value="Engineering Building">Engineering Building</option>
                <option value="Science Building">Science Building</option>
                <option value="Sports Complex">Sports Complex</option>
                <option value="Dormitory">Dormitory</option>
                <option value="Parking Lot">Parking Lot</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Contact Information</FormLabel>
              <Input
                placeholder="Phone number or email (optional)"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Submit Report
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
