import mongoose from "mongoose";

const recoverySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // كل مستخدم له مؤقت تعافي واحد فقط
    },
    recoveryStartDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Recovery = mongoose.model("Recovery", recoverySchema);
export default Recovery;
