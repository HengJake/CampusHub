import Vehicle from "../../models/Transportation/vehicle.model.js";
import mongoose from "mongoose";

// Create a vehicle
export const createVehicle = async (req, res) => {
  const { plateNumber, type, capacity, status } = req.body;

  // Validation
  if (!plateNumber || !type || !capacity) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields (plateNumber, type, capacity)",
    });
  }

  if (!["bus", "car"].includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Type must be either 'bus' or 'car'",
    });
  }

  if (status && !["active", "inactive", "maintenance", "repair"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value",
    });
  }

  try {
    const newVehicle = new Vehicle({
      plateNumber,
      type,
      capacity,
      status,
    });

    await newVehicle.save();

    return res.status(201).json({
      success: true,
      data: newVehicle,
      message: "Vehicle created successfully",
    });
  } catch (error) {
    console.error("Error creating vehicle:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Plate number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();

    return res.status(200).json({
      success: true,
      data: vehicles,
      count: vehicles.length,
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get vehicle by ID
export const getVehicleById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicle ID format",
    });
  }

  try {
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Error fetching vehicle:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update vehicle
export const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicle ID format",
    });
  }

  if (updates.type && !["bus", "car"].includes(updates.type)) {
    return res.status(400).json({
      success: false,
      message: "Type must be either 'bus' or 'car'",
    });
  }

  if (updates.status && !["active", "inactive", "maintenance", "repair"].includes(updates.status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value",
    });
  }

  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedVehicle,
      message: "Vehicle updated successfully",
    });
  } catch (error) {
    console.error("Error updating vehicle:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Plate number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete vehicle
export const deleteVehicle = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicle ID format",
    });
  }

  try {
    const deleted = await Vehicle.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting vehicle:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
