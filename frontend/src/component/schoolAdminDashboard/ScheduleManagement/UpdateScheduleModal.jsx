import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, Button, FormControl, FormLabel,
    Input, Select, Stack,
    HStack, Checkbox, Text
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import MultiSelectPopover from "../../common/MultiSelectPopover";
import { useAcademicStore } from "../../../store/academic";
import { useShowToast } from "../../../store/utils/toast";
import { timeStringToUTC } from "../../../../../utility/dateTimeConversion.js"
import ComfirmationMessage from "../../../component/common/ComfirmationMessage.jsx"
import { useDisclosure } from "@chakra-ui/react";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const UpdateScheduleModal = ({ schedule, isOpenEdit, onCloseEdit }) => {
    const [formData, setFormData] = useState({
        type: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        examDate: "",
        durationMinute: "",
        roomId: "",
        lecturerId: "",
        invigilators: []
    });
    const { deleteClassSchedule, deleteExamSchedule, rooms, fetchRooms, fetchLecturers, lecturers, fetchLecturerById, updateExamSchedule, updateClassSchedule, fetchExamSchedules, fetchClassSchedules } = useAcademicStore();
    const showToast = useShowToast();

    // Fetch data only once when component mounts
    useEffect(() => {
        if (rooms.length === 0) {
            fetchRooms();
        }
        if (lecturers.length === 0) {
            fetchLecturers();
        }
    }, [rooms.length, lecturers.length, fetchRooms, fetchLecturers]);

    const { isOpen: isOpenAlert, onOpen: onOpenAlert, onClose: onCloseAlert } = useDisclosure();

    // Initialize form data when schedule changes
    useEffect(() => {
        const initFormData = async () => {
            if (schedule) {
                let invigilatorObjects = [];

                if (schedule.type === "exam" && schedule.invigilators?.length > 0) {
                    // Fetch full lecturer objects for each invigilator ID
                    invigilatorObjects = await Promise.all(
                        schedule.invigilators.map(async (inv) => {
                            const lecturerRes = await fetchLecturerById(inv);
                            return lecturerRes?.data; // Return the full lecturer object
                        })
                    );
                    // Filter out any null/undefined results
                    invigilatorObjects = invigilatorObjects.filter(obj => obj !== null && obj !== undefined);
                }

                // Calculate end time for exam schedules
                let startTime = "";
                let endTime = "";

                if (schedule.type === "exam") {
                    startTime = schedule.startTime || "";
                    // Calculate end time from start time and duration
                    if (startTime && schedule.durationMinute) {
                        const [hours, minutes] = startTime.split(':').map(Number);
                        const startDate = new Date();
                        startDate.setHours(hours, minutes, 0, 0);
                        const endDate = new Date(startDate.getTime() + (schedule.durationMinute * 60000));
                        endTime = endDate.toTimeString().slice(0, 5);
                    }
                } else {
                    startTime = schedule.startTime || "";
                    endTime = schedule.endTime || "";
                }

                setFormData({
                    type: schedule.type || "",
                    dayOfWeek: schedule.dayOfWeek || "",
                    startTime: startTime,
                    endTime: endTime,
                    examDate: schedule.examDate || "",
                    durationMinute: schedule.durationMinute || "",
                    roomId: schedule.room?._id || "",
                    lecturerId: schedule.lecturerId?._id || "",
                    invigilators: invigilatorObjects || []
                });
            } else {
                // Reset form data when no schedule is selected
                setFormData({
                    type: "",
                    dayOfWeek: "",
                    startTime: "",
                    endTime: "",
                    examDate: "",
                    durationMinute: "",
                    roomId: "",
                    lecturerId: "",
                    invigilators: []
                });
            }
        };

        initFormData();
    }, [schedule, fetchLecturerById]);

    // console.log(formData)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Auto-calculate end time for exam schedules when start time or duration changes
    useEffect(() => {
        if (formData.type === "exam" && formData.startTime && formData.durationMinute) {
            const [hours, minutes] = formData.startTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hours, minutes, 0, 0);
            const endDate = new Date(startDate.getTime() + (formData.durationMinute * 60000));
            const endTime = endDate.toTimeString().slice(0, 5);

            setFormData(prev => ({ ...prev, endTime }));
        }
    }, [formData.startTime, formData.durationMinute, formData.type]);

    const handleSave = async () => {
        // Validate time for both exam and class schedules
        if (timeStringToUTC(formData.endTime.split(":")) < timeStringToUTC(formData.startTime.split(":"))) {
            return showToast.error("End time must be more than start time", "", "asd")
        }

        // Validate required fields based on schedule type
        if (formData.type === "exam") {
            if (!formData.examDate || !formData.durationMinute) {
                return showToast.error("Exam date and duration are required for exam schedules", "", "validation-error")
            }
        } else {
            if (!formData.dayOfWeek) {
                return showToast.error("Day of week is required for class schedules", "", "validation-error")
            }
        }


        let res;
        if (formData.type === "exam") {
            // Create object matching examSchedule.model.js structure
            const updateExamData = {
                examDate: formData.examDate,
                examTime: formData.startTime,
                durationMinute: formData.durationMinute,
                roomId: formData.roomId, // Use the selected room ID
                invigilators: formData.invigilators?.map(inv => inv._id) || [], // Convert to array of IDs
                // Keep original values for required fields that shouldn't change
                semesterModuleId: schedule.semesterModuleId?._id, // ✅ FIXED: Use semesterModuleId instead of moduleId
                intakeCourseId: schedule.intakeCourseId?._id,
                schoolId: schedule.schoolId?._id
            };

            res = await updateExamSchedule(schedule.id, updateExamData);
            // console.log("🚀 ~ handleSave ~ res:", res)

            if (!res.success) {
                showToast.error("Unable to update exam schedule", res.message, "id");
                return;
            }

        } else {
            // Create object matching classSchedule.model.js structure
            const updateClassData = {
                dayOfWeek: formData.dayOfWeek,
                startTime: formData.startTime,
                endTime: formData.endTime,
                roomId: formData.roomId, // Use the selected room ID
                lecturerId: formData.lecturerId, // Use the selected lecturer ID
                // Keep original values for required fields that shouldn't change
                semesterModuleId: schedule.semesterModuleId?._id,
                intakeCourseId: schedule.intakeCourseId?._id,
                schoolId: schedule.schoolId?._id,
                moduleStartDate: schedule.moduleStartDate,
                moduleEndDate: schedule.moduleEndDate
            };

            console.log("🚀 ~ handleSave ~ updateClassData:", updateClassData)
            res = await updateClassSchedule(schedule.id, updateClassData);
            if (!res.success) {
                showToast.error("Unable to update class schedule", res.message, "id");
                return;
            }
        }

        showToast.success(`Schedule updated successfully`, res.message, "id");

        // reset formdata - Updated to match current form structure
        setFormData({
            type: "",
            dayOfWeek: "",
            startTime: "",
            endTime: "",
            examDate: "",
            durationMinute: "",
            roomId: "",
            lecturerId: "",
            invigilators: []
        });
        onCloseEdit();

        fetchExamSchedules();
        fetchClassSchedules();
    };

    const handleDelete = async () => {
        let res;

        if (schedule.type === "exam") {
            res = await deleteExamSchedule(schedule.id);
            if (!res.success) {
                showToast.error("Unable to delete exam schedule", res.message, "exam-delete");
                return;
            }
        } else {
            res = await deleteClassSchedule(schedule.id);
            if (!res.success) {
                showToast.error("Unable to delete class schedule", res.message, "class-delete");
                return;
            }
        }

        showToast.success("Schedule deleted successfully", res.message, "schedule-delete");

        onCloseEdit(); // Close modal or dialog
        fetchExamSchedules(); // Refresh list
        fetchClassSchedules(); // Refresh list
        onCloseAlert();
    };

    if (!schedule) return null;

    const isExam = schedule.type === "exam";

    return (
        <Modal isOpen={isOpenEdit} onClose={onCloseEdit} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit {isExam ? "Exam" : "Class"} Schedule</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack spacing={4}>
                        {!isExam && (
                            <FormControl>
                                <FormLabel>Day of Week</FormLabel>
                                <Select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>
                                    <option value="">Select a day</option>
                                    {daysOfWeek.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <FormControl>
                            <FormLabel>Start Time</FormLabel>
                            <Input type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
                        </FormControl>

                        <FormControl>
                            <FormLabel>End Time</FormLabel>
                            <Input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                isReadOnly={formData.type === "exam"}
                                bg={formData.type === "exam" ? "gray.100" : "white"}
                            />
                            {formData.type === "exam" && (
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    End time is calculated automatically from start time and duration
                                </Text>
                            )}
                        </FormControl>

                        {isExam && (
                            <>
                                <FormControl>
                                    <FormLabel>Exam Date</FormLabel>
                                    <Input type="date" name="examDate" value={formData.examDate} onChange={handleChange} />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Duration (Minutes)</FormLabel>
                                    <Input type="number" name="durationMinute" value={formData.durationMinute} onChange={handleChange} />
                                </FormControl>
                            </>
                        )}

                        <FormControl>
                            <FormLabel>Room</FormLabel>
                            <Select name="roomId" value={formData.roomId} onChange={handleChange}>
                                <option value="">Select a room</option>
                                {rooms.map(room => (
                                    <option key={room._id} value={room._id}>
                                        {room.block}-{room.floor}-{room.roomNumber}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        {isExam && (
                            <FormControl>
                                <MultiSelectPopover
                                    label={"Invigilator(s)"}
                                    items={lecturers}
                                    selectedIds={formData.invigilators?.map(inv => inv._id) || []}
                                    onChange={selected => {
                                        // Convert selected IDs back to lecturer objects
                                        const selectedLecturers = lecturers.filter(lecturer =>
                                            selected.includes(lecturer._id)
                                        );
                                        setFormData({ ...formData, invigilators: selectedLecturers });
                                    }}
                                    isRequired={false}
                                    getLabel={lecturer => lecturer.userId?.name || 'Unknown Lecturer'}
                                    getId={lecturer => lecturer._id}
                                />
                            </FormControl>
                        )}

                        {!isExam && (
                            <FormControl>
                                <FormLabel>Lecturer</FormLabel>
                                <Select name="lecturerId" value={formData.lecturerId} onChange={handleChange}>
                                    <option value="">Select a lecturer</option>
                                    {lecturers.map(lecturer => (
                                        <option key={lecturer._id} value={lecturer._id}>
                                            {lecturer.userId?.name || 'Unknown Lecturer'}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Stack>
                </ModalBody>

                <ModalFooter >
                    <HStack w="full" justify={"space-between"}>
                        <Button colorScheme="red" onClick={onOpenAlert}>
                            Delete
                        </Button>
                        <HStack>
                            <Button onClick={handleSave} colorScheme="blue" mr={3}>
                                Save
                            </Button>
                            <Button variant="ghost" onClick={onCloseEdit}>
                                Cancel
                            </Button>
                        </HStack>
                        <ComfirmationMessage
                            title="Confirm delete Schedule?"
                            description="Deleted schedule can't be restored"
                            isOpen={isOpenAlert}
                            onClose={onCloseAlert}
                            onConfirm={handleDelete}
                        />
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default UpdateScheduleModal;
