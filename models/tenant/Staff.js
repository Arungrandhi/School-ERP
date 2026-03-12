import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"],
      trim: true 
    },
    employeeId: { 
      type: String, 
      unique: true, 
      required: [true, "Employee ID is required"],
      trim: true 
    },
    email: { 
      type: String, 
      unique: true, 
      required: [true, "Email is required"],
      lowercase: true,
      trim: true 
    },
    phone: { 
      type: String,
      trim: true 
    },
    role: {
      type: String,
      enum: ["ADMIN", "PRINCIPAL", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "RECEPTIONIST", "STAFF"],
      required: [true, "Role is required"]
    },
    // This field is specifically for Teachers/Support Staff
    subject: { 
      type: String,
      default: null 
    },
    designation: { 
      type: String, 
      trim: true 
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male"
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    salary: { 
      type: Number, 
      default: 0 
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    },
    // Reference to the School/Tenant for Multi-tenancy support
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true
    }
  },
  { 
    timestamps: true // Automatically creates createdAt and updatedAt fields
  }
);

// Optional: Add an index for faster searching by name or employeeId
staffSchema.index({ name: 'text', employeeId: 'text' });

export default staffSchema;