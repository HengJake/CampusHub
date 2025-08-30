import {
    FormControl,
    FormLabel,
    Popover,
    PopoverTrigger,
    Button,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
    VStack,
    Checkbox,
    PopoverFooter,
    HStack,
    Tag,
    TagLabel,
    TagCloseButton,
    Text
} from "@chakra-ui/react";

/**
 * Generic MultiSelectPopover component.
 * @param {Array} items - Array of objects to select from.
 * @param {Array} selectedIds - Array of selected item ids.
 * @param {Function} onChange - Callback with updated selected ids.
 * @param {String} label - Field label.
 * @param {Boolean} isRequired - If the field is required.
 * @param {Function} getLabel - Function to get display label from item (item) => string.
 * @param {Function} getId - Function to get id from item (item) => string.
 */
export default function MultiSelectPopover({
    items = [],
    selectedIds = [],
    onChange,
    label = "Items",
    isRequired = false,
    getLabel = item => item.name || item.label || item._id,
    getId = item => item._id
}) {
    return (
        <FormControl isRequired={isRequired}>
            <FormLabel>{label}</FormLabel>
            <Popover placement="bottom-start" closeOnBlur={false}>
                {({ onClose }) => (
                    <>
                        <PopoverTrigger>
                            <Button w="100%" variant="outline" color="white">
                                {selectedIds.length > 0
                                    ? `${selectedIds.length} selected`
                                    : `Select ${label}`}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent minW="240px">
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader color="black">Select {label}</PopoverHeader>
                            <PopoverBody maxH="180px" overflowY="auto">
                                <VStack align="start" color="black">
                                    {items.length > 0 ? (
                                        items.map(item => {
                                            const id = getId(item);
                                            return (
                                                <Checkbox
                                                    key={id}
                                                    isChecked={selectedIds.includes(id)}
                                                    onChange={e => {
                                                        let updated;
                                                        if (e.target.checked) {
                                                            updated = [...selectedIds, id];
                                                        } else {
                                                            updated = selectedIds.filter(selId => selId !== id);
                                                        }
                                                        onChange(updated);
                                                    }}
                                                >
                                                    {getLabel(item)}
                                                </Checkbox>
                                            );
                                        })
                                    ) : (
                                        <Text color="gray.500" fontSize="sm" textAlign="center" w="100%">
                                            No {label.toLowerCase()} available
                                        </Text>
                                    )}
                                </VStack>
                            </PopoverBody>
                            <PopoverFooter>
                                <Button colorScheme="blue" size="sm" onClick={onClose} w="100%">Done</Button>
                            </PopoverFooter>
                        </PopoverContent>
                    </>
                )}
            </Popover>
            {/* Show selected as tags */}
            <HStack wrap="wrap" mt={2}>
                {selectedIds.length > 0 ? (
                    selectedIds.map(id => {
                        const item = items.find(i => getId(i) === id);
                        return item ? (
                            <Tag key={id} size="sm" colorScheme="blue" borderRadius="full">
                                <TagLabel>{getLabel(item)}</TagLabel>
                                <TagCloseButton onClick={() => onChange(selectedIds.filter(selId => selId !== id))} />
                            </Tag>
                        ) : (
                            <Tag key={id} size="sm" colorScheme="red" borderRadius="full">
                                <TagLabel>Unknown Item (ID: {id})</TagLabel>
                                <TagCloseButton onClick={() => onChange(selectedIds.filter(selId => selId !== id))} />
                            </Tag>
                        );
                    })
                ) : (
                    <Text color="gray.400" fontSize="sm">
                        No {label.toLowerCase()} selected
                    </Text>
                )}
            </HStack>
        </FormControl>
    );
} 