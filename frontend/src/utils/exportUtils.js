// Programmer Name : Heng Jun Kai, Project Manager, Leader Full Stack developer
// Program Name: exportUtils.js
// Description: Export utility functions for generating Excel reports, CSV files, and data exports across different modules and data types
// First Written on: July 21, 2024
// Edited on: Friday, August 12, 2024

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Chart from 'chart.js/auto'

/**
 * Export data to PDF with customizable styling and layout
 * @param {Object} options - Configuration options for the export
 * @param {string} options.title - Main title of the document
 * @param {string} options.subtitle - Subtitle of the document
 * @param {Array} options.data - Array of data objects to export
 * @param {Array} options.columns - Array of column definitions
 * @param {Object} options.metadata - Additional metadata to display
 * @param {Object} options.styling - Custom styling options
 * @param {string} options.fileName - Name of the exported file
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 */
export const exportToPDF = async (options) => {
    const {
        title = 'Document',
        subtitle = '',
        data = [],
        columns = [],
        metadata = {},
        styling = {},
        fileName = 'export',
        onSuccess,
        onError
    } = options

    try {
        // Create new PDF document
        const doc = new jsPDF()

        // Default color scheme
        const defaultColors = {
            primary: [66, 139, 202],      // Blue
            secondary: [52, 73, 94],      // Dark blue-gray
            accent: [231, 76, 60],        // Red
            lightGray: [236, 240, 241],   // Light gray
            darkGray: [44, 62, 80],       // Dark gray
            white: [255, 255, 255],       // White
            black: [0, 0, 0]              // Black
        }

        // Merge custom colors with defaults
        const colors = { ...defaultColors, ...styling.colors }

        // Add header
        addHeader(doc, title, subtitle, colors)

        // Add metadata section if provided
        if (Object.keys(metadata).length > 0) {
            addMetadataSection(doc, metadata, colors)
        }

        // Add data table
        if (data.length > 0 && columns.length > 0) {
            addDataTable(doc, data, columns, colors, styling)
        }

        // Add footer
        addFooter(doc, colors)

        // Add page numbers
        addPageNumbers(doc, colors)

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0]
        const finalFileName = `${fileName}_${timestamp}.pdf`

        // Save the PDF
        doc.save(finalFileName)

        // Call success callback
        if (onSuccess) {
            onSuccess(finalFileName)
        }

        return { success: true, fileName: finalFileName }

    } catch (error) {
        console.error('Error exporting PDF:', error)

        // Call error callback
        if (onError) {
            onError(error)
        }

        return { success: false, error: error.message }
    }
}

/**
 * Add header section to the PDF
 */
const addHeader = (doc, title, subtitle, colors) => {
    // Add decorative header with color
    doc.setFillColor(...(colors.primary || [66, 139, 202]))
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')

    // Add title with white text on colored background
    doc.setTextColor(...(colors.white || [255, 255, 255]))
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(title || 'Document', 20, 25)

    // Add subtitle if provided
    if (subtitle) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text(subtitle, 20, 35)
    }

    // Reset text color for content
    doc.setTextColor(...(colors.black || [0, 0, 0]))
}

/**
 * Add metadata section to the PDF
 */
const addMetadataSection = (doc, metadata, colors) => {
    let currentY = 60

    // Add metadata section with colored background
    doc.setFillColor(...(colors.lightGray || [236, 240, 241]))
    doc.rect(15, currentY, doc.internal.pageSize.width - 30, 60, 'F')

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Information', 20, currentY + 15)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    // Display each metadata item
    Object.entries(metadata).forEach(([key, value]) => {
        const label = `${key}: ${value}`
        const wrappedText = doc.splitTextToSize(label, doc.internal.pageSize.width - 40)

        wrappedText.forEach((line, index) => {
            doc.text(line, 20, currentY + 30 + (index * 8))
        })

        currentY += wrappedText.length * 8 + 2
    })
}

/**
 * Add data table to the PDF
 */
const addDataTable = (doc, data, columns, colors, styling) => {
    // Create a new page for the table if needed
    if (doc.internal.pageSize.height < 100) {
        doc.addPage()
    }

    // Prepare table data
    const tableData = data.map(item =>
        columns.map(col => {
            const value = item[col.key] || ''
            return typeof value === 'object' ? JSON.stringify(value) : String(value)
        })
    )

    // Get column headers
    const headers = columns.map(col => col.label || col.key)

    // Add table
    autoTable(doc, {
        startY: styling.tableStartY || 50,
        head: [headers],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: colors.primary || [66, 139, 202],
            textColor: colors.white || [255, 255, 255],
            fontSize: styling.headerFontSize || 10,
            fontStyle: 'bold'
        },
        bodyStyles: {
            fontSize: styling.bodyFontSize || 9,
            cellPadding: styling.cellPadding || 4,
            textColor: colors.darkGray || [44, 62, 80]
        },
        alternateRowStyles: {
            fillColor: colors.lightGray || [236, 240, 241]
        },
        columnStyles: styling.columnStyles || {},
        margin: styling.tableMargin || { top: 50, left: 15, right: 15, bottom: 20 },
        tableWidth: styling.tableWidth || '100%',
        styles: {
            overflow: 'linebreak',
            cellWidth: 'auto'
        },
        didParseCell: function (data) {
            // Handle text overflow
            if (data.cell.text && data.cell.text.length > 25) {
                data.cell.text = data.cell.text.substring(0, 22) + '...'
            }
        }
    })
}

