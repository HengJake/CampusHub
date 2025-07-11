"use client"

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Text,
  Badge,
  HStack,
  VStack,
  Input,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react"
import { FiSearch, FiMoreHorizontal } from "react-icons/fi"
import { useAdminStore } from "../../../store/TBI/adminStore.js"

export function UserManagementTable() {
  const { students } = useAdminStore()

  const handleStatusToggle = (userId, currentStatus) => {
    // TODO: Implement status toggle logic
    console.log("Toggle status for user:", userId, "from", currentStatus)
  }

  const handleDeleteUser = (userId) => {
    // TODO: Implement delete user logic
    console.log("Delete user:", userId)
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack>
        <InputGroup flex="1">
          <InputLeftElement>
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input placeholder="Search users..." />
        </InputGroup>
        <Button colorScheme="brand">Add User</Button>
      </HStack>

      <Box overflowX="auto" border="1px" borderColor="gray.200" borderRadius="md">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Department</Th>
              <Th>Status</Th>
              <Th>Last Login</Th>
              <Th width="50px"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {students?.map((user) => (
              <Tr key={user.id}>
                <Td>
                  <HStack spacing={3}>
                    <Avatar size="sm" name={user.name} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{user.name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {user.email}
                      </Text>
                    </VStack>
                  </HStack>
                </Td>
                <Td>
                  <Badge colorScheme={user.role === "Staff" ? "blue" : "gray"}>{user.role}</Badge>
                </Td>
                <Td>{user.department}</Td>
                <Td>
                  <Badge colorScheme={user.status === "Active" ? "green" : "gray"}>{user.status}</Badge>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.600">
                    {user.lastLogin}
                  </Text>
                </Td>
                <Td>
                  <Menu>
                    <MenuButton as={IconButton} icon={<FiMoreHorizontal />} variant="ghost" size="sm" />
                    <MenuList>
                      <MenuItem>Edit User</MenuItem>
                      <MenuItem>View Details</MenuItem>
                      <MenuItem>Reset Password</MenuItem>
                      <MenuItem onClick={() => handleStatusToggle(user.id, user.status)}>
                        {user.status === "Active" ? "Deactivate" : "Activate"}
                      </MenuItem>
                      <MenuItem color="red.500" onClick={() => deleteUser(user.id)}>
                        Delete User
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  )
}
