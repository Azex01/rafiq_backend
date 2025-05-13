// ✅ server.js - يربط chat.js بـ gptClient.js ويشغّل GPT-4o API من GitHub
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { askRafiq } from "./gptClient.js";
import mongoose from "mongoose";
import User from "./models/User.js"; // في الأعلى
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import PasswordResetToken from "./models/PasswordResetToken.js";
import { sendResetEmail } from "./utils/sendEmail.js";

import { verifyToken } from "./authMiddleware.js";
// let start the work :
import JournalEntry from "./models/JournalEntry.js";
import Commitment from "./models/Commitment.js";
import Habit from "./models/Habit.js";
import Recovery from "./models/Recovery.js";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

dotenv.config();
const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "https://rafeeq1.netlify.app"], // ضف كل origins المسموح بها
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(bodyParser.json({ limit: "10mb" }));

app.use(express.static(path.join(__dirname, "../frontend")));

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const reply = await askRafiq(userMessage);
    res.json({ reply });
  } catch (error) {
    console.error("Error in /ask:", error);
    res.status(500).json({ reply: "حدث خطأ أثناء الاتصال بالمساعد." });
  }
});

// database work and APIs :
// إنشاء حساب :
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "جميع الحقول مطلوبة" });
  }

  try {
    // 🔐 تشفير كلمة المرور قبل الحفظ
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // لا ترجع كلمة المرور في الرد
    const { password: _, ...userData } = user.toObject();
    res.json({ message: "تم التسجيل بنجاح", user: userData });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "فشل في التسجيل", error: err.message });
  }
});
// تسجيل دخول
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "البريد وكلمة المرور مطلوبة" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "المستخدم غير موجود" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "كلمة المرور غير صحيحة" });
    }

    // JWT
    const token = jwt.sign(
      { id: user._id, email: user.email }, // البيانات داخل التوكن
      process.env.JWT_SECRET, // المفتاح السري
      { expiresIn: "7d" } // صلاحية التوكن (اختياري)
    );
    //JWT

    // نجاح الدخول (ممكن ترجع بيانات معينة فقط)
    const { password: _, ...userData } = user.toObject(); // نحذف كلمة المرور من كائن المستخدم قبل إرساله، ونحتفظ بالباقي في userData
    // the fruit is : user data was including the password but now , password in not returned

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      user: userData,
      token: token, // نرسل التوكن مع الرد
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "فشل في تسجيل الدخول" });
  }
});
// هذا الي يتأكد من التوكن كل مره
/*
طبعا اش سالفه ال jwt=json web token?
بكل بساطه ترى الاصل ان اي اتصال او تعامل مع الداتابيس من ناحيه اليوزر انه يسجل دخول حرفيا مع كل طلب
لكن ال jwt يطلع توكن مميز اول مايسجل دخول المستخدم وتحدد صلاحيته
وبكذا مع كل طلب للابكاند بيتم اضافه التوكن هذا والauthmiddle يتحقق منه
*/
app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "تم الوصول إلى المسار المحمي!",
    user: req.user, // يحتوي على id و email
  });
});

// إنشاء مذكرات :
app.post("/journal", verifyToken, async (req, res) => {
  const { type, title, text, trigger, date } = req.body;

  // التحقق من النوع
  if (!["free", "relapse"].includes(type)) {
    return res.status(400).json({ message: "نوع المذكرة غير صالح" });
  }

  if (!text || !date) {
    return res.status(400).json({ message: "النص والتاريخ مطلوبان" });
  }

  try {
    const entry = new JournalEntry({
      type,
      title: type === "free" ? title : undefined,
      trigger: type === "relapse" ? trigger : undefined,
      text,
      date,
      userId: req.user.id, // جاي من التوكن
    });

    await entry.save();
    res.status(201).json({ message: "تم حفظ المذكرة", entry });
  } catch (err) {
    console.error("Error saving journal entry:", err);
    res.status(500).json({ message: "حدث خطأ أثناء الحفظ" });
  }
});
// get journalest
app.get("/journal", verifyToken, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ entries });
  } catch (err) {
    console.error("Error fetching journal entries:", err);
    res.status(500).json({ message: "حدث خطأ أثناء جلب المذكرات" });
  }
});
// delete journal :
app.delete("/journal/:id", verifyToken, async (req, res) => {
  const entryId = req.params.id;

  try {
    // تأكد أن المذكرة تنتمي لنفس المستخدم
    const deleted = await JournalEntry.findOneAndDelete({
      _id: entryId,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "المذكرة غير موجودة" });
    }

    res.json({ message: "تم حذف المذكرة بنجاح" });
  } catch (err) {
    console.error("Error deleting journal entry:", err);
    res.status(500).json({ message: "حدث خطأ أثناء الحذف" });
  }
});

