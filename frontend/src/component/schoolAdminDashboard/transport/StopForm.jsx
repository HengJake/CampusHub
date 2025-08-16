import React, { useState, useEffect } from 'react';
import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Select,
    Button
} from '@chakra-ui/react';
import { stopTypes } from './utils';

const StopForm = ({ onSubmit, selectedItem, isEditMode }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'campus'
    });

    useEffect(() => {
        if (selectedItem && isEditMode) {
            setFormData({
                name: selectedItem.name || '',
                type: selectedItem.type || 'campus'
            });
        }
    }, [selectedItem, isEditMode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
                <FormControl isRequired>
                    <FormLabel>Stop Name</FormLabel>
                    <Input
                        placeholder="Enter stop name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Type</FormLabel>
                    <Select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        {stopTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <Button type="submit" colorScheme="blue" w="100%">
                    {isEditMode ? 'Update Stop' : 'Create Stop'}
                </Button>
            </VStack>
        </form>
    );
};

export default StopForm;
