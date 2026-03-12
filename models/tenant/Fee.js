import mongoose from "mongoose";

 const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    totalAmount: {
      type: Number,
      required: true
    },

    paidAmount: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["PENDING", "PARTIAL", "PAID"],
      default: "PENDING"
    },

    paymentHistory: [
      {
        amount: Number,
        date: { type: Date, default: Date.now },
        mode: String
      }
    ]
  },
  { timestamps: true }
);

export default feeSchema;
