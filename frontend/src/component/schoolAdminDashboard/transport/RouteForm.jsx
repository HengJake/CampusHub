import React, { useState, useEffect } from 'react';
import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Checkbox,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Button,
    FormHelperText
} from '@chakra-ui/react';
import { useTransportationStore } from '../../../store/transportation.js';
import { getStopTypeLabel } from './utils';

const RouteForm = ({ onSubmit, selectedItem, isEditMode }) => {
    const { stops } = useTransportationStore();
    
    const [formData, setFormData] = useState({
        name: '',
        stopIds: [],
        estimateTimeMinute: 30,
        fare: 0
    });

    const [selectedStopIds, setSelectedStopIds] = useState([]);

    useEffect(() => {
        if (selectedItem && isEditMode) {
            setFormData({
                name: selectedItem.name || '',
                stopIds: selectedItem.stopIds?.map(stop => stop._id) || [],
                estimateTimeMinute: selectedItem.estimateTimeMinute || 30,
                fare: selectedItem.fare || 0
            });
            setSelectedStopIds(selectedItem.stopIds?.map(stop => stop._id) || []);
        }
    }, [selectedItem, isEditMode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            stopIds: selectedStopIds
        };
        onSubmit(submitData);
    };

    const handleStopSelection = (stopId, isChecked) => {
        if (isChecked) {
            setSelectedStopIds([...selectedStopIds, stopId]);
        } else {
            setSelectedStopIds(selectedStopIds.filter(id => id !== stopId));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
                <FormControl isRequired>
                    <FormLabel>Route Name</FormLabel>
                    <Input
                        placeholder="Enter route name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Stops</FormLabel>
                    <VStack align="start" spacing={2} maxH="200px" overflowY="auto" w="100%">
                        {stops.map((stop) => (
                            <Checkbox
                                key={stop._id}
                                isChecked={selectedStopIds.includes(stop._id)}
                                onChange={(e) => handleStopSelection(stop._id, e.target.checked)}
                            >
                                {stop.name} ({getStopTypeLabel(stop.type)})
                            </Checkbox>
                        ))}
                    </VStack>
                    <FormHelperText>Select multiple stops for the route</FormHelperText>
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Estimated Time (minutes)</FormLabel>
                    <NumberInput
                        min={1}
                        value={formData.estimateTimeMinute}
                        onChange={(value) => setFormData({ ...formData, estimateTimeMinute: parseInt(value) })}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Fare (RM)</FormLabel>
                    <NumberInput
                        min={0}
                        step={0.50}
                        value={formData.fare}
                        onChange={(value) => setFormData({ ...formData, fare: parseFloat(value) })}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </FormControl>

                <Button type="submit" colorScheme="blue" w="100%">
                    {isEditMode ? 'Update Route' : 'Create Route'}
                </Button>
            </VStack>
        </form>
    );
};

export default RouteForm;
