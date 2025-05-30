import mongoose from "mongoose";

const dashboardMetricSchema = new mongoose.Schema({
  metric_name: String,
  value: Number,
  calculated_at: Date,
});
export default mongoose.model("DashboardMetric", dashboardMetricSchema);
