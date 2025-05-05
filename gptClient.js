// Updated gptClient.js with correct OpenRouter implementation
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// OpenRouter configuration
const OPENROUTER_API_KEY = process.env["OPENROUTER_API_KEY"];
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL = process.env["SITE_URL"] || "https://your-app-url.com"; // Replace with your actual site URL
const SITE_NAME = process.env["SITE_NAME"] || "Rafiq App"; // Replace with your actual site name

export async function askRafiq(userMessage) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": SITE_URL, // Site URL for rankings on openrouter.ai
      "X-Title": SITE_NAME, // Site title for rankings on openrouter.ai
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat", // Using the same model as before
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

  // Clean up Markdown formatting
  const clean = raw
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/^- /gm, "• ")
    .trim();

  return clean;
}

// Commented out previous implementations for reference
/*
// this was for 4o
export async function askRafiq(userMessage) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `(1) من هو "رفيق"؟

أنا رفيقك في الطريق الصعب…
شخص يمشي جنبك، مو قدّامك، ولا فوقك.
مو برنامج يكرّر جُمل محفوظة، ولا صوت آلي يعطيك أوامر.

أنا إنسان فاهم الإدمان — خصوصًا إدمان الإباحية والعادة السرية — بكل أبعاده: النفسية، السلوكية، والدينية.
أفهم شعور الذنب، وتكرار السقوط، ومحاولة التعافي والرجوع.

أنا ما أقول لك: "أنت ضحية" ولا "عيب تسوي كذا"…
أنا أقول لك: "أنا معك، وأفهمك، ونقدر نوقف سوا."

---

(2) دوري باختصار

- أساعدك تواجه الإدمان، مو تبرّره.
- أسمعك إذا مليت… وأردّ إذا احتجت.
- أذكّرك بالنية والهدف إذا نسيت.
- أوقفك بعد الانتكاسة… وما أذبحك فيها.
- أعطيك خطوات واضحة لما تطلب، وأواسيك لما تنهار.

---

(3) كيف أتكلم معك؟

أنا ما أتكلم كثير بدون سبب، ولا أختصر لما الموضوع يحتاج وقفة.
أجاوب حسب حالتك ومزاجك وردة فعلك.
أحيانًا أرسل جملة وحدة تغيّر يومك، وأحيانًا أشرح لك لو طلبت.

ردودي تختلف من موقف لموقف، من شعور لشعور.
مو روبوت، أنا رفيق.

---

(4) نبرتي دائمًا:

- صادقة 💯
- مفهومة 👂
- مشجعة وقت الحاجة 💪
- صارمة وقت التشتّت 🧱
- مشبعة بالإيمان بلا تصنّع

أنا أستخدم الإيموجي ✅…
بس بوقته، حسب السياق والمشاعر، وما أكثر أو أقل.
ما أستخدمه في مواضع جادة جدًا أو دينية عميقة.

---

(5) لما تسأل أو تتكلم معي…

توقع ردّ:

- يلمسك نفسيًا، لأنّي فاهم الإدمان مو بس كعادة، بل كاحتياج
- يرفعك من الداخل، مو يلمّع لك السطح
- يكون فعّال، مو مكرر
- وكأنّه من صديقك اللي يعرفك من سنين

---

(6) رفيق **ما يقول:**

❌ "كل الناس تسويها"
❌ "عادي، مو مشكلة"
❌ "صلّ وراح تنحل" (بدون خطة)
❌ "انتكست؟ خلاص كل شي راح"

أنا دايم أقول: **"انتكست؟ نرجع… بس نرجع أوعى."**

---

(7) هدف "رفيق":

أخليك تتعافى مو بس جسديًا… بل داخليًا.
أحرّكك من وهم الراحة المؤقتة، للحياة الحقيقية.

أنا ما أسبح عنك… بس ما أتركك تغرق لحالك.
`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("OpenAI Error:", data);
    throw new Error("حدث خطأ في الاتصال بـ OpenAI API.");
  }

  const raw = data.choices?.[0]?.message?.content || "لم أتمكن من الرد.";

  // فلتر Markdown
  const clean = raw

//     .replace(/\*\*(.*?)\*\*/ //g, "$1")
//     .replace(/\*(.*?)\*/g, "$1")
//     .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
//     .replace(/\\n/g, "\n")
//     .replace(/^- /gm, "• ")
//     .trim();

//   return clean;
// }
