import {
    VStack,
    Text,
    Grid,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    Button,
    Divider,
    Card,
    CardBody,
    HStack,
    Badge,
    IconButton,
} from "@chakra-ui/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export function AcademicEventsSection({
    formData,
    setFormData,
    newEvent,
    setNewEvent,
    addAcademicEvent,
    removeAcademicEvent,
    showToast
}) {
    const handleAddEvent = () => {
        if (!newEvent.name || !newEvent.date || !newEvent.type) {
            showToast.error("Error", "Please fill in all event fields", "event-validation");
            return;
        }

        const event = {
            ...newEvent,
            date: new Date(newEvent.date).toISOString()
        };

        setFormData(prev => ({
            ...prev,
            academicEvents: [...prev.academicEvents, event]
        }));

        setNewEvent({
            name: "",
            date: "",
            type: "holiday",
            description: ""
        });
    };

    const handleRemoveEvent = (index) => {
        setFormData(prev => ({
            ...prev,
            academicEvents: prev.academicEvents.filter((_, i) => i !== index)
        }));
    };

    return (
        <VStack spacing={4} align="stretch">
            <Text fontWeight="semibold">Add Academic Event</Text>
            <Grid templateColumns="1fr 1fr 1fr" gap={4}>
                <FormControl>
                    <FormLabel>Event Name</FormLabel>
                    <Input
                        value={newEvent.name}
                        onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                        placeholder="Mid-Term Break"
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Event Date</FormLabel>
                    <Input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Event Type</FormLabel>
                    <Select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    >
                        <option value="holiday">Holiday</option>
                        <option value="exam">Exam</option>
                        <option value="break">Break</option>
                        <option value="registration">Registration</option>
                        <option value="orientation">Orientation</option>
                    </Select>
                </FormControl>
            </Grid>
            <FormControl>
                <FormLabel>Event Description</FormLabel>
                <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event description..."
                    rows={2}
                />
            </FormControl>
            <Button colorScheme="green" onClick={handleAddEvent} leftIcon={<FiPlus />}>
                Add Event
            </Button>

            <Divider />

            <Text fontWeight="semibold">Academic Events ({formData.academicEvents.length})</Text>
            {formData.academicEvents.map((event, index) => (
                <Card key={index} variant="outline">
                    <CardBody>
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <HStack>
                                    <Text fontWeight="medium">{event.name}</Text>
                                    <Badge colorScheme="blue">{event.type}</Badge>
                                </HStack>
                                <Text fontSize="sm" color="gray.600">
                                    {new Date(event.date).toLocaleDateString()}
                                </Text>
                                {event.description && (
                                    <Text fontSize="sm">{event.description}</Text>
                                )}
                            </VStack>
                            <IconButton
                                icon={<FiTrash2 />}
                                colorScheme="red"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveEvent(index)}
                            />
                        </HStack>
                    </CardBody>
                </Card>
            ))}
        </VStack>
    );
}