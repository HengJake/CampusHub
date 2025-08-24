import mongoose from "mongoose";

export const validateUniqueField = async (Model, fieldValue, fieldName, entityName = "record", excludeId = null) => {
    if (!fieldValue) return null; // Skip validation if field is not provided

    try {
        let query = { [fieldName]: fieldValue };

        // Exclude current record when updating
        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existingRecord = await Model.findOne(query);

        if (existingRecord) {
            return {
                success: false,
                message: `${entityName} with this ${fieldName} already exists`,
                statusCode: 409
            };
        }

        return null;
    } catch (error) {
        console.error(`Error validating unique ${fieldName}:`, error.message);
        return {
            success: false,
            message: `Error validating unique ${fieldName}`,
            statusCode: 500
        };
    }
};

export const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};


export const validateObjectId = (id, entityName = "record") => {
    if (!isValidObjectId(id)) {
        return {
            success: false,
            message: `Invalid ${entityName} ID format`,
            statusCode: 400
        };
    }
    return null;
};

// validate reference ID
export const validateReferenceExists = async (id, Model, fieldName) => {
    if (!id) return null; // Skip validation if field is not provided

    const validationError = validateObjectId(id, fieldName);
    if (validationError) return validationError;

    try {        // for to repeating record
        const exists = await Model.findById(id);
        if (!exists) {
            return {
                success: false,
                message: `Invalid ${fieldName}: ${fieldName.replace('ID', '')} not found`,
                statusCode: 400
            };
        }
        return null;
    } catch (error) {
        console.error(`Error validating ${fieldName}:`, error.message);
        return {
            success: false,
            message: `Error validating ${fieldName} - validateReferenceExists method`,
            statusCode: 500
        };
    }
};

export const validateMultipleReferences = async (references) => {
    for (const [fieldName, { id, Model }] of Object.entries(references)) {
        if (id) { // Only validate if field is provided
            const validationError = await validateReferenceExists(id, Model, fieldName);
            if (validationError) {
                return validationError;
            }
        }
    }
    return null;
};

export const createRecord = async (Model, data, entityName = "record", validationFn = null, uniqueFields = []) => {
    try {

        // Custom validation if provided
        if (validationFn) {
            const validationResult = await validationFn(data);
            if (validationResult && !validationResult.isValid) {
                return {
                    success: false,
                    message: validationResult.message,
                    errors: validationResult.errors || null,
                    statusCode: 400
                };
            }
        }

        // Validate unique fields
        for (const field of uniqueFields) {
            const uniqueValidation = await validateUniqueField(Model, data[field], field, entityName);
            if (uniqueValidation) {
                return uniqueValidation;
            }
        }

        const newRecord = new Model(data);
        await newRecord.save();

        return {
            success: true,
            data: newRecord,
            message: `${entityName} created successfully`,
            statusCode: 201
        };
    } catch (error) {
        console.error(`Error creating ${entityName}:`, error.message);

        // Handle duplicate key errors
        if (error.code === 11000) {
            return {
                success: false,
                message: `${entityName} already exists`,
                statusCode: 409
            };
        }

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return {
                success: false,
                message: `Validation failed: ${validationErrors.join(', ')}`,
                statusCode: 400
            };
        }

        return {
            success: false,
            message: `Server error - createRecord method - ${error.message}`,
            statusCode: 500
        };
    }
};


export const getAllRecords = async (Model, entityName = "records", populateFields = [], filter = {}) => {
    try {
        let query = Model.find(filter);

        // Populate fields if provided
        if (populateFields.length > 0) {
            populateFields.forEach(field => {
                if (typeof field === "string") {
                    query = query.populate(field);
                } else if (typeof field === 'object' && field !== null) {
                    query = query.populate(field);
                }
            });
        }

        const records = await query;

        return {
            success: true,
            data: records,
            message: `${entityName} retrieved successfully`,
            statusCode: 200
        };
    } catch (error) {
        console.error(`Error retrieving ${entityName}:`, error.message);
        return {
            success: false,
            message: "Server error - getAllRecords method",
            statusCode: 500
        };
    }
};


