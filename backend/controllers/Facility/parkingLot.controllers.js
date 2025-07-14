import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  validateReferenceExists,
  controllerWrapper
} from "../../utils/reusable.js";
import ParkingLot from "../../models/Facility/parkingLot.model.js";
import School from "../../models/Billing/school.model.js";

const validateParkingLotData = async (data) => {
  const { schoolId, zone, slotNumber, active } = data;
  if (!schoolId) return { isValid: false, message: "schoolId is required" };
  if (!zone) return { isValid: false, message: "zone is required" };
  if (slotNumber == null) return { isValid: false, message: "slotNumber is required" };
  if (typeof slotNumber !== 'number' || slotNumber < 1) return { isValid: false, message: "slotNumber must be a positive number" };
  const referenceValidation = await validateReferenceExists(schoolId, School, "schoolId");
  if (referenceValidation) {
    return { isValid: false, message: referenceValidation.message };
  }
  return { isValid: true };
};

export const createParkingLot = controllerWrapper(async (req, res) => {
  return await createRecord(ParkingLot, req.body, "parkingLot", validateParkingLotData);
});

export const getAllParkingLots = controllerWrapper(async (req, res) => {
  return await getAllRecords(ParkingLot, "parkingLot", ["schoolId"]);
});

export const getParkingLotById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(ParkingLot, id, "parkingLot", ["schoolId"]);
});

// Get ParkingLots by School ID
export const getParkingLotsBySchoolId = controllerWrapper(async (req, res) => {
  const { schoolId } = req.params;
  return await getAllRecords(
      ParkingLot,
      "parkingLots",
      ["schoolId"],
      { schoolId }
  );
}); 

export const updateParkingLot = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(ParkingLot, id, req.body, "parkingLot", validateParkingLotData);
});

export const deleteParkingLot = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(ParkingLot, id, "parkingLot");
});

