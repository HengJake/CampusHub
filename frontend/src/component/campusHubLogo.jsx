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
import { getCookie } from "./cookieUtils";

export const CampusHubLogo = () => {
  let logoLink;
  const role = getCookie("role");
  if (role === "user") {
    logoLink = "/user-dashboard";
  } else if (role === "admin") {
    logoLink = "/admin-dashboard";
  } else if (role === "company") {
    logoLink = "/campushub-dashboard";
  } else {
    logoLink = "/";
  }
  return (
    <Box zIndex={100}>
      <Link to={logoLink}>
        <HStack>
          <Image
            src="/Logo.png"
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
