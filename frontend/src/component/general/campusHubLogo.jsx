import {
  Button,
  Container,
  Flex,
  HStack,
  Image,
  Text,
  useColorMode,
  Box,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

export const CampusHubLogo = () => {
  return (
    <Box zIndex={100}>
      <Link to="/">
        <HStack>
          <Image
            src="/Group 16.png"
            alt="CampusHub Logo"
            w={20}
            position="absolute"
            zIndex={-1}
            opacity={0.7}
          />
          <Text
            fontSize="xl"
            fontWeight="bold"
            bgGradient="linear-gradient(90deg, white, blue.200)"
            bgClip="text"
            wordBreak="normal"
            whiteSpace="nowrap"
          >
            Campus Hub
          </Text>
        </HStack>
      </Link>
    </Box>
  );
};
