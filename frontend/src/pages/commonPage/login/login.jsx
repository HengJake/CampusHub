// Login component

import {
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { TiHome } from "react-icons/ti";
import { Link } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";

function Login() {
  return (
    <Container
      bg={"gray.700"}
      px={4}
      padding={4}
      borderRadius={4}
      className="login"
      display="flex"
      gap={4}
    >
      <Container gap={4} display="flex" flexDirection="column" flex={1}>
        <Button>
          <Link to="/">
            <TiHome fontSize={30} />
          </Link>
        </Button>
        <Button>
          <Link to="/signup">
            <FaUserPlus fontSize={25} />
          </Link>
        </Button>
      </Container>
      <FormControl
        isRequired
        flex={6}
        gap={3}
        display="flex"
        flexDirection="column"
      >
        <div>
          <FormLabel>Email</FormLabel>
          <Input placeholder="Email" />
        </div>
        <div>
          <FormLabel>Password</FormLabel>
          <Input placeholder="Password" />
        </div>
      </FormControl>
    </Container>
  );
}

export default Login;
