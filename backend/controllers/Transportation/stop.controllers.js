import Stop from "../../models/Transportation/stop.model.js";
import mongoose from "mongoose";

export const createStop = async (req, res) => {
  const { name, type } = req.body;

  // Validate required fields
  if (!name || !type) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all required fields" });
  }

  // Validate type enum
  if (!["dorm", "campus"].includes(type)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Type must be either 'dorm' or 'campus'",
      });
  }

  const newStop = new Stop({
    name,
    type,
  });

  try {
    await newStop.save();
    res.status(201).json({
      success: true,
      data: newStop,
      message: "Stop created successfully",
    });
  } catch (error) {
    console.error("Error in createStop:", error.message);

    // Handle duplicate name error (if you add unique constraint later)
    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${
          duplicateKey.charAt(0).toUpperCase() + duplicateKey.slice(1)
        } already exists`,
      });
    }

    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllStops = async (req, res) => {
  try {
    const stops = await Stop.find({});

    return res.status(200).json({
      success: true,
      data: stops,
      count: stops.length,
    });
  } catch (error) {
    console.error("Error fetching stops:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStopById = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid stop ID format",
    });
  }

  try {
    const stop = await Stop.findById(id);

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: stop,
    });
  } catch (error) {
    console.error("Error fetching stop:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStopsByType = async (req, res) => {
  const { type } = req.params;

  // Validate type
  if (!["dorm", "campus"].includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Type must be either 'dorm' or 'campus'",
    });
  }

  try {
    const stops = await Stop.find({ type });

    return res.status(200).json({
      success: true,
      data: stops,
      count: stops.length,
    });
  } catch (error) {
    console.error("Error fetching stops by type:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateStop = async (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid stop ID format",
    });
  }

  // Validate type if provided
  if (type && !["dorm", "campus"].includes(type)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Type must be either 'dorm' or 'campus'",
      });
  }

  try {
    const updatedStop = await Stop.findByIdAndUpdate(
      id,
      { ...(name && { name }), ...(type && { type }) },
      { new: true, runValidators: true }
    );

    if (!updatedStop) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedStop,
      message: "Stop updated successfully",
    });
  } catch (error) {
    console.error("Error updating stop:", error.message);

    // Handle duplicate name error (if you add unique constraint later)
    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${
          duplicateKey.charAt(0).toUpperCase() + duplicateKey.slice(1)
        } already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteStop = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid stop ID format",
    });
  }

  try {
    const deletedStop = await Stop.findByIdAndDelete(id);

    if (!deletedStop) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stop deleted successfully",
      data: deletedStop,
    });
  } catch (error) {
    console.error("Error deleting stop:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
