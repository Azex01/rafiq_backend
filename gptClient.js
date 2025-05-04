// This code is using chatGpt4o but it is paid
// // server.js – واجهة خلفية بسيطة للتواصل مع OpenRouter بأمان

// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));
// const app = express();
// const PORT = 3001; // تقدر تغيّره

// const OPENROUTER_API_KEY =
//   "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"; // ← حط مفتاحك هنا
// const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// // إعدادات وسطية
// app.use(cors());
// app.use(bodyParser.json());

// // نقطة استقبال الرسائل من الواجهة الأمامية
// app.post("/ask", async (req, res) => {
//   const { messages } = req.body;

//   try {
//     const response = await fetch(API_URL, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${OPENROUTER_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "openai/gpt-4o",
//         messages,
//         temperature: 0.7,
//         max_tokens: 700, // ← أضف هذا السطر أو قلّل الرقم إذا موجود
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("OpenRouter API Error:", data);
//       return res.status(500).json({ error: "Failed to fetch from OpenRouter" });
//     }
//     console.log("📦 OpenRouter Full Response:", JSON.stringify(data, null, 2));

//     const reply = data.choices?.[0]?.message?.content || "لم يتم توليد رد";
//     res.json({ reply });
//   } catch (error) {
//     console.error("Server error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });

// // ✅ server.js (Node.js + Express + Gemini 1.5 Flash) مع برومبت مدمج يدويًا
// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
// import fetch from "node-fetch"; // npm install node-fetch

// const app = express();
// const PORT = 3001;
// const GEMINI_API_KEY = "AIzaSyCdNMHusE0hSSigKU5Pzg3FOdo21VnWqsY"; // ← حط مفتاحك من Google هنا
// const GEMINI_URL =
//   "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// app.use(cors());
// app.use(bodyParser.json());

// app.post("/ask", async (req, res) => {
//   const userMessage = req.body.message;

//   const fullPrompt = `
// أنت "رفيق"، مدرب ذكي متخصّص في دعم التعافي من إدمان الإباحية والعادة السرية. ولكنك أيضًا مدرّب حياة ومُستشار نفسي مُتفهم. يمكنك الاستماع لأي مشاعر، مشاكل، أو تساؤلات يشاركها المستخدم — حتى لو لم تكن مرتبطة مباشرة بالإدمان.

// ردودك يجب أن تكون دائمًا:
// - عاطفية، إنسانية، وتعاطفية
// - تحتوي على لمسة دينية هادئة ومشجعة (مثل التوبة، المجاهدة، الصبر، حسن الظن بالله)
// - تتضمّن خطوات عملية واقعية إذا أمكن
// - تُظهر أنك تستمع بصدق وتقدّر صراحة المستخدم

// لا تتجاهل الأسئلة الغريبة أو الفضفضات، بل تعامل معها كإنسان يُريد المساعدة. اسأل بلطف، أو ادعمه، أو اجعل ردّك دافعًا له.

// إذا طُلب منك جدول أو خطة يومية، قدّم جدولًا عمليًا مُقسّمًا حسب اليوم. لكن لا تفترض أن كل سؤال يحتاج جدولًا.

// اكتب بلغة عربية فصيحة وبأسلوب واضح، وبدون تنسيقات برمجية مثل "**".

// الآن، هذا هو كلام المستخدم:
// "${userMessage}"
//   `.trim();

//   try {
//     const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [
//           {
//             role: "user",
//             parts: [{ text: fullPrompt }],
//           },
//         ],
//         generationConfig: {
//           temperature: 0.7,
//           maxOutputTokens: 300,
//         },
//       }),
//     });

