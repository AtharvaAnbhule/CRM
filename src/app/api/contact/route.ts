import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const formData = await req.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({ 
      host: 'smtp.zeptomail.in',
  port: 587, // Or use 465 for SSL
  secure: false, // true if using port 465

    // service: "gmail",
    auth: {
      user: process.env.CONTACT_EMAIL,
      pass: process.env.CONTACT_EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: '"Workeloo Team" <noreply@workeloo.com>', // Must be verified in ZeptoMail
  to: 'atharvaanbhule@gmail.com',
  subject: "New Agency Contact Form",
    text: message.toString(),
  });

  return NextResponse.json({ success: true });
}
