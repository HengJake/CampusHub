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
import { useLocation } from "react-router-dom";

export const CampusHubLogo = () => {
  const path = useLocation().pathname;
  let logoLink;

  const role = getCookie("role");
  if (
    role === "user" ||
    path.startsWith("/user-") ||
    path.startsWith("/book") ||
    [
      "/parking-lot",
      "/class-schedule",
      "/classroom-finder",
      "/result",
      "/attendance",
      "/bus-schedule",
      "/campus-ride",
      "/feedback",
    ].includes(path)
  ) {
    logoLink = "/user-dashboard";
  } else if (
    role === "admin" ||
    path.startsWith("/admin-") ||
    path.includes("-management") ||
    path === "/announcement-management"
  ) {
    logoLink = "/admin-dashboard";
  } else if (
    role === "company" ||
    path.startsWith("/campushub-") ||
    [
      "/subscription",
      "/client-management",
      "/analytical-report",
      "/user-oversight",
    ].includes(path)
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
