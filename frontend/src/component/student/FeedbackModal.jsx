import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Input,
  useToast,
  RadioGroup,
  Radio,
  HStack,
} from "@chakra-ui/react"
import { useState } from "react"
import { useStudentStore } from "../../store/TBI/studentStore.js"

export function FeedbackModal({ isOpen, onClose }) {
  const [category, setCategory] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("medium")
  const [anonymous, setAnonymous] = useState("no")

  const { submitFeedback } = useStudentStore()
  const toast = useToast()

  const handleSubmit = () => {
    if (!category || !subject || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const feedback = {
      category,
      subject,
      message,
      priority,
      anonymous: anonymous === "yes",
      timestamp: new Date().toISOString(),
    }

    submitFeedback(feedback)

    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback! We'll review it shortly.",
      status: "success",
      duration: 3000,
      isClosable: true,
    })

    // Reset form
    setCategory("")
    setSubject("")
    setMessage("")
    setPriority("medium")
    setAnonymous("no")
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Submit Feedback</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select
                placeholder="Select feedback category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="facilities">Facilities & Infrastructure</option>
                <option value="academic">Academic Services</option>
                <option value="transportation">Transportation</option>
                <option value="dining">Dining Services</option>
                <option value="technology">Technology & IT</option>
                <option value="student-life">Student Life</option>
                <option value="administration">Administration</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Subject</FormLabel>
              <Input
                placeholder="Brief description of your feedback"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Message</FormLabel>
              <Textarea
                placeholder="Please provide detailed feedback..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Priority Level</FormLabel>
              <RadioGroup value={priority} onChange={setPriority}>
                <HStack spacing={6}>
                  <Radio value="low">Low</Radio>
                  <Radio value="medium">Medium</Radio>
                  <Radio value="high">High</Radio>
                  <Radio value="urgent">Urgent</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Submit Anonymously</FormLabel>
              <RadioGroup value={anonymous} onChange={setAnonymous}>
                <HStack spacing={6}>
                  <Radio value="no">No, include my details</Radio>
                  <Radio value="yes">Yes, submit anonymously</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Submit Feedback
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
