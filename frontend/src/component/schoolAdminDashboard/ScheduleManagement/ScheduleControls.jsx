import {
    HStack,
    ButtonGroup,
    Button,
    Badge,
    Text
} from "@chakra-ui/react"
import React from "react"

export default function ScheduleControls({
    viewMode,
    setViewMode,
    showExams,
    setShowExams,
    showClasses,
    setShowClasses,
    allItems,
    onImportClick,
}) {
    return (
        <HStack justify="space-between">
            <HStack>
                <ButtonGroup size="sm" isAttached variant="outline">
                    <Button
                        colorScheme={viewMode === "weekly" ? "blue" : "gray"}
                        onClick={() => setViewMode("weekly")}
                    >
                        Weekly View
                    </Button>
                    <Button
                        colorScheme={viewMode === "list" ? "blue" : "gray"}
                        onClick={() => setViewMode("list")}
                    >
                        List View
                    </Button>
                </ButtonGroup>

                <Text ml={3}>Total Schedule : {allItems.length}</Text>
            </HStack>

            <HStack>

                <Badge colorScheme={"purple"}>
                    {allItems.filter(i => i.type == "class").length} classes
                </Badge>
                <Badge colorScheme={"red"}>
                    {allItems.filter(i => i.type == "exam").length} exams
                </Badge>
                <Button colorScheme={"green"} onClick={onImportClick}>
                    Import Schedule
                </Button>
            </HStack>
        </HStack>
    )
} 