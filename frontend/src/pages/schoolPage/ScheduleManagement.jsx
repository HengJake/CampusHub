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
          scheduleData={scheduleData}
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
