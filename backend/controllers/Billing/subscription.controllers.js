import Subscription from "../../models/Billing/subscription.model.js";

export const createSubscription = async (req, res) => {
  const paymentDetails = req.body;

  try {
    const newSubscription = new Subscription({
      SchoolID: paymentDetails.SchoolID,
      Plan: paymentDetails.Plan,
      Price: paymentDetails.Price,
      BillingInterval: paymentDetails.BillingInterval,
    });

    const savedSubscription = await newSubscription.save();

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: savedSubscription,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: error.message,
    });
  }
};

export const readSubscription = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const subscription = await Subscription.findOne({ SchoolID: schoolId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscription",
      error: error.message,
    });
  }
};

export const readAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find();

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
      error: error.message,
    });
  }
};
