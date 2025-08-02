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
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
} from "@chakra-ui/react"
import { useState } from "react"
import { useAdminStore } from "../../stores/adminStore"

export function AddUserModal({ isOpen, onClose }) {
  const { addUser } = useAdminStore()
  const toast = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Student",
    department: "",
    status: "Active",
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name || !formData.email || !formData.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Add user
    const newUser = {
      ...formData,
      lastLogin: "Never",
      joinDate: new Date().toISOString().split("T")[0],
      studentId:
        formData.role === "Student" ? `${formData.department.substring(0, 3).toUpperCase()}${Date.now()}` : null,
      employeeId: formData.role !== "Student" ? `EMP${Date.now()}` : null,
    }

    addUser(newUser)

    toast({
      title: "Success",
      description: "User added successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    // Reset form and close modal
    setFormData({
      name: "",
      email: "",
      role: "Student",
      department: "",
      status: "Active",
    })
    onClose()
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New User</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter full name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select value={formData.role} onChange={(e) => handleChange("role", e.target.value)}>
                  <option value="Student">Student</option>
                  <option value="Staff">Staff</option>
                  <option value="Faculty">Faculty</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Department</FormLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  placeholder="Select department"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Liberal Arts">Liberal Arts</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select value={formData.status} onChange={(e) => handleChange("status", e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" type="submit">
              Add User
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
