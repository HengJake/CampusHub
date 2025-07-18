import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  validateReferenceExists,
  validateMultipleReferences,
  controllerWrapper
} from "../../utils/reusable.js";

import Resource from "../../models/Facility/resource.model.js";
import School from "../../models/Billing/school.model.js";

// Custom validation function for resource data
const validateResourceData = async (data) => {
  const { schoolId, type } = data;

  // Check required fields
  if (!schoolId) {
    return {
      isValid: false,
      message: "schoolId is required"
    };
  }


  // Validate references exist
  const referenceValidation = await validateMultipleReferences({
    schoolId: { id: schoolId, Model: School }
  });

  if (referenceValidation) {
    return {
      isValid: false,
      message: referenceValidation.message
    };
  }

  return { isValid: true };
};

// Controller to create a new resource
export const createResource = controllerWrapper(async (req, res) => {
  return await createRecord(
    Resource,
    req.body,
    "resource",
    validateResourceData
  );
});

// Controller to get all resources
export const getAllResource = controllerWrapper(async (req, res) => {
  return await getAllRecords(Resource);
});

// Controller to get a resource by ID
export const getResourceById = controllerWrapper(async (req, res) => {
  return await getRecordById(Resource, req.params.id);
});

// Get Resources by School ID
export const getResourcesBySchoolId = controllerWrapper(async (req, res) => {
  const { schoolID } = req.params;
  return await getAllRecords(
    Resource,
    "resources",
    [],
    { schoolID }
  );
});

// Controller to update an existing resource
export const updateResource = controllerWrapper(async (req, res) => {
  return await updateRecord(
    Resource,
    req.params.id,
    req.body,
    "resource",
    validateResourceData
  );
});

// Controller to delete a resource by ID
export const deleteResource = controllerWrapper(async (req, res) => {
  return await deleteRecord(Resource, req.params.id);
});

export const deleteAllResources = async (req, res) => {
  try {
    await Resource.deleteMany({});
    res.status(200).json({ message: 'All resources deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all resources', error: error.message });
  }
};