// upser=post/update  commitment :
// app.post("/commitment", verifyToken, async (req, res) => {
//   const { negativeImpact, recoveryBenefits, motivationImage } = req.body;

//   if (!negativeImpact || !recoveryBenefits) {
//     return res.status(400).json({ message: "جميع الحقول النصية مطلوبة" });
//   }

//   try {
//     const updated = await Commitment.findOneAndUpdate(
//       { userId: req.user.id },
//       {
//         negativeImpact,
//         recoveryBenefits,
//         motivationImage: motivationImage || null,
//       },
//       { new: true, upsert: true } // ✅ هذا هو السحر: إنشاء أو تعديل
//     );

//     res.json({ message: "تم حفظ وثيقة الالتزام", commitment: updated });
//   } catch (err) {
//     console.error("Error saving commitment:", err);
//     res.status(500).json({ message: "فشل في حفظ الوثيقة" });
//   }
// });
app.post("/commitment", verifyToken, async (req, res) => {
  const { negativeImpact, recoveryBenefits, motivationImage } = req.body;

  // ✅ نسمح بإرسال أي حقل (واحد على الأقل)
  if (
    negativeImpact === undefined &&
    recoveryBenefits === undefined &&
    motivationImage === undefined
  ) {
    return res
      .status(400)
      .json({ message: "يجب إرسال حقل واحد على الأقل للتحديث" });
  }

  try {
    const updated = await Commitment.findOneAndUpdate(
      { userId: req.user.id },
      {
        ...(negativeImpact !== undefined && { negativeImpact }),
        ...(recoveryBenefits !== undefined && { recoveryBenefits }),
        ...(motivationImage !== undefined && { motivationImage }),
      },
      { new: true, upsert: true }
    );

    res.json({ message: "تم حفظ وثيقة الالتزام", commitment: updated });
  } catch (err) {
    console.error("Error saving commitment:", err);
    res.status(500).json({ message: "فشل في حفظ الوثيقة" });
  }
});

// get commitment :
app.get("/commitment", verifyToken, async (req, res) => {
  try {
    const commitment = await Commitment.findOne({ userId: req.user.id });

    if (!commitment) {
      return res.status(404).json({ message: "لا توجد وثيقة التزام محفوظة" });
    }

    res.json({ commitment });
  } catch (err) {
    console.error("Error fetching commitment:", err);
    res.status(500).json({ message: "حدث خطأ أثناء جلب الوثيقة" });
  }
});

// add habit :
app.post("/habits", verifyToken, async (req, res) => {
  const {
    name,
    description,
    icon,
    createdAt,
    completionLog,
    streak,
    longestStreak,
  } = req.body;
  if (!name) {
    return res.status(400).json({ message: "اسم العادة مطلوب" });
  }

  try {
    const habit = new Habit({
      name,
      description: description || "",
      icon: icon || "fa-heart",
      userId: req.user.id,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
      streak: typeof streak === "number" ? streak : 0, // Use provided streak or default to 0
      longestStreak: typeof longestStreak === "number" ? longestStreak : 0, // Use provided longestStreak or default to 0
      completionLog: completionLog
        ? new Map(Object.entries(completionLog))
        : new Map(), // Use provided completionLog or default to empty Map
      // Object.entries is used assuming completionLog from client is a plain object
    });

    await habit.save();
    res.status(201).json({ message: "تمت إضافة العادة", habit });
  } catch (err) {
    console.error("Error creating habit:", err);
    res.status(500).json({ message: "فشل في إنشاء العادة" });
  }
});

// get habits :
app.get("/habits", verifyToken, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ habits });
  } catch (err) {
    console.error("Error fetching habits:", err);
    res.status(500).json({ message: "حدث خطأ أثناء جلب العادات" });
  }
});

app.delete("/habits/:id", verifyToken, async (req, res) => {
  const habitId = req.params.id;

  try {
    const deleted = await Habit.findOneAndDelete({
      _id: habitId,
      userId: req.user.id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "العادة غير موجودة أو لا تملك صلاحية حذفها" });
    }

    res.json({ message: "تم حذف العادة بنجاح" });
  } catch (err) {
    console.error("Error deleting habit:", err);
    res.status(500).json({ message: "فشل في حذف العادة" });
  }
});

// edit habit detailes :
// تحديث معلومات العادة (الاسم - الوصف - الأيقونة)
app.put("/habits/:id", verifyToken, async (req, res) => {
  const habitId = req.params.id;
  const { name, description, icon } = req.body;

  try {
    const habit = await Habit.findOne({ _id: habitId, userId: req.user.id });

    if (!habit) {
      return res.status(404).json({ message: "العادة غير موجودة" });
    }

    habit.name = name || habit.name;
    habit.description = description || habit.description;
    habit.icon = icon || habit.icon;

    await habit.save();

    res.json({ message: "تم تحديث العادة بنجاح", habit });
  } catch (err) {
    console.error("Error updating habit:", err);
    res.status(500).json({ message: "حدث خطأ أثناء تحديث العادة" });
  }
});

