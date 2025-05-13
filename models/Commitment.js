import mongoose from "mongoose";

const commitmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // كل مستخدم له وثيقة واحدة فقط
    },
    negativeImpact: {
      type: String,
      required: true,
    },
    recoveryBenefits: {
      type: String,
      required: true,
    },
    motivationImage: {
      type: String, // base64 أو رابط صورة
      default: null,
    },
  },
  { timestamps: true } // ينشئ createdAt و updatedAt تلقائيًا
);

const Commitment = mongoose.model("Commitment", commitmentSchema);
export default Commitment;
