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
  Spinner,
} from "@chakra-ui/react"
import { useState } from "react"
import { useServiceStore } from "../../store/service.js"
import { useAuthStore } from "../../store/auth.js"

export function FeedbackModal({ isOpen, onClose, onSuccess }) {
  const [category, setCategory] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("Medium")
  const [anonymous, setAnonymous] = useState("no")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { createFeedback } = useServiceStore()
  const { getCurrentUser } = useAuthStore()
  const toast = useToast()

  const handleSubmit = async () => {
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

    setIsSubmitting(true)

    try {
      const currentUser = getCurrentUser()
      
      // Map category to feedbackType enum values from the backend model
      const categoryToFeedbackType = {
        "facilities": "issue",
        "academic": "query", 
        "transportation": "issue",
        "dining": "complaint",
        "technology": "issue",
        "student-life": "suggestion",
        "administration": "query",
        "other": "query"
      }

      // Helper function to get student ID consistently (same as in Feedback.jsx)
      const getStudentId = (currentUser) => {
        return currentUser.studentId || 
               currentUser.user?.studentId || 
               currentUser.user?.student?._id || 
               currentUser.user?._id ||
               currentUser.id
      }

      // Get the correct student ID from various possible locations
      const studentId = getStudentId(currentUser)

      console.log("Current user:", currentUser)
      console.log("Extracted student ID:", studentId)

      const feedbackData = {
        feedbackType: categoryToFeedbackType[category] || "query",
        priority: priority,
        message: `${subject}\n\n${message}`,
        studentId: studentId,
        // schoolId will be automatically added by the service store
      }

      console.log("Submitting feedback data:", feedbackData)
      const result = await createFeedback(feedbackData)
      console.log("Feedback submission result:", result)

      if (result.success) {
        console.log("Feedback submitted successfully, calling onSuccess callback")
        toast({
          title: "Feedback Submitted Successfully",
          description: "Your feedback has been submitted and will appear in your feedback history. We'll review it shortly.",
          status: "success",
          duration: 4000,
          isClosable: true,
        })

        // Reset form
        setCategory("")
        setSubject("")
        setMessage("")
        setPriority("Medium")
        setAnonymous("no")
        
        // Call success callback if provided
        if (onSuccess) {
          console.log("Calling onSuccess callback")
          onSuccess()
        }
        
        onClose()
      } else {
        throw new Error(result.message || "Failed to submit feedback")
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit feedback. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
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
                  <Radio value="Low">Low</Radio>
                  <Radio value="Medium">Medium</Radio>
                  <Radio value="High">High</Radio>
                  <Radio value="Urgent">Urgent</Radio>
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
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Submitting..."
          >
            Submit Feedback
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
