"use client";

import React from "react";

import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Card,
  CardBody,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

const mockClients = [
  {
    id: 1,
    name: "Lincoln High School",
    address: "123 Education St, Springfield, IL",
    contact: "principal@lincoln.edu",
    phone: "(555) 123-4567",
    subAdmin: "John Smith",
    status: "Active",
    students: 1250,
    staff: 85,
  },
  {
    id: 2,
    name: "Roosevelt Elementary",
    address: "456 Learning Ave, Springfield, IL",
    contact: "admin@roosevelt.edu",
    phone: "(555) 234-5678",
    subAdmin: "Sarah Johnson",
    status: "Active",
    students: 650,
    staff: 45,
  },
  {
    id: 3,
    name: "Washington Middle School",
    address: "789 Knowledge Blvd, Springfield, IL",
    contact: "office@washington.edu",
    phone: "(555) 345-6789",
    subAdmin: "Mike Davis",
    status: "Inactive",
    students: 890,
    staff: 62,
  },
];

const mockSubAdmins = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    clients: ["Lincoln High School"],
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    clients: ["Roosevelt Elementary"],
  },
  {
    id: 3,
    name: "Mike Davis",
    email: "mike@example.com",
    clients: ["Washington Middle School"],
  },
  { id: 4, name: "Lisa Wilson", email: "lisa@example.com", clients: [] },
];

export default function ClientManagement() {
  const [clients, setClients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSubAdminOpen,
    onOpen: onSubAdminOpen,
    onClose: onSubAdminClose,
  } = useDisclosure();

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (client) => {
    setSelectedClient(client);
    onOpen();
  };

  const handleDelete = (clientId) => {
    setClients(clients.filter((c) => c.id !== clientId));
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Flex>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Client Management
          </Text>
          <Text color="gray.600">
            Manage school clients and their information
          </Text>
        </Box>
        <Spacer />
        <HStack>
          <Button leftIcon={<Plus />} colorScheme="blue" onClick={onOpen}>
            Add Client
          </Button>
          <Button leftIcon={<Eye />} variant="outline" onClick={onSubAdminOpen}>
            View Sub-Admins
          </Button>
        </HStack>
      </Flex>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <HStack spacing={4}>
            <Box position="relative" flex={1}>
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                pl={10}
              />
              <Box
                position="absolute"
                left={3}
                top="50%"
                transform="translateY(-50%)"
              >
                <Search size={16} color="gray" />
              </Box>
            </Box>
            <Select placeholder="Filter by status" w="200px">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </HStack>
        </CardBody>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>School Name</Th>
                  <Th>Contact</Th>
                  <Th>Sub-Admin</Th>
                  <Th>Users</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredClients.map((client) => (
                  <Tr key={client.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{client.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {client.address}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">{client.contact}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {client.phone}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>{client.subAdmin}</Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">Students: {client.students}</Text>
                        <Text fontSize="sm" color="gray.500">
                          Staff: {client.staff}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          client.status === "Active" ? "green" : "red"
                        }
                      >
                        {client.status}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack>
                        <IconButton
                          icon={<Edit />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(client)}
                        />
                        <IconButton
                          icon={<Trash2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(client.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Add/Edit Client Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedClient ? "Edit Client" : "Add New Client"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>School Name</FormLabel>
                <Input placeholder="Enter school name" />
              </FormControl>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input placeholder="Enter address" />
              </FormControl>
              <FormControl>
                <FormLabel>Contact Email</FormLabel>
                <Input placeholder="Enter contact email" />
              </FormControl>
              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input placeholder="Enter phone number" />
              </FormControl>
              <FormControl>
                <FormLabel>Assign Sub-Admin</FormLabel>
                <Select placeholder="Select sub-admin">
                  {mockSubAdmins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue">
              {selectedClient ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Sub-Admins Modal */}
      <Modal isOpen={isSubAdminOpen} onClose={onSubAdminClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sub-Admins Management</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Assigned Clients</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mockSubAdmins.map((admin) => (
                    <Tr key={admin.id}>
                      <Td>{admin.name}</Td>
                      <Td>{admin.email}</Td>
                      <Td>
                        {admin.clients.length > 0 ? (
                          admin.clients.map((client) => (
                            <Badge key={client} mr={1} mb={1}>
                              {client}
                            </Badge>
                          ))
                        ) : (
                          <Text color="gray.500">No clients assigned</Text>
                        )}
                      </Td>
                      <Td>
                        <HStack>
                          <Button size="sm" variant="outline">
                            Reassign
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit Role
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onSubAdminClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
