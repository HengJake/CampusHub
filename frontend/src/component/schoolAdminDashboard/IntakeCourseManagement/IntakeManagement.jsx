import {
  Box,
  Button,
  Card,
  CardBody,
  Text,
  Input,
  Select,
  HStack,
  VStack,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  Grid,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiPlus, FiSearch, FiDownload } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useAcademicStore } from "../../../store/academic.js";
import { useShowToast } from "../../../store/utils/toast.js";
import ComfirmationMessage from "../../common/ComfirmationMessage.jsx";
import { IntakeTable } from "./intake/IntakeTable";
import { IntakeFormModal } from "./intake/IntakeFormModal";
import { ViewIntakeModal } from "./intake/ViewIntakeModal";
import { AssignCoursesModal } from "./intake/AssignCoursesModal";

export function IntakeManagement() {
  const {
    intakes,
    createIntake,
    updateIntake,
    deleteIntake,
    fetchIntakesBySchoolId,
    courses,
    fetchCoursesBySchoolId,
    intakeCourses,
    fetchIntakeCoursesBySchoolId,
    createIntakeCourse,
    updateIntakeCourse,
    deleteIntakeCourse
  } = useAcademicStore();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  const showToast = useShowToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [selectedIntake, setSelectedIntake] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    intakeName: "",
    intakeMonth: "",
    registrationStartDate: "",
    registrationEndDate: "",
    orientationDate: "",
    academicEvents: [],
    isActive: true,
    status: "planning",
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [intakeToDelete, setIntakeToDelete] = useState(null);

  // Course assignment state
  const [assignFormData, setAssignFormData] = useState({
    intakeId: "",
    courseIds: [],
    maxStudents: 30,
    feeStructure: {
      localStudent: 0,
      internationalStudent: 0
    },
    duration: 36,
    maxDuration: 48,
    requirements: [],
    status: "available"
  });

  // IntakeCourse editing state
  const [currentIntakeCourses, setCurrentIntakeCourses] = useState([]);
  const [selectedIntakeCourseIndex, setSelectedIntakeCourseIndex] = useState(-1);
  const [isEditMode, setIsEditMode] = useState(false);

  // Academic event state
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    type: "holiday",
    description: ""
  });

  useEffect(() => {
    if (intakes.length === 0) {
      fetchIntakesBySchoolId();
    }
    if (courses.length === 0) {
      fetchCoursesBySchoolId();
    }
    if (intakeCourses.length === 0) {
      fetchIntakeCoursesBySchoolId();
    }
  }, []);


  console.log(intakes)

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const filteredIntakes = intakes.filter((intake) => {
    if (!intake) return false;

    const intakeName = intake.intakeName || "";
    const intakeMonth = intake.intakeMonth || "";

    const matchesSearch =
      intakeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intakeMonth.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || intake.status === statusFilter;
    const matchesMonth = monthFilter === "All" || intake.intakeMonth === monthFilter;

    return matchesSearch && matchesStatus && matchesMonth;
  });

  const getIntakeCoursesForIntake = (intakeId) => {
    return intakeCourses.filter(ic => ic.intakeId?._id === intakeId);
  };

  const handleSubmit = async () => {
    if (!formData.intakeName || !formData.intakeMonth || !formData.registrationStartDate || !formData.registrationEndDate) {
      showToast.error("Error", "Please fill in all required fields", "intake-validation");
      return;
    }

    // Validate dates
    const regStart = new Date(formData.registrationStartDate);
    const regEnd = new Date(formData.registrationEndDate);

    if (regEnd <= regStart) {
      showToast.error("Error", "Registration end date must be after start date", "date-validation");
      return;
    }

    if (isEditing) {
      if (!selectedIntake || !selectedIntake._id) {
        showToast.error("Error", "No intake selected for editing", "intake-edit-error");
        return;
      }

      const res = await updateIntake(selectedIntake._id, formData);
      if (!res || !res.success) {
        showToast.error("Error", res.message, "id-2");
        return;
      }

      showToast.success("Success", "Intake updated successfully", "intake-update");
    } else {
      const newIntake = {
        intakeName: formData.intakeName,
        intakeMonth: formData.intakeMonth,
        registrationStartDate: formData.registrationStartDate,
        registrationEndDate: formData.registrationEndDate,
        orientationDate: formData.orientationDate,
        academicEvents: formData.academicEvents,
        isActive: formData.isActive,
        status: formData.status,
      };
      const res = await createIntake(newIntake);
      if (!res || !res.success) {
        showToast.error("Error", res.message, "id-2");
        return;
      }
      showToast.success("Success", "Intake added successfully", "intake-add");
    }

    await fetchIntakesBySchoolId();
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      intakeName: "",
      intakeMonth: "",
      registrationStartDate: "",
      registrationEndDate: "",
      orientationDate: "",
      academicEvents: [],
      isActive: true,
      status: "planning",
    });
    setSelectedIntake(null);
    setIsEditing(false);
  };

  const resetAssignForm = () => {
    setAssignFormData({
      intakeId: "",
      courseIds: [],
      maxStudents: 30,
      feeStructure: {
        localStudent: 0,
        internationalStudent: 0
      },
      duration: 36,
      maxDuration: 48,
      requirements: [],
      status: "available"
    });
    setCurrentIntakeCourses([]);
    setSelectedIntakeCourseIndex(-1);
    setIsEditMode(false);
  };

  const handleEdit = (intake) => {
    if (!intake) {
      showToast.error("Error", "Invalid intake data", "intake-edit-error");
      return;
    }

    setSelectedIntake(intake);
    setFormData({
      intakeName: intake.intakeName || "",
      intakeMonth: intake.intakeMonth || "",
      registrationStartDate: intake.registrationStartDate ? intake.registrationStartDate.split('T')[0] : "",
      registrationEndDate: intake.registrationEndDate ? intake.registrationEndDate.split('T')[0] : "",
      orientationDate: intake.orientationDate ? intake.orientationDate.split('T')[0] : "",
      academicEvents: intake.academicEvents || [],
      isActive: intake.isActive !== undefined ? intake.isActive : true,
      status: intake.status || "planning",
    });
    setIsEditing(true);
    onOpen();
  };

  const handleView = (intake) => {
    if (!intake) {
      showToast.error("Error", "Invalid intake data", "intake-view-error");
      return;
    }

    setSelectedIntake(intake);
    onViewOpen();
  };

  const handleAssignCourses = (intake) => {
    const existingIntakeCourses = getIntakeCoursesForIntake(intake._id);

    setCurrentIntakeCourses(existingIntakeCourses);
    setSelectedIntake(intake);

    if (existingIntakeCourses.length > 0) {
      // Load first existing intakeCourse
      setSelectedIntakeCourseIndex(0);
      loadIntakeCourseData(existingIntakeCourses[0]);
      setIsEditMode(true);
    } else {
      // No existing courses, start in create mode
      setSelectedIntakeCourseIndex(-1);
      setIsEditMode(false);
      setAssignFormData(prev => ({
        ...prev,
        intakeId: intake._id,
        courseIds: [],
        maxStudents: 30,
        feeStructure: {
          localStudent: 0,
          internationalStudent: 0
        },
        duration: 36,
        maxDuration: 48,
        requirements: [],
        status: "available"
      }));
    }

    onAssignOpen();
  };

  const loadIntakeCourseData = (intakeCourse) => {
    setAssignFormData(prev => ({
      ...prev,
      intakeId: intakeCourse.intakeId._id || intakeCourse.intakeId,
      courseIds: [intakeCourse.courseId._id || intakeCourse.courseId],
      maxStudents: intakeCourse.maxStudents,
      feeStructure: {
        localStudent: intakeCourse.feeStructure.localStudent,
        internationalStudent: intakeCourse.feeStructure.internationalStudent
      },
      duration: intakeCourse.duration || 36,
      maxDuration: intakeCourse.maxDuration,
      requirements: intakeCourse.requirements || [],
      status: intakeCourse.status
    }));
  };

  const handleToggleIntakeCourse = (index) => {
    if (index === -1) {
      // Switch to create new mode
      setSelectedIntakeCourseIndex(-1);
      setIsEditMode(false);
      setAssignFormData(prev => ({
        ...prev,
        courseIds: [],
        maxStudents: 30,
        feeStructure: {
          localStudent: 0,
          internationalStudent: 0
        },
        duration: 36,
        maxDuration: 48,
        requirements: [],
        status: "available"
      }));
    } else {
      // Switch to edit existing mode
      setSelectedIntakeCourseIndex(index);
      setIsEditMode(true);
      loadIntakeCourseData(currentIntakeCourses[index]);
    }
  };

  const handleCourseAssignment = async () => {
    if (!assignFormData.intakeId || assignFormData.courseIds.length === 0) {
      showToast.error("Error", "Please select intake and at least one course", "assignment-validation");
      return;
    }

    if (!assignFormData.feeStructure.localStudent || !assignFormData.feeStructure.internationalStudent) {
      showToast.error("Error", "Please set fee structure for both local and international students", "fee-validation");
      return;
    }

    try {
      if (isEditMode && selectedIntakeCourseIndex !== -1) {
        // Update existing IntakeCourse
        const currentIntakeCourse = currentIntakeCourses[selectedIntakeCourseIndex];
        const intakeCourseData = {
          intakeId: assignFormData.intakeId,
          courseId: assignFormData.courseIds[0], // Only one course in edit mode
          maxStudents: parseInt(assignFormData.maxStudents),
          currentEnrollment: currentIntakeCourse.currentEnrollment, // Keep existing enrollment
          feeStructure: {
            localStudent: parseFloat(assignFormData.feeStructure.localStudent),
            internationalStudent: parseFloat(assignFormData.feeStructure.internationalStudent)
          },
          duration: parseInt(assignFormData.duration),
          maxDuration: parseInt(assignFormData.maxDuration),
          requirements: assignFormData.requirements,
          isActive: true,
          status: assignFormData.status
        };

        const res = await updateIntakeCourse(currentIntakeCourse._id, intakeCourseData);
        if (!res || !res.success) {
          showToast.error("Error", `Failed to update course: ${res.message}`, "update-error");
          return;
        }

        showToast.success("Success", "Successfully updated course assignment", "update-success");
      } else {
        // Create IntakeCourse for each selected course
        for (const courseId of assignFormData.courseIds) {
          const intakeCourseData = {
            intakeId: assignFormData.intakeId,
            courseId: courseId,
            maxStudents: parseInt(assignFormData.maxStudents),
            currentEnrollment: 0,
            feeStructure: {
              localStudent: parseFloat(assignFormData.feeStructure.localStudent),
              internationalStudent: parseFloat(assignFormData.feeStructure.internationalStudent)
            },
            duration: parseInt(assignFormData.duration),
            maxDuration: parseInt(assignFormData.maxDuration),
            requirements: assignFormData.requirements,
            isActive: true,
            status: assignFormData.status
          };

          const res = await createIntakeCourse(intakeCourseData);
          if (!res || !res.success) {
            showToast.error("Error", `Failed to assign course: ${res.message}`, "assignment-error");
            return;
          }
        }

        showToast.success("Success", `Successfully assigned ${assignFormData.courseIds.length} course(s) to intake`, "assignment-success");
      }

      await fetchIntakeCoursesBySchoolId();
      resetAssignForm();
      onAssignClose();
    } catch (error) {
      showToast.error("Error", isEditMode ? "Failed to update course" : "Failed to assign courses", "operation-error");
    }
  };

  const openDeleteDialog = (intakeId) => {
    setIntakeToDelete(intakeId);
    setIsDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteOpen(false);
    setIntakeToDelete(null);
  };

  const handleDelete = async () => {
    if (!intakeToDelete) {
      showToast.error("Error", "Invalid intake ID", "intake-delete-error");
      return;
    }
    await deleteIntake(intakeToDelete);
    showToast.success("Success", "Intake deleted successfully", "intake-delete");
    fetchIntakesBySchoolId();
    closeDeleteDialog();
  };

  const addAcademicEvent = () => {
    if (!newEvent.name || !newEvent.date || !newEvent.type) {
      showToast.error("Error", "Please fill in all event fields", "event-validation");
      return;
    }

    const event = {
      ...newEvent,
      date: new Date(newEvent.date).toISOString()
    };

    setFormData(prev => ({
      ...prev,
      academicEvents: [...prev.academicEvents, event]
    }));

    setNewEvent({
      name: "",
      date: "",
      type: "holiday",
      description: ""
    });
  };

  const removeAcademicEvent = (index) => {
    setFormData(prev => ({
      ...prev,
      academicEvents: prev.academicEvents.filter((_, i) => i !== index)
    }));
  };

  const exportIntakes = () => {
    const csvContent = [
      ["Intake Name", "Month", "Registration Start", "Registration End", "Status", "Courses Count"],
      ...filteredIntakes.map((intake) => [
        intake.intakeName || "N/A",
        intake.intakeMonth || "N/A",
        intake.registrationStartDate ? new Date(intake.registrationStartDate).toLocaleDateString() : "N/A",
        intake.registrationEndDate ? new Date(intake.registrationEndDate).toLocaleDateString() : "N/A",
        intake.status || "N/A",
        getIntakeCoursesForIntake(intake._id).length
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "intakes.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box flex={1}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Intake Management
            </Text>
            <Text color="gray.600">Manage student intake periods and course assignments</Text>
          </Box>
          <HStack>
            <Button leftIcon={<FiDownload />} variant="outline" onClick={exportIntakes}>
              Export
            </Button>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => {
                resetForm();
                onOpen();
              }}
            >
              Add Intake
            </Button>
          </HStack>
        </HStack>

        {/* Filters */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={4}>
              <InputGroup>
                <InputLeftElement>
                  <FiSearch color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search intakes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="planning">Planning</option>
                <option value="registration_open">Registration Open</option>
                <option value="registration_closed">Registration Closed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
              <Select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                <option value="All">All Months</option>
                <option value="January">January</option>
                <option value="May">May</option>
                <option value="September">September</option>
              </Select>
            </Grid>
          </CardBody>
        </Card>

        {/* Intakes Table */}
        <IntakeTable
          filteredIntakes={filteredIntakes}
          getIntakeCoursesForIntake={getIntakeCoursesForIntake}
          handleView={handleView}
          handleEdit={handleEdit}
          handleAssignCourses={handleAssignCourses}
          openDeleteDialog={openDeleteDialog}
        />

        {/* Modals */}
        <IntakeFormModal
          isOpen={isOpen}
          onClose={onClose}
          isEditing={isEditing}
          formData={formData}
          setFormData={setFormData}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          addAcademicEvent={addAcademicEvent}
          removeAcademicEvent={removeAcademicEvent}
          handleSubmit={handleSubmit}
          showToast={showToast}
        />

        <ViewIntakeModal
          isOpen={isViewOpen}
          onClose={onViewClose}
          selectedIntake={selectedIntake}
          getIntakeCoursesForIntake={getIntakeCoursesForIntake}
        />

        <AssignCoursesModal
          isOpen={isAssignOpen}
          onClose={onAssignClose}
          selectedIntake={selectedIntake}
          courses={courses}
          currentIntakeCourses={currentIntakeCourses}
          selectedIntakeCourseIndex={selectedIntakeCourseIndex}
          isEditMode={isEditMode}
          assignFormData={assignFormData}
          setAssignFormData={setAssignFormData}
          handleToggleIntakeCourse={handleToggleIntakeCourse}
          handleCourseAssignment={handleCourseAssignment}
          resetAssignForm={resetAssignForm}
        />
      </VStack>

      <ComfirmationMessage
        title="Confirm delete intake?"
        description="This intake will be permanently deleted and cannot be restored. All associated course assignments will also be removed."
        isOpen={isDeleteOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
      />
    </Box>
  );
}