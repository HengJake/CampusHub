import React from 'react';
import {
    VStack,
    HStack,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    Button,
    Box,
    IconButton,
    Text
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { daysOfWeek } from './utils';

const TimeSlotManager = ({ timeSlots, onUpdate }) => {
    const addTimeSlot = () => {
        const newTimeSlot = {
            departureTime: '',
            arrivalTime: '',
            daysOfWeek: []
        };
        onUpdate([...timeSlots, newTimeSlot]);
    };

    const removeTimeSlot = (index) => {
        const updatedTimeSlots = timeSlots.filter((_, i) => i !== index);
        onUpdate(updatedTimeSlots);
    };

    const updateTimeSlot = (index, field, value) => {
        const updatedTimeSlots = timeSlots.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        );
        onUpdate(updatedTimeSlots);
    };

    const toggleDaySelection = (slotIndex, day) => {
        const updatedTimeSlots = timeSlots.map((slot, i) =>
            i === slotIndex ? {
                ...slot,
                daysOfWeek: slot.daysOfWeek.includes(day)
                    ? slot.daysOfWeek.filter(d => d !== day)
                    : [...slot.daysOfWeek, day]
            } : slot
        );
        onUpdate(updatedTimeSlots);
    };

    return (
        <FormControl>
            <FormLabel>Time Slots</FormLabel>
            <VStack spacing={3} w="100%">
                {timeSlots.map((slot, index) => (
                    <Box key={index} p={3} border="1px" borderColor="gray.200" borderRadius="md" w="100%">
                        <HStack spacing={3} mb={3}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm">Departure</FormLabel>
                                <Input
                                    type="time"
                                    size="sm"
                                    value={slot.departureTime}
                                    onChange={(e) => updateTimeSlot(index, 'departureTime', e.target.value)}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm">Arrival</FormLabel>
                                <Input
                                    type="time"
                                    size="sm"
                                    value={slot.arrivalTime}
                                    onChange={(e) => updateTimeSlot(index, 'arrivalTime', e.target.value)}
                                />
                            </FormControl>
                            <IconButton
                                size="sm"
                                icon={<DeleteIcon />}
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => removeTimeSlot(index)}
                                aria-label="Remove time slot"
                            />
                        </HStack>
                        <FormControl>
                            <FormLabel fontSize="sm">Days of Week</FormLabel>
                            <HStack spacing={2} wrap="wrap">
                                {daysOfWeek.map((day) => (
                                    <Checkbox
                                        key={day.value}
                                        isChecked={slot.daysOfWeek.includes(day.value)}
                                        onChange={() => toggleDaySelection(index, day.value)}
                                        size="sm"
                                    >
                                        {day.label.slice(0, 3)}
                                    </Checkbox>
                                ))}
                            </HStack>
                        </FormControl>
                    </Box>
                ))}
                <Button
                    leftIcon={<AddIcon />}
                    size="sm"
                    variant="outline"
                    onClick={addTimeSlot}
                    w="100%"
                >
                    Add Time Slot
                </Button>
            </VStack>
        </FormControl>
    );
};

export default TimeSlotManager;
