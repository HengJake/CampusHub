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
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useEffect } from "react";

export const CampusHubLogo = () => {
  const path = useLocation().pathname;
  let logoLink;

  const { getCurrentUser, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  const currentUser = getCurrentUser();
  const userRole = currentUser?.role;

  if (
    userRole === "student"
  ) {
    logoLink = "/user-dashboard";
  } else if (
    userRole === "schoolAdmin"
  ) {
    logoLink = "/admin-dashboard";
  } else if (
    userRole === "companyAdmin"
  ) {
    logoLink = "/campushub-dashboard";
  } else {
    logoLink = "/";
  }

  return (
    <Box zIndex={100} mr={10}>
      <Link to={logoLink}>
        <HStack>
          <Image
            src="/Logo.png"
            alt="CampusHub Logo"
            w={"40px"}
            position="absolute"
            zIndex={-1}
            opacity={0.7}
          />
        </HStack>
      </Link>
    </Box>
  );
};