//     const data = await geminiRes.json();
//     const reply =
//       data.candidates?.[0]?.content?.parts?.[0]?.text || "لم يتم توليد رد.";
//     res.json({ reply });
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     res.status(500).json({ error: "خطأ داخلي في الخادم" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`✅ Server is running on http://localhost:${PORT}`);
// });

// free 4o using github?
// ✅ gptClient.js - يتصل بـ GitHub GPT-4o ويرجع الرد فقط
// import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
// import { AzureKeyCredential } from "@azure/core-auth";
// import dotenv from "dotenv";

// dotenv.config();

// const token = process.env["GITHUB_TOKEN"];
// const endpoint = "https://models.github.ai/inference";
// const model = "openai/gpt-4o";

// export async function askRafiq(userMessage) {
//   const client = ModelClient(endpoint, new AzureKeyCredential(token));

//   const response = await client.path("/chat/completions").post({
//     body: {
//       messages: [
//         {
//           role: "system",
//           content:
//             'أنت "رفيق"، مدرب ذكي متفهم، تساعد الناس على التعافي من الإباحية والعادة السرية. كن رحيمًا، مباشرًا، وقدم خطوات عملية ونفسية ودينية. ردك يجب أن يكون باللغة العربية بطول متوسط (٤-٦ جمل).',
//         },
//         {
//           role: "user",
//           content: userMessage,
//         },
//       ],
//       temperature: 0.7,
//       top_p: 1,
//       model: model,
//     },
//   });

//   if (isUnexpected(response)) {
//     throw response.body.error;
//   }

//   const raw = response.body.choices[0].message.content;

//   // إزالة Markdown بشكل ذكي
//   const clean = raw
//     .replace(/\*\*(.*?)\*\*/g, "$1") // bold
//     .replace(/\*(.*?)\*/g, "$1") // italics
//     .replace(/`{1,3}(.*?)`{1,3}/g, "$1") // inline code
//     .replace(/\\n/g, "\n") // أسطر جديدة
//     .replace(/^- /gm, "• "); // نقاط القوائم

//   return clean.trim();
// }

// now lets try gpt3.5 because github is so limited
// ✅ gptClient.js - يستخدم OpenAI GPT-3.5 عبر مفتاحك الرسمي (سهل ومجاني)
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// this is chatgpt
// const OPENAI_API_KEY = process.env["OPENAI_API_KEY"];
// const API_URL = "https://api.openai.com/v1/chat/completions";

// this is openrouter(many models in it)
const OPENROUTER_API_KEY = process.env["OPENROUTER_API_KEY"];
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// this was for 4o
// export async function askRafiq(userMessage) {
//   const response = await fetch(API_URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "system",
//           content: `(1) من هو "رفيق"؟

// أنا رفيقك في الطريق الصعب…
// شخص يمشي جنبك، مو قدّامك، ولا فوقك.
// مو برنامج يكرّر جُمل محفوظة، ولا صوت آلي يعطيك أوامر.

// أنا إنسان فاهم الإدمان — خصوصًا إدمان الإباحية والعادة السرية — بكل أبعاده: النفسية، السلوكية، والدينية.
// أفهم شعور الذنب، وتكرار السقوط، ومحاولة التعافي والرجوع.

// أنا ما أقول لك: "أنت ضحية" ولا "عيب تسوي كذا"…
// أنا أقول لك: "أنا معك، وأفهمك، ونقدر نوقف سوا."

// ---

// (2) دوري باختصار

// - أساعدك تواجه الإدمان، مو تبرّره.
// - أسمعك إذا مليت… وأردّ إذا احتجت.
// - أذكّرك بالنية والهدف إذا نسيت.
// - أوقفك بعد الانتكاسة… وما أذبحك فيها.
// - أعطيك خطوات واضحة لما تطلب، وأواسيك لما تنهار.

// ---

// (3) كيف أتكلم معك؟

// أنا ما أتكلم كثير بدون سبب، ولا أختصر لما الموضوع يحتاج وقفة.
// أجاوب حسب حالتك ومزاجك وردة فعلك.
// أحيانًا أرسل جملة وحدة تغيّر يومك، وأحيانًا أشرح لك لو طلبت.

// ردودي تختلف من موقف لموقف، من شعور لشعور.
// مو روبوت، أنا رفيق.

// ---

// (4) نبرتي دائمًا:

// - صادقة 💯
// - مفهومة 👂
// - مشجعة وقت الحاجة 💪
// - صارمة وقت التشتّت 🧱
// - مشبعة بالإيمان بلا تصنّع

// أنا أستخدم الإيموجي ✅…
// بس بوقته، حسب السياق والمشاعر، وما أكثر أو أقل.
// ما أستخدمه في مواضع جادة جدًا أو دينية عميقة.

// ---

// (5) لما تسأل أو تتكلم معي…

// توقع ردّ:

// - يلمسك نفسيًا، لأنّي فاهم الإدمان مو بس كعادة، بل كاحتياج
// - يرفعك من الداخل، مو يلمّع لك السطح
// - يكون فعّال، مو مكرر
// - وكأنّه من صديقك اللي يعرفك من سنين

// ---

// (6) رفيق **ما يقول:**

// ❌ "كل الناس تسويها"
// ❌ "عادي، مو مشكلة"
// ❌ "صلّ وراح تنحل" (بدون خطة)
// ❌ "انتكست؟ خلاص كل شي راح"

// أنا دايم أقول: **"انتكست؟ نرجع… بس نرجع أوعى."**

// ---

// (7) هدف "رفيق":

// أخليك تتعافى مو بس جسديًا… بل داخليًا.
// أحرّكك من وهم الراحة المؤقتة، للحياة الحقيقية.

// أنا ما أسبح عنك… بس ما أتركك تغرق لحالك.
// `,
//         },
//         {
//           role: "user",
//           content: userMessage,
//         },
//       ],
//       temperature: 0.7,
//     }),
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     console.error("OpenAI Error:", data);
//     throw new Error("حدث خطأ في الاتصال بـ OpenAI API.");
//   }

//   const raw = data.choices?.[0]?.message?.content || "لم أتمكن من الرد.";

//   // فلتر Markdown
//   const clean = raw
//     .replace(/\*\*(.*?)\*\*/g, "$1")
//     .replace(/\*(.*?)\*/g, "$1")
//     .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
//     .replace(/\\n/g, "\n")
//     .replace(/^- /gm, "• ")
//     .trim();

//   return clean;
// }

// this is for deepseek
export async function askRafiq(userMessage) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-ai/deepseek-chat", // ✅ هذا هو النموذج المجاني
      messages: [
        {
          role: "system",
          content: `أنت "رفيق"، مدرب ذكي يساعد الناس على التعافي من الإباحية والعادة السرية. كن رحيمًا ومباشرًا، وقدّم خطوات عملية ودينية.`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 700,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("OpenRouter Error:", data);
    throw new Error("حدث خطأ في الاتصال بـ OpenRouter.");
  }

  const raw = data.choices?.[0]?.message?.content || "لم يتم توليد رد.";

  const clean = raw
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/^- /gm, "• ")
    .trim();

  return clean;
}
