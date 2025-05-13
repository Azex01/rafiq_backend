import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["free", "relapse"], // نوع المذكرة
      required: true,
    },
    title: String, // فقط للكتابة الحرة
    text: { type: String, required: true },
    trigger: String, // فقط للانتكاسات
    date: { type: Date, required: true }, // التاريخ الذي أدخله المستخدم
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true } // يضيف createdAt و updatedAt تلقائيًا
);

const JournalEntry = mongoose.model("JournalEntry", journalEntrySchema);
export default JournalEntry;
