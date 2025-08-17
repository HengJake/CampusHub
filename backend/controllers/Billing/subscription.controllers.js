import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  validateReferenceExists,
  controllerWrapper
} from "../../utils/reusable.js";

import Subscription from "../../models/Billing/subscription.model.js";
import School from "../../models/Billing/school.model.js";

const validateSubscriptionData = async (data) => {
  const { schoolId, plan, price, billingInterval } = data;

  // Check required fields
  if (!schoolId) {
    return {
      isValid: false,
      message: "schoolId is required"
    };
  }
  if (!plan) {
    return {
      isValid: false,
      message: "plan is required"
    };
  }
  if (!price) {
    return {
      isValid: false,
      message: "price is required"
    };
  }
  if (!billingInterval) {
    return {
      isValid: false,
      message: "billingInterval is required"
    };
  }

  // Validate plan enum values
  const validPlans = ["Basic", "Standard", "Premium"];
  if (!validPlans.includes(plan)) {
    return {
      isValid: false,
      message: "plan must be one of: Basic, Standard, Premium"
    };
  }

  // Validate billing interval enum values
  const validIntervals = ["Monthly", "Yearly"];
  if (!validIntervals.includes(billingInterval)) {
    return {
      isValid: false,
      message: "billingInterval must be one of: Monthly, Yearly"
    };
  }

  // Validate price is positive
  if (price <= 0) {
    return {
      isValid: false,
      message: "price must be greater than 0"
    };
  }

  // Validate schoolId reference exists
  const referenceValidation = await validateReferenceExists(schoolId, School, "schoolId");
  if (referenceValidation) {
    return {
      isValid: false,
      message: referenceValidation.message
    };
  }

  return { isValid: true };
};

export const createSubscription = controllerWrapper(async (req, res) => {
  return await createRecord(
    Subscription,
    req.body,
    "subscription",
    validateSubscriptionData
  );
});

export const getAllSubscription = controllerWrapper(async (req, res) => {
  return await getAllRecords(Subscription, "subscription");
});

export const getSubscriptionById = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await getRecordById(Subscription, id, "subscription");
});

export const updateSubscription = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await updateRecord(Subscription, id, req.body, "subscription", validateSubscriptionData);
});

export const deleteSubscription = controllerWrapper(async (req, res) => {
  const { id } = req.params;
  return await deleteRecord(Subscription, id, "subscription");
});

export const deleteAllSubscriptions = async (req, res) => {
  try {
    await Subscription.deleteMany({});
    res.status(200).json({ message: 'All subscriptions deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all subscriptions', error: error.message });
  }
};

export const getSubscriptionBySchool = controllerWrapper(async (req, res) => {
  const { schoolId } = req.params;
  return await getAllRecords(Subscription, "subscription", [], { schoolId });
});