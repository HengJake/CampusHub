// import BusSchedule from "../../models/Transportation/busShcedule.model.js";
// import mongoose from "mongoose";

// // Create a Bus Schedule
// export const createBusSchedule = async (req, res) => {
//   const { routeID, vehiclesID, departureTime, arrivalTime, dayActive, active } = req.body;

//   if (!routeID || !vehiclesID || !departureTime || !arrivalTime || !dayActive) {
//     return res.status(400).json({
//       success: false,
//       message: "Please provide all required fields",
//     });
//   }

//   if (!Array.isArray(routeID) || !routeID.every(id => mongoose.Types.ObjectId.isValid(id))) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid routeID array",
//     });
//   }

//   if (!mongoose.Types.ObjectId.isValid(vehiclesID)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid vehiclesID",
//     });
//   }

//   if (![1, 2, 3, 4, 5, 6, 7].includes(dayActive)) {
//     return res.status(400).json({
//       success: false,
//       message: "dayActive must be a number from 1 (Mon) to 7 (Sun)",
//     });
//   }

//   try {
//     const newSchedule = new BusSchedule({
//       routeID,
//       vehiclesID,
//       departureTime,
//       arrivalTime,
//       dayActive,
//       active,
//     });

//     await newSchedule.save();

//     return res.status(201).json({
//       success: true,
//       data: newSchedule,
//       message: "Bus schedule created successfully",
//     });
//   } catch (error) {
//     console.error("Error creating bus schedule:", error.message);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // Get all bus schedules
// export const getAllBusSchedules = async (req, res) => {
//   try {
//     const schedules = await BusSchedule.find({})
//       .populate("routeID")
//       .populate("vehiclesID");

//     return res.status(200).json({
//       success: true,
//       data: schedules,
//       count: schedules.length,
//     });
//   } catch (error) {
//     console.error("Error fetching bus schedules:", error.message);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// // Get a schedule by ID
// export const getBusScheduleById = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ success: false, message: "Invalid schedule ID format" });
//   }

//   try {
//     const schedule = await BusSchedule.findById(id)
//       .populate("routeID")
//       .populate("vehiclesID");

//     if (!schedule) {
//       return res.status(404).json({ success: false, message: "Schedule not found" });
//     }

//     return res.status(200).json({ success: true, data: schedule });
//   } catch (error) {
//     console.error("Error fetching schedule:", error.message);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// // Update schedule
// export const updateBusSchedule = async (req, res) => {
//   const { id } = req.params;
//   const updates = req.body;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ success: false, message: "Invalid schedule ID format" });
//   }

//   try {
//     const updatedSchedule = await BusSchedule.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedSchedule) {
//       return res.status(404).json({ success: false, message: "Schedule not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       data: updatedSchedule,
//       message: "Schedule updated successfully",
//     });
//   } catch (error) {
//     console.error("Error updating schedule:", error.message);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// // Delete schedule
// export const deleteBusSchedule = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ success: false, message: "Invalid schedule ID format" });
//   }

//   try {
//     const deleted = await BusSchedule.findByIdAndDelete(id);

//     if (!deleted) {
//       return res.status(404).json({ success: false, message: "Schedule not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Schedule deleted successfully",
//       data: deleted,
//     });
//   } catch (error) {
//     console.error("Error deleting schedule:", error.message);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };
