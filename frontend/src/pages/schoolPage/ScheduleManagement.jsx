import {
  Box,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react"
import React, { useEffect } from "react"
import {
  useScheduleManagement,
  getTypeColor,
  ScheduleFilters,
  ScheduleControls,
  ScheduleDisplay,
  ScheduleGenerationModal,
  ImportScheduleModal,
  UpdateScheduleModal,
} from "../../component/schoolAdminDashboard/ScheduleManagement/index.js"

export default function ScheduleManagement() {
  const {
    // State
    viewMode,
    setViewMode,
    selectedIntake,
    setSelectedIntake,
    selectedCourse,
    setSelectedCourse,
    selectedModule,
    setSelectedModule,
    selectedSemester,
    setSelectedSemester,
    selectedYear,
    setSelectedYear,
    availableSemesters,
    setAvailableSemesters,
    isLoading,
    showExams,
    setShowExams,
    showClasses,
    setShowClasses,
    generateExam,
    setGenerateExam,
    selectedSchedule,
    isModalOpen,
    triggerDownload,
    setTriggerDownload,

    // Data
    classSchedules,
    examSchedules,
    scheduleData,
    allItems,

    // Handlers
    handleEditClick,
    handleModalClose,
    proceedGenerateSchedule,
    handleFileUpload,
  } = useScheduleManagement()

  const { isOpen: isOpenGeneration, onOpen: onOpenGeneration, onClose: onCloseGeneration } = useDisclosure()
  const { isOpen: isOpenImport, onOpen: onOpenImport, onClose: onCloseImport } = useDisclosure()

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const gridBg = useColorModeValue("gray.50", "gray.700")

  // Handle generation modal
  const handleGenerateClick = () => {
    onOpenGeneration()
  }

  // Handle import modal
  const handleImportClick = () => {
    onOpenImport()
  }

  // Handle proceed generation
  const handleProceedGeneration = async () => {
    onCloseGeneration()
    await proceedGenerateSchedule()
  }

  useEffect(() => {
    if (triggerDownload) {
      handleGenerateClick()
      setTriggerDownload(false)
    }
  }, [showClasses, showExams, allItems])

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify={"space-between"}>
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
              Academic Schedule Dashboard
            </Text>
            <Text color="gray.600">View your class schedule and exam timetable in one place</Text>
          </Box>
        </HStack>

        {/* Schedule Filters */}
        <ScheduleFilters
          selectedIntake={selectedIntake}
          setSelectedIntake={setSelectedIntake}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          selectedModule={selectedModule}
          setSelectedModule={setSelectedModule}
          selectedSemester={selectedSemester}
          setSelectedSemester={setSelectedSemester}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          availableSemesters={availableSemesters}
          setAvailableSemesters={setAvailableSemesters}
          allItems={allItems}
          onGenerateClick={handleGenerateClick}
          triggerDownload={triggerDownload}
          setTriggerDownload={setTriggerDownload}
        />

        {/* Schedule Controls */}
        <ScheduleControls
          viewMode={viewMode}
          setViewMode={setViewMode}
          showExams={showExams}
          setShowExams={setShowExams}
          showClasses={showClasses}
          setShowClasses={setShowClasses}
          allItems={allItems}
          onImportClick={handleImportClick}
        />

        {/* Schedule Display */}
        <ScheduleDisplay
          viewMode={viewMode}
          showExams={showExams}
          showClasses={showClasses}
          scheduleData={allItems}
          filter={{
            selectedSemester: selectedSemester,
            selectedIntake: selectedIntake,
            selectedCourse: selectedCourse,
            selectedModule: selectedModule,
            selectedYear: selectedYear
          }}
          getTypeColor={getTypeColor}
          onEditClick={handleEditClick}
          classSchedules={classSchedules}
          examSchedules={examSchedules}
          bgColor={bgColor}
          borderColor={borderColor}
          gridBg={gridBg}
        />

        {/* All Schedules Grouped by Intake Course and Semester */}
        <Box bg={bgColor} border="1px" borderColor={borderColor} borderRadius="lg" p={6}>
          <Text fontSize="xl" fontWeight="bold" mb={4} color="gray.800">
            All Schedules by Intake Course and Semester
          </Text>

          {(classSchedules?.length > 0 || examSchedules?.length > 0) ? (
            <VStack spacing={6} align="stretch">
              {(() => {
                // Combine and group all schedules by intake course, then by semester
                const allSchedules = [
                  ...(classSchedules || []).map(schedule => ({ ...schedule, type: 'class' })),
                  ...(examSchedules || []).map(exam => ({ ...exam, type: 'exam' }))
                ];

                const groupedSchedules = allSchedules.reduce((acc, schedule) => {
                  const intakeCourseId = schedule.intakeCourseId?._id || schedule.intakeCourseId;
                  const semesterId = schedule.semesterModuleId?.semesterId?._id || schedule.semesterId?._id;
                  const semesterNumber = schedule.semesterModuleId?.semesterId?.semesterNumber || schedule.semesterId?.semesterNumber;
                  const semesterYear = schedule.semesterModuleId?.semesterId?.year || schedule.semesterId?.year;
                  
                  if (!acc[intakeCourseId]) {
                    acc[intakeCourseId] = {
                      intakeCourse: schedule.intakeCourseId,
                      semesters: {}
                    };
                  }
                  
                  if (semesterId) {
                    if (!acc[intakeCourseId].semesters[semesterId]) {
                      acc[intakeCourseId].semesters[semesterId] = {
                        semesterId,
                        semesterNumber,
                        semesterYear,
                        classSchedules: [],
                        examSchedules: []
                      };
                    }
                    if (schedule.type === 'class') {
                      acc[intakeCourseId].semesters[semesterId].classSchedules.push(schedule);
                    } else {
                      acc[intakeCourseId].semesters[semesterId].examSchedules.push(schedule);
                    }
                  } else {
                    // Handle schedules without semester info
                    if (!acc[intakeCourseId].semesters['no-semester']) {
                      acc[intakeCourseId].semesters['no-semester'] = {
                        semesterId: 'no-semester',
                        semesterNumber: null,
                        semesterYear: null,
                        classSchedules: [],
                        examSchedules: []
                      };
                    }
                    if (schedule.type === 'class') {
                      acc[intakeCourseId].semesters['no-semester'].classSchedules.push(schedule);
                    } else {
                      acc[intakeCourseId].semesters['no-semester'].examSchedules.push(schedule);
                    }
                  }
                  
                  return acc;
                }, {});



                
                return Object.values(groupedSchedules).map((group, index) => (
                  <Box key={index} border="1px" borderColor={borderColor} borderRadius="md" p={4}>
                    <HStack justify="space-between" mb={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" color="blue.600">
                          {group.intakeCourse?.intakeId?.intakeName || 'Unknown Intake'} - {group.intakeCourse?.courseId?.courseName || 'Unknown Course'}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Course Code: {group.intakeCourse?.courseId?.courseCode || 'N/A'}
                        </Text>
                      </VStack>
                      <Text fontSize="sm" color="gray.500">
                        {Object.values(group.semesters).reduce((total, semester) => 
                          total + semester.classSchedules.length + semester.examSchedules.length, 0
                        )} schedule{Object.values(group.semesters).reduce((total, semester) => 
                          total + semester.classSchedules.length + semester.examSchedules.length, 0
                        ) !== 1 ? 's' : ''}
                      </Text>
                    </HStack>

                    <VStack spacing={4} align="stretch">
                      {Object.values(group.semesters)
                        .sort((a, b) => {
                          // Sort by year first, then by semester number
                          if (a.semesterYear !== b.semesterYear) {
                            return (a.semesterYear || 0) - (b.semesterYear || 0);
                          }
                          return (a.semesterNumber || 0) - (b.semesterNumber || 0);
                        })
                        .map((semester, semesterIndex) => (
                          <Box key={semesterIndex} border="1px" borderColor="gray.200" borderRadius="md" p={3}>
                            <HStack justify="space-between" mb={3}>
                              <VStack align="start" spacing={1}>
                                {semester.semesterId === 'no-semester' ? (
                                  <Text fontWeight="semibold" color="gray.500">
                                    Semester: Not Assigned
                                  </Text>
                                ) : (
                                  <>
                                    <Text fontWeight="semibold" color="purple.600">
                                      Year {semester.semesterYear} - Semester {semester.semesterNumber}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                      {semester.classSchedules.length} class{semester.classSchedules.length !== 1 ? 'es' : ''} • {semester.examSchedules.length} exam{semester.examSchedules.length !== 1 ? 's' : ''}
                                    </Text>
                                  </>
                                )}
                              </VStack>
                            </HStack>

                            <VStack spacing={3} align="stretch">
                              {/* Class Schedules */}
                              {semester.classSchedules.length > 0 && (
                                <VStack spacing={2} align="stretch">
                                  <Text fontSize="sm" fontWeight="semibold" color="blue.600" mb={1}>
                                    Class Schedules:
                                  </Text>
                                  {semester.classSchedules.map((schedule, scheduleIndex) => (
                                    <HStack
                                      key={`class-${scheduleIndex}`}
                                      bg={gridBg}
                                      p={3}
                                      borderRadius="md"
                                      justify="space-between"
                                      borderLeft="4px solid"
                                      borderLeftColor="blue.400"
                                    >
                                      <VStack align="start" spacing={1} flex={1}>
                                        <Text fontWeight="semibold">
                                          {schedule.semesterModuleId?.moduleId?.moduleName || 'Unknown Module'}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                          {schedule.semesterModuleId?.moduleId?.code || 'N/A'}
                                        </Text>
                                      </VStack>

                                      <VStack align="end" spacing={1} flex={1}>
                                        <Text fontWeight="semibold" color="purple.600">
                                          {schedule.dayOfWeek}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                          {schedule.startTime} - {schedule.endTime}
                                        </Text>
                                      </VStack>

                                      <VStack align="end" spacing={1} flex={1}>
                                        <Text fontSize="sm" color="gray.600">
                                          {schedule.roomId?.block} • {schedule.roomId?.floor} • {schedule.roomId?.roomNumber || 'N/A'}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                          Lecturer: {schedule.lecturerId?.userId?.name || 'Unassigned'}
                                        </Text>
                                      </VStack>

                                      <VStack align="end" spacing={1} flex={1}>
                                        <Text fontSize="sm" color="gray.600">
                                          Start: {schedule.moduleStartDate ? new Date(schedule.moduleStartDate).toLocaleDateString() : 'N/A'}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                          End: {schedule.moduleEndDate ? new Date(schedule.moduleEndDate).toLocaleDateString() : 'N/A'}
                                        </Text>
                                      </VStack>
                                    </HStack>
                                  ))}
                                </VStack>
                              )}

                              {/* Exam Schedules */}
                              {semester.examSchedules.length > 0 && (
                                <VStack spacing={2} align="stretch">
                                  <Text fontSize="sm" fontWeight="semibold" color="red.600" mb={1}>
                                    Exam Schedules:
                                  </Text>
                                  {semester.examSchedules.map((exam, examIndex) => (
                                    <HStack
                                      key={`exam-${examIndex}`}
                                      bg="red.50"
                                      p={3}
                                      borderRadius="md"
                                      justify="space-between"
                                      borderLeft="4px solid"
                                      borderLeftColor="red.400"
                                    >
                                      <VStack align="start" spacing={1} flex={1}>
                                        <Text fontWeight="semibold">
                                          {exam.semesterModuleId?.moduleId?.moduleName || exam.moduleId?.moduleName || 'Unknown Module'}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                          {exam.semesterModuleId?.moduleId?.code || exam.moduleId?.code || 'N/A'}
                                        </Text>
                                      </VStack>

                                      <VStack align="end" spacing={1} flex={1}>
                                        <Text fontWeight="semibold" color="red.600">
                                          {new Date(exam.examDate).toLocaleDateString('en-US', { weekday: 'long' })}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                          {exam.examTime} ({exam.durationMinute} min)
                                        </Text>
                                      </VStack>

                                      <VStack align="end" spacing={1} flex={1}>
                                        <Text fontSize="sm" color="gray.600">
                                          {exam.roomId?.block} • {exam.roomId?.floor} • {exam.roomId?.roomNumber || 'N/A'}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                          {exam.invigilators?.length || 0} Invigilator{exam.invigilators?.length !== 1 ? 's' : ''}
                                        </Text>
                                      </VStack>

                                      <VStack align="end" spacing={1} flex={1}>
                                        <Text fontSize="sm" color="gray.600">
                                          Date: {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'N/A'}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                          Duration: {exam.durationMinute} minutes
                                        </Text>
                                      </VStack>
                                    </HStack>
                                  ))}
                                </VStack>
                              )}

                              {/* Empty state if no schedules */}
                              {semester.classSchedules.length === 0 && semester.examSchedules.length === 0 && (
                                <Box textAlign="center" py={4} bg="gray.50" borderRadius="md">
                                  <Text color="gray.500" fontSize="sm">
                                    No schedules for this semester
                                  </Text>
                                </Box>
                              )}
                            </VStack>
                          </Box>
                        ))}
                    </VStack>
                  </Box>
                ));
              })()}
            </VStack>
          ) : (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">No schedules found</Text>
            </Box>
          )}
        </Box>

      </VStack>

      {/* Modals */}
      <UpdateScheduleModal
        schedule={selectedSchedule}
        isOpenEdit={isModalOpen}
        onCloseEdit={handleModalClose}
      />

      <ScheduleGenerationModal
        isOpen={isOpenGeneration}
        onClose={onCloseGeneration}
        generateExam={generateExam}
        setGenerateExam={setGenerateExam}
        onProceed={handleProceedGeneration}
      />

      <ImportScheduleModal
        isOpen={isOpenImport}
        onClose={onCloseImport}
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
      />
    </Box>
  )
}