export const getRecordById = async (Model, id, entityName = "record", populateFields = []) => {
    // Validate ObjectId
    const validationError = validateObjectId(id, entityName);
    if (validationError) {
        return validationError;
    }

    try {
        let query = Model.findById(id);

        // Populate fields if provided
        if (populateFields.length > 0) {
            populateFields.forEach(field => {
                query = query.populate(field);
            });
        }

        const record = await query;

        if (!record) {
            return {
                success: false,
                message: `${entityName} not found`,
                statusCode: 404
            };
        }

        return {
            success: true,
            data: record,
            message: `${entityName} retrieved successfully`,
            statusCode: 200
        };
    } catch (error) {
        console.error(`Error retrieving ${entityName}:`, error.message);
        return {
            success: false,
            message: "Server error - getRecordById method",
            statusCode: 500
        };
    }
};


export const updateRecord = async (Model, id, updates, entityName = "record", validationFn = null, isPartialUpdate = false) => {
    // Validate ObjectId
    const validationError = validateObjectId(id, entityName);
    if (validationError) {
        return validationError;
    }

    try {
        // Custom validation if provided
        if (validationFn) {
            const validationResult = await validationFn(updates);
            if (validationResult && !validationResult.isValid) {
                return {
                    success: false,
                    message: validationResult.message,
                    errors: validationResult.errors || null,
                    statusCode: 400
                };
            }
        }


        const updatedRecord = await Model.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!updatedRecord) {
            return {
                success: false,
                message: `${entityName} not found`,
                statusCode: 404
            };
        }

        return {
            success: true,
            data: updatedRecord,
            message: `${entityName} updated successfully`,
            statusCode: 200
        };
    } catch (error) {
        console.error(`Error updating ${entityName}:`, error.message);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return {
                success: false,
                message: `Validation failed: ${validationErrors.join(', ')}`,
                statusCode: 400
            };
        }

        return {
            success: false,
            message: `Server error - updateRecord method - ${error.message}`,
            statusCode: 500
        };
    }
};


export const deleteRecord = async (Model, id, entityName = "record") => {
    // Validate ObjectId
    const validationError = validateObjectId(id, entityName);
    if (validationError) {
        return validationError;
    }

    try {
        const deletedRecord = await Model.findByIdAndDelete(id);

        if (!deletedRecord) {
            return {
                success: false,
                message: `${entityName} not found`,
                statusCode: 404
            };
        }

        return {
            success: true,
            message: `${entityName} deleted successfully`,
            statusCode: 200
        };
    } catch (error) {
        console.error(`Error deleting ${entityName}:`, error.message);
        return {
            success: false,
            message: "Server error - deleteRecord method",
            statusCode: 500
        };
    }
};

export const deleteAllRecords = async (Model, entityName = "records", filter = {}) => {
    try {
        const result = await Model.deleteMany(filter);

        return {
            success: true,
            data: { deletedCount: result.deletedCount },
            message: `${result.deletedCount} ${entityName} deleted successfully`,
            statusCode: 200
        };
    } catch (error) {
        console.error(`Error deleting all ${entityName}:`, error.message);
        return {
            success: false,
            message: "Server error - deleteAllRecords method",
            statusCode: 500
        };
    }
};


export const controllerWrapper = (controllerFn) => {
    return async (req, res) => {
        try {
            const result = await controllerFn(req, res);
            
            // Ensure result has required properties with defaults
            const statusCode = result?.statusCode || 200;
            const success = result?.success ?? false;
            const data = result?.data || null;
            const message = result?.message || "No message provided";
            
            return res.status(statusCode).json({
                success,
                data,
                message
            });
        } catch (error) {
            console.error("Controller wrapper error:", error);
            return res.status(500).json({
                success: false,
                message: "Server error - controllerWrapper method"
            });
        }
    };
};