// update completion and streak :
// --- In server.js ---

// REMOVE or COMMENT OUT these old routes:
// app.put("/habits/:id/complete", ...);
// app.put("/habits/:id/uncomplete/:date", ...);

// ADD this new unified route:
app.put("/habits/:id/toggle/:date", verifyToken, async (req, res) => {
  const { id, date } = req.params;

  // Validate date format
  const formattedDate = moment(date, "YYYY-MM-DD", true);
  if (!formattedDate.isValid()) {
    return res
      .status(400)
      .json({ message: "صيغة التاريخ غير صحيحة (YYYY-MM-DD)" });
  }

  try {
    const habit = await Habit.findOne({ _id: id, userId: req.user.id });

    if (!habit) {
      return res.status(404).json({ message: "العادة غير موجودة" });
    }

    // Ensure completionLog exists
    if (!habit.completionLog) {
      habit.completionLog = new Map();
    }

    // Get current status for the date (defaults to false if undefined)
    const currentStatus = habit.completionLog.get(date) === true;

    // Toggle the status
    const newStatus = !currentStatus;
    habit.completionLog.set(date, newStatus);

    // --- Recalculate Streak ---
    // (It's important to recalculate after *any* change in the log)
    let currentStreak = 0;
    const today = moment().format("YYYY-MM-DD");
    let checkDate = moment(today, "YYYY-MM-DD");

    while (true) {
      const checkDateStr = checkDate.format("YYYY-MM-DD");
      if (checkDate.isBefore(moment(habit.createdAt).startOf("day"))) {
        break; // Stop if before habit creation
      }
      if (habit.completionLog.get(checkDateStr) === true) {
        currentStreak++;
        checkDate.subtract(1, "day"); // Move to the previous day
      } else {
        break; // Streak broken
      }
    }
    habit.streak = currentStreak;

    // Update longest streak if necessary
    habit.longestStreak = Math.max(habit.longestStreak || 0, habit.streak);
    // --- End Streak Recalculation ---

    await habit.save();
    res.json({
      message: `تم تحديث حالة اليوم ${date} إلى ${
        newStatus ? "مكتمل" : "غير مكتمل"
      }`,
      habit, // Send back the updated habit
    });
  } catch (err) {
    console.error("Error toggling habit completion:", err);
    res.status(500).json({ message: "حدث خطأ أثناء تحديث حالة العادة" });
  }
});
// post the start of timer
app.post("/recovery", verifyToken, async (req, res) => {
  const { recoveryStartDate } = req.body;

  if (!recoveryStartDate) {
    return res.status(400).json({ message: "تاريخ بدء التعافي مطلوب" });
  }

  try {
    const updated = await Recovery.findOneAndUpdate(
      { userId: req.user.id },
      { recoveryStartDate },
      { new: true, upsert: true }
    );

    res.json({ message: "تم تسجيل بداية رحلة التعافي", recovery: updated });
  } catch (err) {
    console.error("Error saving recovery start date:", err);
    res.status(500).json({ message: "فشل في حفظ التاريخ" });
  }
});
// get the start of timer :
app.get("/recovery", verifyToken, async (req, res) => {
  try {
    const recovery = await Recovery.findOne({ userId: req.user.id });

    if (!recovery) {
      return res
        .status(404)
        .json({ message: "لا يوجد سجل تعافي لهذا المستخدم" });
    }

    res.json({ recovery });
  } catch (err) {
    console.error("Error fetching recovery data:", err);
    res.status(500).json({ message: "فشل في جلب بيانات التعافي" });
  }
});

// reset timer
app.delete("/recovery", verifyToken, async (req, res) => {
  try {
    const deleted = await Recovery.findOneAndDelete({ userId: req.user.id });

    if (!deleted) {
      return res.status(404).json({ message: "لا يوجد سجل تعافي لحذفه" });
    }

    res.json({ message: "تم حذف سجل التعافي بنجاح" });
  } catch (err) {
    console.error("Error deleting recovery record:", err);
    res.status(500).json({ message: "حدث خطأ أثناء الحذف" });
  }
});
// reset password
app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  const record = await PasswordResetToken.findOne({ token });

  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: "الرابط غير صالح أو منتهي" });
  }

  const user = await User.findById(record.userId);
  if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  await PasswordResetToken.deleteOne({ _id: record._id });

  res.json({ message: "تم تغيير كلمة المرور بنجاح" });
});

//forget password

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "البريد غير موجود" });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 دقيقة

  await PasswordResetToken.create({ userId: user._id, token, expiresAt });

  const link = `https://rafeeq1.netlify.app/reset-password.html?token=${token}`;
  await sendResetEmail(email, link);

  res.json({ message: "تم إرسال رابط إعادة التعيين إلى بريدك" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
