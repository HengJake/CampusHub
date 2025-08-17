import React from "react";
import { FormControl, FormLabel, HStack, Input, Button, Badge, TagCloseButton, Tag } from "@chakra-ui/react";


const TitleInputList = ({
    label,
    placeholder,
    values,
    inputValue = [],
    setInputValue = "",
    onAdd,
    onRemove
}) => (
    <FormControl isRequired>
        <FormLabel>{label}</FormLabel>
        <HStack>
            <Input
                sx={{
                    "&::placeholder": {
                        color: "white"
                    }
                }}
                placeholder={placeholder}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
            />
            <Button onClick={() => onAdd(inputValue)}>
                Add
            </Button>
        </HStack>
        <HStack wrap="wrap" mt={2}>
            {(values).map((t, idx) => (
                <Tag key={idx} colorScheme="purple" mr={1}>
                    {t}
                    <TagCloseButton onClick={() => onRemove(idx)} />
                </Tag>
            ))}
        </HStack>
    </FormControl>
);

export default TitleInputList; 