import React, { useState, useEffect } from 'react';
import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Button
} from '@chakra-ui/react';
import { useTransportationStore } from '../../../store/transportation.js';
import { vehicleTypes, vehicleStatuses } from './utils';

const VehicleForm = ({ onSubmit, selectedItem, isEditMode }) => {
    const [formData, setFormData] = useState({
        plateNumber: '',
        type: 'bus',
        capacity: 1,
        status: 'available'
    });

    useEffect(() => {
        if (selectedItem && isEditMode) {
            setFormData({
                plateNumber: selectedItem.plateNumber || '',
                type: selectedItem.type || 'bus',
                capacity: selectedItem.capacity || 1,
                status: selectedItem.status || 'available'
            });
        }
    }, [selectedItem, isEditMode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate plate number format (Malaysian regulations)
        const plateNumber = formData.plateNumber.trim().toUpperCase();
        const malaysianPlateRegex = /^[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]{0,3}$/;
        
        if (!malaysianPlateRegex.test(plateNumber)) {
            alert('Please enter a valid Malaysian number plate format.\n\nExamples:\nABC 1234\nW 1234\nABC 1234 DEF');
            return;
        }
        
        // Validate bus capacity limits
        if (formData.type === 'bus') {
            if (formData.capacity < 20) {
                alert('Bus capacity must be at least 20 passengers.');
                return;
            }
            if (formData.capacity > 300) {
                alert('Bus capacity cannot exceed 300 passengers.');
                return;
            }
        }
        
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
                <FormControl isRequired>
                    <FormLabel>Plate Number</FormLabel>
                    <Input
                        placeholder="Enter plate number"
                        value={formData.plateNumber}
                        onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Type</FormLabel>
                    <Select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        {vehicleTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Capacity</FormLabel>
                    <NumberInput
                        min={1}
                        value={formData.capacity}
                        onChange={(value) => setFormData({ ...formData, capacity: parseInt(value) })}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        {vehicleStatuses.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <Button type="submit" colorScheme="blue" w="100%">
                    {isEditMode ? 'Update Vehicle' : 'Create Vehicle'}
                </Button>
            </VStack>
        </form>
    );
};

export default VehicleForm;
