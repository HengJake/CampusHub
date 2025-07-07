import mongoose from "mongoose";

const classScheduleSchema = new mongoose.Schema({
  RoomID: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },

  ModuleID: {
    type: Schema.Types.ObjectId,
    ref: "Module",
    required: true,
  },

  LecturerID: {
    type: Schema.Types.ObjectId,
    ref: "Lecturer",
    required: true,
  },

  DayOfWeek: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    required: true,
  },

  StartTime: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: (props) => `${props.value} is not a valid time format!`,
    },
  },

  EndTime: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: (props) => `${props.value} is not a valid time format!`,
    },
  },

  IntakeID: {
    type: Schema.Types.ObjectId,
    ref: "Intake",
    required: true,
  },
});

const ClassSchedule = mongoose.model("ClassSchedule", classScheduleSchema);
export default ClassSchedule;
