import mongoose from "mongoose";

const schoolSettingsSchema = new mongoose.Schema(
  {
    // Ensures only one settings document exists
    singleton: {
      type: String,
      default: "SETTINGS",
      unique: true,
    },

    // School Geo Location
    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    // Allowed attendance radius in meters
    allowedRadius: {
      type: Number,
      default: 150,
      min: 10,
      max: 1000,
    },
  },
  {
    timestamps: true,
  }
);

export default schoolSettingsSchema;