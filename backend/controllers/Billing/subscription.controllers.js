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

import Subscription from "../../models/Billing/subscription.model.js";

const validateSubscriptionData = async (data) => {
  const { plan, price, billingInterval } = data;

  // Check required fields
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