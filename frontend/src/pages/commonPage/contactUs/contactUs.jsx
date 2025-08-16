import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Icon,
  useToast,
  Stack,
} from "@chakra-ui/react";
import { FiMail, FiPhone, FiMapPin, FiSend } from "react-icons/fi";

const contactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message sent successfully!",
      description: "We'll get back to you within 24 hours.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    setIsSubmitting(false);
    e.target.reset();
  };

  const contactInfo = [
    {
      icon: FiMail,
      title: "Email",
      info: "hello@campushub.edu",
      description: "Send us an email anytime"
    },
    {
      icon: FiPhone,
      title: "Phone",
      info: "+1 (555) 123-4567",
      description: "Mon-Fri from 8am to 6pm"
    },
    {
      icon: FiMapPin,
      title: "Office",
      info: "123 University Ave",
      description: "Suite 100, Campus City"
    }
  ];

  return (
    <Box as="section" id="contact" px={20}>
      <Box maxW="container.xl" mx="auto" px={4}>
        <Stack spacing={16}>
          <Stack spacing={4} textAlign="center">
            <Heading size="xl" color="gray.800">
              Get In Touch
            </Heading>
            <Text
              fontSize="lg"
              color="gray.600"
              maxW="2xl"
              mx="auto"
            >
              Have questions about CampusHub? We'd love to hear from you.
              Send us a message and we'll respond as soon as possible.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={12} w="full">
            {/* Contact Form */}
            <Box
              bg="white"
              borderRadius="xl"
              p={{ base: 6, md: 8 }}
              boxShadow="sm"
              border="1px"
              borderColor="gray.200"
            >
              <Heading size="lg" color="gray.800" mb={6}>
                Send us a message
              </Heading>

              <form onSubmit={handleSubmit}>
                <Stack spacing={6}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                    <FormControl isRequired>
                      <FormLabel>First name</FormLabel>
                      <Input
                        name="firstName"
                        placeholder="Enter your first name"
                        focusBorderColor="brand.500"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Last name</FormLabel>
                      <Input
                        name="lastName"
                        placeholder="Enter your last name"
                        focusBorderColor="brand.500"
                      />
                    </FormControl>
                  </SimpleGrid>

                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      focusBorderColor="brand.500"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Subject</FormLabel>
                    <Input
                      name="subject"
                      placeholder="What is this about?"
                      focusBorderColor="brand.500"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Message</FormLabel>
                    <Textarea
                      name="message"
                      rows={4}
                      placeholder="Tell us more about your inquiry..."
                      focusBorderColor="brand.500"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    size="lg"
                    colorScheme="brand"
                    isLoading={isSubmitting}
                    loadingText="Sending..."
                    w="full"
                    _hover={{ transform: "translateY(-2px)" }}
                    transition="transform 0.2s"
                  >
                    Send Message <Box as={FiSend} ml={2} />
                  </Button>
                </Stack>
              </form>
            </Box>

            {/* Contact Information */}
            <Stack spacing={8} align="start">
              <Stack spacing={6} align="start">
                <Heading size="lg" color="gray.800">
                  Contact Information
                </Heading>
                <Text color="gray.600">
                  Choose the best way to reach us. We're here to help you succeed.
                </Text>
              </Stack>

              <Stack spacing={6} align="start" w="full">
                {contactInfo.map((item, index) => (
                  <HStack key={index} spacing={4} align="start">
                    <Icon as={item.icon} boxSize={5} color="brand.500" mt={1} />
                    <Stack spacing={1} align="start">
                      <Text fontWeight="medium" color="gray.800">
                        {item.title}
                      </Text>
                      <Text color="gray.800">
                        {item.info}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {item.description}
                      </Text>
                    </Stack>
                  </HStack>
                ))}
              </Stack>

              {/* Additional Info */}
              <Box
                bg="brand.50"
                borderRadius="xl"
                p={6}
                border="1px"
                borderColor="brand.100"
                w="full"
              >
                <Text fontWeight="semibold" color="gray.800" mb={2}>
                  Need immediate assistance?
                </Text>
                <Text fontSize="sm" color="gray.600" mb={4}>
                  For urgent technical issues or emergencies, contact our 24/7 support line.
                </Text>
                <Button variant="outline" size="sm" colorScheme="brand">
                  Emergency Support
                </Button>
              </Box>
            </Stack>
          </SimpleGrid>
        </Stack>
      </Box>
    </Box>
  );
};

export default contactUs;