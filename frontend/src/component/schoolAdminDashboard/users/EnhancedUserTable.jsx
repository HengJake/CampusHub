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
  Select,
  Flex,
  useDisclosure,
} from "@chakra-ui/react"
import { FiSearch, FiMoreHorizontal, FiDownload, FiUserPlus } from "react-icons/fi"
import { useAdminStore } from "../../stores/adminStore"
import { useState, useMemo } from "react"
import { AddUserModal } from "./AddUserModal"

export function EnhancedUserTable() {
  const { users, userFilters, setUserFilters, updateUser, deleteUser } = useAdminStore()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = [...new Set(users.map((user) => user.department))]
    return depts.sort()
  }, [users])

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(userFilters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(userFilters.search.toLowerCase())
      const matchesRole = userFilters.role === "all" || user.role === userFilters.role
      const matchesStatus = userFilters.status === "all" || user.status === userFilters.status
      const matchesDepartment = userFilters.department === "all" || user.department === userFilters.department

      return matchesSearch && matchesRole && matchesStatus && matchesDepartment
    })

    // Sort users
    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [users, userFilters, sortField, sortDirection])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleStatusToggle = (userId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active"
    updateUser(userId, { status: newStatus })
  }

  const exportUsers = () => {
    // Basic CSV export using current dependencies
    const csvContent = [
      ["Name", "Email", "Role", "Department", "Status", "Last Login"],
      ...filteredUsers.map((user) => [user.name, user.email, user.role, user.department, user.status, user.lastLogin]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Filters and Actions */}
      <Flex wrap="wrap" gap={4} align="center">
        <InputGroup flex="1" minW="250px">
          <InputLeftElement>
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search users..."
            value={userFilters.search}
            onChange={(e) => setUserFilters({ search: e.target.value })}
          />
        </InputGroup>

        <Select w="150px" value={userFilters.role} onChange={(e) => setUserFilters({ role: e.target.value })}>
          <option value="all">All Roles</option>
          <option value="Student">Student</option>
          <option value="Staff">Staff</option>
          <option value="Faculty">Faculty</option>
        </Select>

        <Select w="150px" value={userFilters.status} onChange={(e) => setUserFilters({ status: e.target.value })}>
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </Select>

        <Select
          w="180px"
          value={userFilters.department}
          onChange={(e) => setUserFilters({ department: e.target.value })}
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </Select>

        <Button leftIcon={<FiDownload />} variant="outline" onClick={exportUsers}>
          Export
        </Button>

        <Button leftIcon={<FiUserPlus />} colorScheme="brand" onClick={onOpen}>
          Add User
        </Button>
      </Flex>

      {/* Results Summary */}
      <Text fontSize="sm" color="gray.600">
        Showing {filteredUsers.length} of {users.length} users
      </Text>

      {/* Table */}
      <Box overflowX="auto" border="1px" borderColor="gray.200" borderRadius="md">
        <Table variant="campus">
          <Thead>
            <Tr>
              <Th cursor="pointer" onClick={() => handleSort("name")}>
                User {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort("role")}>
                Role {sortField === "role" && (sortDirection === "asc" ? "↑" : "↓")}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort("department")}>
                Department {sortField === "department" && (sortDirection === "asc" ? "↑" : "↓")}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort("status")}>
                Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort("lastLogin")}>
                Last Login {sortField === "lastLogin" && (sortDirection === "asc" ? "↑" : "↓")}
              </Th>
              <Th width="50px">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.map((user) => (
              <Tr key={user.id} _hover={{ bg: "gray.50" }}>
                <Td>
                  <HStack spacing={3}>
                    <Avatar size="sm" name={user.name} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{user.name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {user.email}
                      </Text>
                      {user.studentId && (
                        <Text fontSize="xs" color="gray.500">
                          ID: {user.studentId || user.employeeId}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </Td>
                <Td>
                  <Badge colorScheme={user.role === "Faculty" ? "purple" : user.role === "Staff" ? "blue" : "gray"}>
                    {user.role}
                  </Badge>
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

      <AddUserModal isOpen={isOpen} onClose={onClose} />
    </VStack>
  )
}