/**
 * Add footer to the PDF
 */
const addFooter = (doc, colors) => {
    const totalPages = doc.internal.getNumberOfPages()

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)

        // Add footer background
        doc.setFillColor(...(colors.primary || [66, 139, 202]))
        doc.rect(0, doc.internal.pageSize.height - 30, doc.internal.pageSize.width, 30, 'F')

        // Add footer text
        doc.setTextColor(...(colors.white || [255, 255, 255]))
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.height - 15)
    }
}

/**
 * Add page numbers to the PDF
 */
const addPageNumbers = (doc, colors) => {
    const totalPages = doc.internal.getNumberOfPages()

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)

        doc.setTextColor(...(colors.white || [255, 255, 255]))
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text(`${i}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 18, { align: 'center' })
    }
}

/**
 * Export schedule data specifically (specialized function)
 * @param {Object} scheduleData - Schedule data object
 * @param {Object} studentProfile - Student profile information
 * @param {Array} filteredSchedule - Filtered schedule data
 * @param {Object} options - Additional options
 */
export const exportScheduleToPDF = async (scheduleData, studentProfile, filteredSchedule, options = {}) => {

    const {
        onSuccess,
        onError,
        fileName = 'class_schedule'
    } = options

    try {
        // Create new PDF document
        const doc = new jsPDF()

        // Define color scheme
        const colors = {
            primary: [66, 139, 202],      // Blue
            secondary: [52, 73, 94],      // Dark blue-gray
            accent: [231, 76, 60],        // Red
            lightGray: [236, 240, 241],   // Light gray
            darkGray: [44, 62, 80],       // Dark gray
            white: [255, 255, 255],       // White
            black: [0, 0, 0]              // Black
        }

        // Add header
        addHeader(doc, 'Class Schedule', 'Academic Year Schedule Overview', colors)

        // Add student information section
        let currentY = 60
        doc.setFillColor(...colors.lightGray)
        doc.rect(15, currentY, doc.internal.pageSize.width - 30, 60, 'F')

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Student Information', 20, currentY + 15)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')

        // Student details with text wrapping
        const studentDetails = [
            `Student: ${studentProfile?.name || 'N/A'}`,
            `Student ID: ${studentProfile?.studentId || 'N/A'}`,
            `Program: ${studentProfile?.intakeCourse || 'N/A'}`,
            `Semester: ${studentProfile?.semester || 'N/A'}`
        ]

        studentDetails.forEach((detail, index) => {
            const wrappedText = doc.splitTextToSize(detail, doc.internal.pageSize.width - 40)
            wrappedText.forEach((line, lineIndex) => {
                doc.text(line, 20, currentY + 30 + (index * 8) + (lineIndex * 8))
            })
            currentY += wrappedText.length * 8 + 2
        })

        // Add statistics section
        const statsY = currentY + 15
        const safeFilteredSchedule = filteredSchedule || []
        const totalCredits = safeFilteredSchedule.reduce((sum, course) => sum + (course.credits || 0), 0)
        const lectureCount = safeFilteredSchedule.filter(course => course.type === "Lecture").length
        const labCount = safeFilteredSchedule.filter(course => course.type === "Lab").length

        doc.setFillColor(...colors.secondary)
        doc.rect(15, statsY, doc.internal.pageSize.width - 30, 50, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Academic Summary', 20, statsY + 15)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text(`Total Credits: ${totalCredits}`, 20, statsY + 30)
        doc.text(`Enrolled Courses: ${safeFilteredSchedule.length}`, 20, statsY + 40)
        doc.text(`Lectures: ${lectureCount}`, 20, statsY + 50)

        // Reset text color
        doc.setTextColor(0, 0, 0)

        // Add schedule table on a new landscape page
        if (safeFilteredSchedule.length > 0) {
            doc.addPage([], 'landscape')

            // Add header to table page
            doc.setFillColor(...colors.primary)
            doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('Class Schedule Table', 20, 25)

            doc.setTextColor(0, 0, 0)

            // Prepare table data
            const tableData = safeFilteredSchedule.map(schedule => [
                schedule.courseCode || '',
                schedule.courseName || '',
                schedule.day || '',
                schedule.time || '',
                schedule.room || '',
                schedule.instructor || '',
                `${schedule.credits || 0} Credits`,
                schedule.type || ''
            ])

            // Add table
            autoTable(doc, {
                startY: 50,
                head: [['Course Code', 'Course Name', 'Day', 'Time', 'Room', 'Instructor', 'Credits', 'Type']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: colors.primary,
                    textColor: colors.white,
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    fontSize: 9,
                    cellPadding: 4,
                    textColor: colors.darkGray
                },
                alternateRowStyles: {
                    fillColor: colors.lightGray
                },
                columnStyles: {
                    0: { cellWidth: '12%' }, // Course Code
                    1: { cellWidth: '22%' }, // Course Name
                    2: { cellWidth: '10%' }, // Day
                    3: { cellWidth: '12%' }, // Time
                    4: { cellWidth: '12%' }, // Room
                    5: { cellWidth: '18%' }, // Instructor
                    6: { cellWidth: '10%' }, // Credits
                    7: { cellWidth: '6%' }   // Type
                },
                margin: { top: 50, left: 15, right: 15, bottom: 20 },
                tableWidth: '100%',
                styles: {
                    overflow: 'linebreak',
                    cellWidth: 'auto'
                },
                didParseCell: function (data) {
                    if (data.cell.text && data.cell.text.length > 25) {
                        if (data.column.index === 1) { // Course Name column
                            const words = data.cell.text.split(' ')
                            if (words.length > 3) {
                                data.cell.text = words.slice(0, 3).join(' ') + '...'
                            } else {
                                data.cell.text = data.cell.text.substring(0, 22) + '...'
                            }
                        } else {
                            data.cell.text = data.cell.text.substring(0, 22) + '...'
                        }
                    }
                }
            })

            // Add detailed course information on a new page
            doc.addPage()

            // Add header to course details page
            doc.setFillColor(...colors.primary)
            doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('Detailed Course Information', 20, 25)

            doc.setTextColor(0, 0, 0)

            let courseY = 60
            safeFilteredSchedule.forEach((course, index) => {
                // Check if we need a new page with more buffer space
                if (courseY > doc.internal.pageSize.height - 150) {
                    doc.addPage()
                    courseY = 60
                }

                // Calculate dynamic height for course card
                let cardHeight = 100; // Base height for header and basic details

                // Add height for description if it exists
                if (course.description && course.description !== 'No description available') {
                    const wrappedDesc = doc.splitTextToSize(`Description: ${course.description}`, doc.internal.pageSize.width - 40)
                    cardHeight += wrappedDesc.length * 8 + 10
                }

                // Add height for prerequisites
                if (course.prerequisites && course.prerequisites !== 'None' && course.prerequisites !== '') {
                    const wrappedPrereq = doc.splitTextToSize(`Prerequisites: ${course.prerequisites}`, doc.internal.pageSize.width - 40)
                    cardHeight += wrappedPrereq.length * 8 + 5
                } else {
                    cardHeight += 13 // Height for "Prerequisites: None"
                }

                // Add height for textbook
                if (course.textbook && course.textbook !== 'Not specified' && course.textbook !== '') {
                    const wrappedTextbook = doc.splitTextToSize(`Textbook: ${course.textbook}`, doc.internal.pageSize.width - 40)
                    cardHeight += wrappedTextbook.length * 8 + 5
                } else {
                    cardHeight += 13 // Height for "Textbook: Not specified"
                }

                // Course header with dynamic height
                doc.setFillColor(...colors.lightGray)
                doc.rect(15, courseY, doc.internal.pageSize.width - 30, cardHeight, 'F')

                doc.setFontSize(14)
                doc.setFont('helvetica', 'bold')
                doc.text(`${course.courseCode || 'N/A'} - ${course.courseName || 'N/A'}`, 20, courseY + 15)

                doc.setFontSize(11)
                doc.setFont('helvetica', 'normal')

                // Course details
                const courseDetails = [
                    `Credits: ${course.credits || 0}`,
                    `Type: ${course.type || 'N/A'}`,
                    `Instructor: ${course.instructor || 'N/A'}`,
                    `Room: ${course.room || 'N/A'}`,
                    `Building: ${course.building || 'N/A'}`,
                    `Day: ${course.day || 'N/A'}`,
                    `Time: ${course.time || 'N/A'}`
                ]

                courseDetails.forEach((detail, detailIndex) => {
                    doc.text(detail, 20, courseY + 30 + (detailIndex * 8))
                })

                // Course description
                if (course.description && course.description !== 'No description available') {
                    const wrappedDesc = doc.splitTextToSize(`Description: ${course.description}`, doc.internal.pageSize.width - 40)
                    wrappedDesc.forEach((line, lineIndex) => {
                        doc.text(line, 20, courseY + 85 + (lineIndex * 8))
                    })
                    courseY += wrappedDesc.length * 8 + 10
                }

                // Prerequisites and textbook
                if (course.prerequisites && course.prerequisites !== 'None' && course.prerequisites !== '') {
                    const wrappedPrereq = doc.splitTextToSize(`Prerequisites: ${course.prerequisites}`, doc.internal.pageSize.width - 40)
                    wrappedPrereq.forEach((line, lineIndex) => {
                        doc.text(line, 20, courseY + 85 + (lineIndex * 8))
                    })
                    courseY += wrappedPrereq.length * 8 + 5
                } else {
                    // Show "No prerequisites" when none exist
                    doc.text(`Prerequisites: None`, 20, courseY + 85)
                    courseY += 13
                }

                courseY += cardHeight + 20 // Add 20px spacing between courses
            })
        }

        // Add footer and page numbers
        addFooter(doc, colors)
        addPageNumbers(doc, colors)

        // Generate filename
        const timestamp = new Date().toISOString().split('T')[0]
        const studentId = studentProfile?.studentId || 'unknown'
        const finalFileName = `${fileName}_${studentId}_${timestamp}.pdf`

        // Save the PDF
        doc.save(finalFileName)

        if (onSuccess) {
            onSuccess(finalFileName)
        }

        return { success: true, fileName: finalFileName }

    } catch (error) {
        console.error('Error exporting schedule PDF:', error)

        if (onError) {
            onError(error)
        }

        return { success: false, error: error.message }
    }
}

/**
 * Export generic table data to PDF
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column definitions
 * @param {Object} options - Export options
 */
export const exportTableToPDF = async (data, columns, options = {}) => {
    const {
        title = 'Data Export',
        subtitle = '',
        metadata = {},
        styling = {},
        fileName = 'table_export',
        onSuccess,
        onError
    } = options

    return exportToPDF({
        title,
        subtitle,
        data,
        columns,
        metadata,
        styling,
        fileName,
        onSuccess,
        onError
    })
}

/**
 * Export detailed course information to PDF
 * @param {Array} courses - Array of course objects
 * @param {Object} studentProfile - Student profile information
 * @param {Object} options - Additional options
 */
export const exportCourseInfoToPDF = async (courses, studentProfile, options = {}) => {
    const {
        onSuccess,
        onError,
        fileName = 'course_information'
    } = options

    try {
        // Create new PDF document
        const doc = new jsPDF()

        // Define color scheme
        const colors = {
            primary: [66, 139, 202],      // Blue
            secondary: [52, 73, 94],      // Dark blue-gray
            accent: [231, 76, 60],        // Red
            lightGray: [236, 240, 241],   // Light gray
            darkGray: [44, 62, 80],       // Dark gray
            white: [255, 255, 255],       // White
            black: [0, 0, 0]              // Black
        }

        // Add header
        addHeader(doc, 'Course Information', 'Detailed Course Overview', colors)

        // Add student information section
        let currentY = 60
        doc.setFillColor(...(colors.lightGray || [236, 240, 241]))
        doc.rect(15, currentY, doc.internal.pageSize.width - 30, 60, 'F')

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Student Information', 20, currentY + 15)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')

        // Student details with text wrapping
        const studentDetails = [
            `Student: ${studentProfile?.name || 'N/A'}`,
            `Student ID: ${studentProfile?.studentId || 'N/A'}`,
            `Program: ${studentProfile?.intakeCourse || 'N/A'}`,
            `Semester: ${studentProfile?.semester || 'N/A'}`
        ]

        studentDetails.forEach((detail, index) => {
            const wrappedText = doc.splitTextToSize(detail, doc.internal.pageSize.width - 40)
            wrappedText.forEach((line, lineIndex) => {
                doc.text(line, 20, currentY + 30 + (index * 8) + (lineIndex * 8))
            })
            currentY += wrappedText.length * 8 + 2
        })

        // Add course summary section
        const summaryY = currentY + 15
        const safeCourses = courses || []
        const totalCredits = safeCourses.reduce((sum, course) => sum + (course.credits || 0), 0)
        const lectureCount = safeCourses.filter(course => course.type === "Lecture").length
        const labCount = safeCourses.filter(course => course.type === "Lab").length

        doc.setFillColor(...(colors.secondary || [52, 73, 94]))
        doc.rect(15, summaryY, doc.internal.pageSize.width - 30, 50, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Course Summary', 20, summaryY + 15)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text(`Total Credits: ${totalCredits}`, 20, summaryY + 30)
        doc.text(`Enrolled Courses: ${safeCourses.length}`, 20, summaryY + 40)
        doc.text(`Lectures: ${lectureCount} | Labs: ${labCount}`, 20, summaryY + 50)

        // Reset text color
        doc.setTextColor(0, 0, 0)

        // Add detailed course information on a new page
        if (safeCourses.length > 0) {
            doc.addPage()

            // Add header to course details page
            doc.setFillColor(...(colors.primary || [66, 139, 202]))
            doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('Detailed Course Information', 20, 25)

            doc.setTextColor(0, 0, 0)

            let courseY = 60
            safeCourses.forEach((course, index) => {
                // Check if we need a new page
                if (courseY > doc.internal.pageSize.height - 100) {
                    doc.addPage()
                    courseY = 60
                }

                // Course header
                doc.setFillColor(...(colors.lightGray || [236, 240, 241]))
                doc.rect(15, courseY, doc.internal.pageSize.width - 30, 80, 'F')

                doc.setFontSize(14)
                doc.setFont('helvetica', 'bold')
                doc.text(`${course.courseCode || 'N/A'} - ${course.courseName || 'N/A'}`, 20, courseY + 15)

                doc.setFontSize(11)
                doc.setFont('helvetica', 'normal')

                // Course details
                const courseDetails = [
                    `Credits: ${course.credits || 0}`,
                    `Type: ${course.type || 'N/A'}`,
                    `Instructor: ${course.instructor || 'N/A'}`,
                    `Room: ${course.room || 'N/A'}`,
                    `Building: ${course.building || 'N/A'}`,
                    `Day: ${course.day || 'N/A'}`,
                    `Time: ${course.time || 'N/A'}`
                ]

                courseDetails.forEach((detail, detailIndex) => {
                    doc.text(detail, 20, courseY + 30 + (detailIndex * 8))
                })

                // Course description
                if (course.description && course.description !== 'No description available') {
                    const wrappedDesc = doc.splitTextToSize(`Description: ${course.description}`, doc.internal.pageSize.width - 40)
                    wrappedDesc.forEach((line, lineIndex) => {
                        doc.text(line, 20, courseY + 85 + (lineIndex * 8))
                    })
                    courseY += wrappedDesc.length * 8 + 10
                }

                courseY += 100
            })
        }

        // Add footer and page numbers
        addFooter(doc, colors)
        addPageNumbers(doc, colors)

        // Generate filename
        const timestamp = new Date().toISOString().split('T')[0]
        const studentId = studentProfile?.studentId || 'unknown'
        const finalFileName = `${fileName}_${studentId}_${timestamp}.pdf`

        // Save the PDF
        doc.save(finalFileName)

        if (onSuccess) {
            onSuccess(finalFileName)
        }

        return { success: true, fileName: finalFileName }

    } catch (error) {
        console.error('Error exporting course info PDF:', error)

        if (onError) {
            onError(error)
        }

        return { success: false, error: error.message }
    }
}

/**
 * Export booking management data to PDF
 * @param {Array} bookings - Array of booking objects
 * @param {Object} options - Additional options
 */
export const exportBookingsToPDF = async (bookings, options = {}) => {
    const {
        onSuccess,
        onError,
        fileName = 'booking_management_report'
    } = options

    try {
        // Create new PDF document
        const doc = new jsPDF()

        // Define color scheme
        const colors = {
            primary: [66, 139, 202],      // Blue
            secondary: [52, 73, 94],      // Dark blue-gray
            accent: [231, 76, 60],        // Red
            lightGray: [236, 240, 241],   // Light gray
            darkGray: [44, 62, 80],       // Dark gray
            white: [255, 255, 255],       // White
            black: [0, 0, 0]              // Black
        }

        // Add header
        addHeader(doc, 'Booking Management Report', 'Facility Booking Overview', colors)

        // Add summary section
        let currentY = 60
        const safeBookings = bookings || []

        // Calculate statistics
        const pendingCount = safeBookings.filter(b => b.status === "pending").length
        const confirmedCount = safeBookings.filter(b => b.status === "confirmed").length
        const cancelledCount = safeBookings.filter(b => b.status === "cancelled").length
        const completedCount = safeBookings.filter(b => b.status === "completed").length
        const totalCount = safeBookings.length

        // Summary section with colored background
        doc.setFillColor(...colors.lightGray)
        doc.rect(15, currentY, doc.internal.pageSize.width - 30, 60, 'F')

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Booking Summary', 20, currentY + 15)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text(`Total Bookings: ${totalCount}`, 20, currentY + 30)
        doc.text(`Pending: ${pendingCount} | Confirmed: ${confirmedCount} | Cancelled: ${cancelledCount} | Completed: ${completedCount}`, 20, currentY + 45)

        // Add detailed booking table on a new page
        if (safeBookings.length > 0) {
            doc.addPage()

            // Add header to table page
            doc.setFillColor(...colors.primary)
            doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('Detailed Booking Information', 20, 25)

            doc.setTextColor(0, 0, 0)

            // Prepare table data
            const tableData = safeBookings.map(booking => [
                booking?.studentId?.userId?.name || booking?.studentName || 'N/A',
                booking?.resourceId?.name || booking?.facility || 'N/A',
                formatDate(booking?.bookingDate) || 'N/A',
                `${formatTime(booking?.startTime) || 'N/A'} - ${formatTime(booking?.endTime) || 'N/A'}`,
                booking?.status || 'N/A',
                booking?.groupSize || 'N/A'
            ])

            // Add table
            autoTable(doc, {
                startY: 50,
                head: [['Student', 'Facility', 'Date', 'Time', 'Status', 'Group Size']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: colors.primary,
                    textColor: colors.white,
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    fontSize: 9,
                    cellPadding: 4,
                    textColor: colors.darkGray
                },
                alternateRowStyles: {
                    fillColor: colors.lightGray
                },
                columnStyles: {
                    0: { cellWidth: '20%' }, // Student
                    1: { cellWidth: '20%' }, // Facility
                    2: { cellWidth: '15%' }, // Date
                    3: { cellWidth: '20%' }, // Time
                    4: { cellWidth: '15%' }, // Status
                    5: { cellWidth: '10%' }  // Group Size
                },
                margin: { top: 50, left: 15, right: 15, bottom: 20 },
                tableWidth: '100%',
                styles: {
                    overflow: 'linebreak',
                    cellWidth: 'auto'
                },
                didParseCell: function (data) {
                    if (data.cell.text && data.cell.text.length > 25) {
                        data.cell.text = data.cell.text.substring(0, 22) + '...'
                    }
                }
            })

            // Add status breakdown on a new page
            doc.addPage()

            // Add header to status breakdown page
            doc.setFillColor(...colors.primary)
            doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('Status Breakdown', 20, 25)

            doc.setTextColor(0, 0, 0)

            let statusY = 60
            const statusGroups = [
                { status: 'pending', label: 'Pending Approvals', color: [237, 137, 54] },
                { status: 'confirmed', label: 'Confirmed Bookings', color: [72, 187, 120] },
                { status: 'cancelled', label: 'Cancelled Bookings', color: [229, 62, 62] },
                { status: 'completed', label: 'Completed Bookings', color: [66, 153, 225] }
            ]

            statusGroups.forEach((group, index) => {
                const groupBookings = safeBookings.filter(b => b.status === group.status)

                if (groupBookings.length > 0) {
                    // Check if we need a new page
                    if (statusY > doc.internal.pageSize.height - 150) {
                        doc.addPage()
                        statusY = 60
                    }

                    // Status group header
                    doc.setFillColor(...group.color)
                    doc.rect(15, statusY, doc.internal.pageSize.width - 30, 25, 'F')

                    doc.setTextColor(255, 255, 255)
                    doc.setFontSize(12)
                    doc.setFont('helvetica', 'bold')
                    doc.text(`${group.label} (${groupBookings.length})`, 20, statusY + 15)

                    doc.setTextColor(0, 0, 0)
                    statusY += 35

                    // List bookings in this status
                    groupBookings.slice(0, 5).forEach((booking, bookingIndex) => {
                        if (statusY > doc.internal.pageSize.height - 100) {
                            doc.addPage()
                            statusY = 60
                        }

                        doc.setFontSize(10)
                        doc.setFont('helvetica', 'normal')

                        const studentName = booking?.studentId?.userId?.name || booking?.studentName || 'N/A'
                        const facilityName = booking?.resourceId?.name || booking?.facility || 'N/A'
                        const date = formatDate(booking?.bookingDate) || 'N/A'
                        const time = `${formatTime(booking?.startTime) || 'N/A'} - ${formatTime(booking?.endTime) || 'N/A'}`

                        doc.text(`${bookingIndex + 1}. ${studentName} - ${facilityName}`, 20, statusY)
                        doc.text(`   Date: ${date} | Time: ${time}`, 25, statusY + 8)

                        statusY += 20
                    })

                    if (groupBookings.length > 5) {
                        doc.text(`... and ${groupBookings.length - 5} more`, 20, statusY)
                        statusY += 15
                    }

                    statusY += 20
                }
            })
        }

        // Add footer and page numbers
        addFooter(doc, colors)
        addPageNumbers(doc, colors)

        // Generate filename
        const timestamp = new Date().toISOString().split('T')[0]
        const finalFileName = `${fileName}_${timestamp}.pdf`

        // Save the PDF
        doc.save(finalFileName)

        if (onSuccess) {
            onSuccess(finalFileName)
        }

        return { success: true, fileName: finalFileName }

    } catch (error) {
        console.error('Error exporting bookings PDF:', error)

        if (onError) {
            onError(error)
        }

        return { success: false, error: error.message }
    }
}

// Helper function for date formatting
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    } catch (error) {
        return dateString
    }
}

// Helper function for time formatting
const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    return timeString
}

// Export booking statistics as pie chart PDF (includes all detailed information + chart)
export const exportBookingStatsToPDF = async (bookings, options = {}) => {
    const {
        onSuccess,
        onError,
        fileName = 'booking_statistics_report'
    } = options

    try {
        // Create a hidden canvas for the chart
        const canvas = document.createElement('canvas')
        canvas.width = 600
        canvas.height = 400
        canvas.style.display = 'none'
        document.body.appendChild(canvas)

        // Calculate booking statistics
        const safeBookings = bookings || []
        const totalBookings = safeBookings.length

        // Status breakdown
        const statusStats = {
            pending: safeBookings.filter(b => b.status === "pending").length,
            confirmed: safeBookings.filter(b => b.status === "confirmed").length,
            cancelled: safeBookings.filter(b => b.status === "cancelled").length,
            completed: safeBookings.filter(b => b.status === "completed").length
        }

        // Resource type breakdown (assuming resourceId.name contains the type)
        const resourceStats = {}
        safeBookings.forEach(booking => {
            const resourceType = booking?.resourceId?.name || 'Unknown'
            resourceStats[resourceType] = (resourceStats[resourceType] || 0) + 1
        })

        // Acceptance rate
        const totalProcessed = statusStats.confirmed + statusStats.cancelled
        const acceptanceRate = totalProcessed > 0 ? (statusStats.confirmed / totalProcessed * 100).toFixed(1) : 0

        // Create Chart.js context
        const ctx = canvas.getContext('2d')

        // Create status pie chart
        const statusChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
                datasets: [{
                    data: [statusStats.pending, statusStats.confirmed, statusStats.cancelled, statusStats.completed],
                    backgroundColor: [
                        '#FFA500', // Orange for pending
                        '#4CAF50', // Green for confirmed
                        '#F44336', // Red for cancelled
                        '#2196F3'  // Blue for completed
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14
                            },
                            padding: 20
                        }
                    },
                    title: {
                        display: true,
                        text: 'Booking Status Distribution',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: 20
                    }
                }
            }
        })

        // Wait for chart to render
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Convert canvas to base64
        const chartImage = canvas.toDataURL('image/png')

        // Create PDF
        const doc = new jsPDF()
        const colors = {
            primary: [66, 139, 202],
            secondary: [52, 73, 94],
            accent: [231, 76, 60],
            lightGray: [236, 240, 241],
            darkGray: [44, 62, 80],
            white: [255, 255, 255],
            black: [0, 0, 0]
        }

        // Add header
        addHeader(doc, 'Booking Statistics Report', 'Comprehensive Overview of Facility Bookings', colors)

        // Add summary section (same as original exportBookingsToPDF)
        let currentY = 60
        const pendingCount = safeBookings.filter(b => b.status === "pending").length
        const confirmedCount = safeBookings.filter(b => b.status === "confirmed").length
        const cancelledCount = safeBookings.filter(b => b.status === "cancelled").length
        const completedCount = safeBookings.filter(b => b.status === "completed").length
        const totalCount = safeBookings.length

        // Summary section with colored background
        doc.setFillColor(...colors.lightGray)
        doc.rect(15, currentY, doc.internal.pageSize.width - 30, 60, 'F')

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Booking Summary', 20, currentY + 15)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text(`Total Bookings: ${totalCount}`, 20, currentY + 30)
        doc.text(`Pending: ${pendingCount} | Confirmed: ${confirmedCount} | Cancelled: ${cancelledCount} | Completed: ${completedCount}`, 20, currentY + 45)

        // Add detailed booking table on a new page (same as original)
        if (safeBookings.length > 0) {
            doc.addPage()

            // Add header to table page
            doc.setFillColor(...colors.primary)
            doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('Detailed Booking Information', 20, 25)

            doc.setTextColor(0, 0, 0)

            // Prepare table data
            const tableData = safeBookings.map(booking => [
                booking?.studentId?.userId?.name || booking?.studentName || 'N/A',
                booking?.resourceId?.name || booking?.facility || 'N/A',
                formatDate(booking?.bookingDate) || 'N/A',
                `${formatTime(booking?.startTime) || 'N/A'} - ${formatTime(booking?.endTime) || 'N/A'}`,
                booking?.status || 'N/A',
                booking?.groupSize || 'N/A'
            ])

            // Add table
            autoTable(doc, {
                startY: 50,
                head: [['Student', 'Facility', 'Date', 'Time', 'Status', 'Group Size']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: colors.primary,
                    textColor: colors.white,
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    fontSize: 9,
                    cellPadding: 4,
                    textColor: colors.darkGray
                },
                alternateRowStyles: {
                    fillColor: colors.lightGray
                },
                columnStyles: {
                    0: { cellWidth: '20%' }, // Student
                    1: { cellWidth: '20%' }, // Facility
                    2: { cellWidth: '15%' }, // Date
                    3: { cellWidth: '20%' }, // Time
                    4: { cellWidth: '15%' }, // Status
                    5: { cellWidth: '10%' }  // Group Size
                },
                margin: { top: 50, left: 15, right: 15, bottom: 20 },
                tableWidth: '100%',
                styles: {
                    overflow: 'linebreak',
                    cellWidth: 'auto'
                },
                didParseCell: function (data) {
                    if (data.cell.text && data.cell.text.length > 25) {
                        data.cell.text = data.cell.text.substring(0, 22) + '...'
                    }
                }
            })

            // Add status breakdown on a new page (same as original)
            doc.addPage()

            // Add header to status breakdown page
            doc.setFillColor(...colors.primary)
            doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')

            doc.setTextColor(255, 255, 255)
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('Status Breakdown', 20, 25)

            doc.setTextColor(0, 0, 0)

            let statusY = 60
            const statusGroups = [
                { status: 'pending', label: 'Pending Approvals', color: [237, 137, 54] },
                { status: 'confirmed', label: 'Confirmed Bookings', color: [72, 187, 120] },
                { status: 'cancelled', label: 'Cancelled Bookings', color: [229, 62, 62] },
                { status: 'completed', label: 'Completed Bookings', color: [66, 153, 225] }
            ]

            statusGroups.forEach((group, index) => {
                const groupBookings = safeBookings.filter(b => b.status === group.status)

                if (groupBookings.length > 0) {
                    // Check if we need a new page
                    if (statusY > doc.internal.pageSize.height - 150) {
                        doc.addPage()
                        statusY = 60
                    }

                    // Status group header
                    doc.setFillColor(...group.color)
                    doc.rect(15, statusY, doc.internal.pageSize.width - 30, 25, 'F')

                    doc.setTextColor(255, 255, 255)
                    doc.setFontSize(12)
                    doc.setFont('helvetica', 'bold')
                    doc.text(`${group.label} (${groupBookings.length})`, 20, statusY + 15)

                    doc.setTextColor(0, 0, 0)
                    statusY += 35

                    // List bookings in this status
                    groupBookings.slice(0, 5).forEach((booking, bookingIndex) => {
                        if (statusY > doc.internal.pageSize.height - 100) {
                            doc.addPage()
                            statusY = 60
                        }

                        doc.setFontSize(10)
                        doc.setFont('helvetica', 'normal')

                        const studentName = booking?.studentId?.userId?.name || booking?.studentName || 'N/A'
                        const facilityName = booking?.resourceId?.name || booking?.facility || 'N/A'
                        const date = formatDate(booking?.bookingDate) || 'N/A'
                        const time = `${formatTime(booking?.startTime) || 'N/A'} - ${formatTime(booking?.endTime) || 'N/A'}`

                        doc.text(`${bookingIndex + 1}. ${studentName} - ${facilityName}`, 20, statusY)
                        doc.text(`   Date: ${date} | Time: ${time}`, 25, statusY + 8)

                        statusY += 20
                    })

                    if (groupBookings.length > 5) {
                        doc.text(`... and ${groupBookings.length - 5} more`, 20, statusY)
                        statusY += 15
                    }

                    statusY += 20
                }
            })
        }

        // Add pie chart on a new page
        doc.addPage()

        // Add header to chart page
        doc.setFillColor(...colors.primary)
        doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text('Visual Statistics & Charts', 20, 25)

        doc.setTextColor(0, 0, 0)

        // Add enhanced summary statistics
        currentY = 60
        doc.setFillColor(...colors.lightGray)
        doc.rect(15, currentY, doc.internal.pageSize.width - 30, 80, 'F')

        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...colors.darkGray)
        doc.text('Enhanced Summary Statistics', 20, currentY + 15)

        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text(`Total Bookings: ${totalBookings}`, 20, currentY + 35)
        doc.text(`Pending: ${statusStats.pending} (${totalBookings > 0 ? (statusStats.pending / totalBookings * 100).toFixed(1) : 0}%)`, 20, currentY + 50)
        doc.text(`Confirmed: ${statusStats.confirmed} (${totalBookings > 0 ? (statusStats.confirmed / totalBookings * 100).toFixed(1) : 0}%)`, 20, currentY + 65)
        doc.text(`Acceptance Rate: ${acceptanceRate}%`, 20, currentY + 80)

        // Add pie chart
        currentY += 100
        doc.addImage(chartImage, 'PNG', 20, currentY, 170, 120)

        // Add resource type breakdown
        currentY += 140
        doc.setFillColor(...colors.lightGray)
        doc.rect(15, currentY, doc.internal.pageSize.width - 30, 60, 'F')

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Resource Type Breakdown', 20, currentY + 15)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        let resourceY = currentY + 35
        Object.entries(resourceStats).forEach(([resourceType, count]) => {
            const percentage = totalBookings > 0 ? (count / totalBookings * 100).toFixed(1) : 0
            doc.text(`${resourceType}: ${count} (${percentage}%)`, 20, resourceY)
            resourceY += 12
        })

        // Add footer and page numbers
        addFooter(doc, colors)
        addPageNumbers(doc, colors)

        // Clean up
        document.body.removeChild(canvas)
        statusChart.destroy()

        // Save PDF
        const timestamp = new Date().toISOString().split('T')[0]
        const finalFileName = `${fileName}_${timestamp}.pdf`
        doc.save(finalFileName)

        if (onSuccess) { onSuccess(finalFileName) }
        return { success: true, fileName: finalFileName }

    } catch (error) {
        console.error('Error exporting booking statistics PDF:', error)

        // Clean up canvas if it exists
        const existingCanvas = document.querySelector('canvas[style*="display: none"]')
        if (existingCanvas) {
            document.body.removeChild(existingCanvas)
        }

        if (onError) { onError(error) }
        return { success: false, error: error.message }
    }
}
