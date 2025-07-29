import {
    Box,
    Grid,
    Text,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Card,
    CardBody,
    VStack,
    HStack,
    Avatar,
    useColorModeValue,
    Progress,
} from "@chakra-ui/react"


export function StatsCard({ title, value, change, icon, color }) {
    const bgColor = useColorModeValue("white", "gray.800")
    const borderColor = useColorModeValue("gray.200", "gray.600")
    return (
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
            <CardBody>
                <Stat>
                    <HStack justify="space-between">
                        <Box>
                            <StatLabel color="gray.600" fontSize="sm">
                                {title}
                            </StatLabel>
                            <StatNumber fontSize="2xl" color={color}>
                                {value}
                            </StatNumber>
                            {change && (
                                <StatHelpText>
                                    <StatArrow type={change > 0 ? "increase" : "decrease"} />
                                    <Text as={"span"} fontWeight={700}>{Math.abs(change)}%</Text> from last month
                                </StatHelpText>
                            )}
                        </Box>
                        <Box color={color} fontSize="2xl">
                            {icon}
                        </Box>
                    </HStack>
                </Stat>
            </CardBody>
        </Card>
    )
}