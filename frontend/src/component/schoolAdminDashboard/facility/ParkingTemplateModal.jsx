import {
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    FormControl,
    FormLabel,
    Input,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    HStack,
    Text,
    useToast,
    Select,
    Radio,
    RadioGroup,
    Stack
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { useFacilityStore } from "../../../store/facility.js"
import { useAuthStore } from "../../../store/auth.js"

export default function ParkingTemplateModal({ isOpen, onClose, onGenerate, existingZones = [] }) {
    const [formData, setFormData] = useState({
        zoneType: "existing", // "existing" or "new"
        selectedZone: "",
        newZoneName: "",
        startSlot: 1,
        numberOfSlots: 10,
        active: true
    })
    const [isGenerating, setIsGenerating] = useState(false)
    const toast = useToast()
    const facilityStore = useFacilityStore()
    const authStore = useAuthStore()

    // Get unique existing zones
    const uniqueZones = [...new Set(existingZones.map(lot => lot.zone).filter(Boolean))]

    // Update start slot when zone changes
    useEffect(() => {
        if (formData.zoneType === "existing" && formData.selectedZone) {
            const zoneLots = existingZones.filter(lot => lot.zone === formData.selectedZone)
            if (zoneLots.length > 0) {
                const maxSlot = Math.max(...zoneLots.map(lot => lot.slotNumber || 0))
                setFormData(prev => ({
                    ...prev,
                    startSlot: maxSlot + 1
                }))
            }
        }
    }, [formData.selectedZone, formData.zoneType, existingZones])

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleGenerate = async () => {
        // Validation
        if (formData.zoneType === "existing" && !formData.selectedZone) {
            toast({
                title: "Validation Error",
                description: "Please select an existing zone",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        if (formData.zoneType === "new" && !formData.newZoneName.trim()) {
            toast({
                title: "Validation Error",
                description: "Please enter a zone name",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        if (formData.numberOfSlots <= 0) {
            toast({
                title: "Validation Error",
                description: "Number of slots must be greater than 0",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        setIsGenerating(true)

        try {
            // Generate parking lot data with unique slot numbers
            const zoneName = formData.zoneType === "existing" ? formData.selectedZone : formData.newZoneName.trim()
            const schoolId = authStore.getSchoolId()

            if (!schoolId) {
                throw new Error("School ID not found")
            }

            // Generate unique slot numbers
            const slotResult = await facilityStore.generateUniqueSlotNumbers(
                schoolId,
                zoneName,
                formData.numberOfSlots,
                formData.startSlot
            )

            if (!slotResult.success) {
                throw new Error(slotResult.message)
            }

            const generatedLots = slotResult.data.map(slotNumber => ({
                zone: zoneName,
                slotNumber: slotNumber,
                active: formData.active
            }))

            toast({
                title: "Parking Lots Generated",
                description: `${formData.numberOfSlots} unique parking lots created for ${zoneName}`,
                status: "success",
                duration: 3000,
                isClosable: true,
            })

            onGenerate(generatedLots)
            onClose()
        } catch (error) {
            console.error("Error generating parking lots:", error)
            toast({
                title: "Generation Error",
                description: error.message || "Failed to generate parking lots",
                status: "error",
                duration: 5000,
                isClosable: true,
            })
        } finally {
            setIsGenerating(false)
        }
    }

    const resetForm = () => {
        setFormData({
            zoneType: "existing",
            selectedZone: "",
            newZoneName: "",
            startSlot: 1,
            numberOfSlots: 10,
            active: true
        })
    }

    const getZoneInfo = (zoneName) => {
        if (!zoneName) return null
        const zoneLots = existingZones.filter(lot => lot.zone === zoneName)
        const activeSlots = zoneLots.filter(lot => lot.active).length
        const totalSlots = zoneLots.length
        return { totalSlots, activeSlots }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Generate Parking Lots</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <Box>
                                <AlertTitle fontSize="sm">Generate Multiple Parking Lots:</AlertTitle>
                                <AlertDescription fontSize="sm">
                                    Create multiple parking lot slots for a zone. You can either select an existing zone or create a new one.
                                </AlertDescription>
                            </Box>
                        </Alert>

                        {/* Zone Type Selection */}
                        <FormControl>
                            <FormLabel>Zone Selection</FormLabel>
                            <RadioGroup value={formData.zoneType} onChange={(value) => handleChange("zoneType", value)}>
                                <Stack direction="row" spacing={4}>
                                    <Radio value="existing">Use Existing Zone</Radio>
                                    <Radio value="new">Create New Zone</Radio>
                                </Stack>
                            </RadioGroup>
                        </FormControl>

                        {/* Existing Zone Selection */}
                        {formData.zoneType === "existing" && (
                            <FormControl>
                                <FormLabel>Select Zone</FormLabel>
                                <Select
                                    placeholder="Choose a zone"
                                    value={formData.selectedZone}
                                    onChange={(e) => handleChange("selectedZone", e.target.value)}
                                >
                                    {uniqueZones.map((zone) => {
                                        const zoneInfo = getZoneInfo(zone)
                                        return (
                                            <option key={zone} value={zone}>
                                                {zone} ({zoneInfo?.totalSlots || 0} slots, {zoneInfo?.activeSlots || 0} active)
                                            </option>
                                        )
                                    })}
                                </Select>
                                {formData.selectedZone && getZoneInfo(formData.selectedZone) && (
                                    <Text fontSize="xs" color="gray.600" mt={1}>
                                        Current zone has {getZoneInfo(formData.selectedZone).totalSlots} slots.
                                        New slots will start from slot {formData.startSlot}.
                                    </Text>
                                )}
                            </FormControl>
                        )}

                        {/* New Zone Name */}
                        {formData.zoneType === "new" && (
                            <FormControl>
                                <FormLabel>New Zone Name</FormLabel>
                                <Input
                                    placeholder="e.g., Zone A, North Parking, Student Lot"
                                    value={formData.newZoneName}
                                    onChange={(e) => handleChange("newZoneName", e.target.value)}
                                />
                            </FormControl>
                        )}

                        {/* Slot Configuration */}
                        <HStack spacing={4}>
                            <FormControl>
                                <FormLabel>Start Slot Number</FormLabel>
                                <NumberInput
                                    min={1}
                                    value={formData.startSlot}
                                    onChange={(value) => handleChange("startSlot", parseInt(value) || 1)}
                                    isReadOnly={formData.zoneType === "existing"}
                                >
                                    <NumberInputField
                                        readOnly={formData.zoneType === "existing"}
                                        bg={formData.zoneType === "existing" ? "gray.100" : "white"}
                                    />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                                {formData.zoneType === "existing" && (
                                    <Text fontSize="xs" color="gray.500" mt={1}>
                                        Start slot is automatically calculated to avoid conflicts
                                    </Text>
                                )}
                            </FormControl>

                            <FormControl mb={formData.zoneType === "existing" ? "10" : ""}>
                                <FormLabel>Number of Slots</FormLabel>
                                <NumberInput
                                    min={1}
                                    max={100}
                                    value={formData.numberOfSlots}
                                    onChange={(value) => handleChange("numberOfSlots", parseInt(value) || 1)}
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </HStack>

                        {/* Default Status */}
                        <FormControl>
                            <FormLabel>Default Status</FormLabel>
                            <HStack spacing={4}>
                                <Button
                                    size="sm"
                                    colorScheme={formData.active ? "green" : "gray"}
                                    onClick={() => handleChange("active", true)}
                                    variant={formData.active ? "solid" : "outline"}
                                >
                                    Active
                                </Button>
                                <Button
                                    size="sm"
                                    colorScheme={!formData.active ? "red" : "gray"}
                                    onClick={() => handleChange("active", false)}
                                    variant={!formData.active ? "solid" : "outline"}
                                >
                                    Inactive
                                </Button>
                            </HStack>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                This will be the default status for all generated slots
                            </Text>
                        </FormControl>

                        {/* Preview */}
                        <Box p={3} bg="gray.50" borderRadius="md">
                            <Text fontSize="sm" fontWeight="semibold" mb={2}>
                                Generation Preview:
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                Zone: {formData.zoneType === "existing" ? formData.selectedZone || "Not selected" : formData.newZoneName || "Not specified"}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                Slots: {formData.startSlot} - {formData.startSlot + formData.numberOfSlots - 1} ({formData.numberOfSlots} total)
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                Status: {formData.active ? "Active" : "Inactive"}
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={resetForm}>
                        Reset
                    </Button>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="green"
                        onClick={handleGenerate}
                        isDisabled={
                            (formData.zoneType === "existing" && !formData.selectedZone) ||
                            (formData.zoneType === "new" && !formData.newZoneName.trim()) ||
                            formData.numberOfSlots <= 0 ||
                            isGenerating
                        }
                    >
                        {isGenerating ? "Generating..." : "Generate Parking Lots"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
