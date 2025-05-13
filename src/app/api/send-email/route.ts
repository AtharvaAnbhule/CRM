import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { subject, content, to } = await req.json();

    if (!subject || !content || !Array.isArray(to) || to.length === 0) {
      return NextResponse.json({ error: "Subject, content, and recipients are required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASSWORD,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <header style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ccc;">
          <h2 style="color: #6c63ff;">${subject}</h2>
        </header>
        <main style="margin-top: 20px;">
          <p style="font-size: 16px; color: #333;">${content}</p>
        </main>
        <footer style="margin-top: 30px; font-size: 12px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
          <p>Sent via Workeloo Mail System</p>
          <p>1234 Business Road, Pune, India</p>
        </footer>
      </div>
    `;

    const mailOptions = {
      from: process.env.CONTACT_EMAIL,
      to: to.join(","),
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    return NextResponse.json({ message: "Emails sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Something went wrong while sending emails" }, { status: 500 });
  }
}
