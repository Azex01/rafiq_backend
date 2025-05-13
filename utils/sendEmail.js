import nodemailer from "nodemailer";

export const sendResetEmail = async (to, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // بريدك
      pass: process.env.EMAIL_PASS, // app password من Gmail
    },
  });

  await transporter.sendMail({
    from: `"رفيق" <${process.env.EMAIL_USER}>`,
    to,
    subject: "إعادة تعيين كلمة المرور",
    html: `
      <p>اضغط على الرابط التالي لإعادة تعيين كلمة المرور:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>الرابط صالح لمدة 30 دقيقة فقط.</p>
    `,
  });
};
