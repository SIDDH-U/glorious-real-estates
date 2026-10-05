import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, propertyCategory, investmentBracket, notes } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required." },
        { status: 400 }
      );
    }

    const recipientEmail = "siddchand246@gmail.com";
    const inquiryTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // Method 1: If SMTP credentials configured in .env.local
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"Glorious Estates Advisory" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        replyTo: email,
        subject: `✦ New Private Inquiry from ${name} (${propertyCategory || "Luxury Estate"})`,
        html: `
          <div style="font-family: 'Georgia', serif; background-color: #0c0907; color: #faead2; padding: 40px 20px; border-radius: 16px; max-width: 650px; margin: 0 auto; border: 1px solid #cca15c;">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #cca15c; font-family: sans-serif;">GLORIOUS REAL ESTATES</span>
              <h2 style="margin: 8px 0 0; color: #ffffff; font-size: 26px;">Private Client Advisory Inquiry</h2>
              <p style="color: #a89f91; font-size: 12px; margin-top: 4px; font-family: sans-serif;">Received on ${inquiryTime} IST</p>
            </div>
            
            <div style="background-color: #14100c; border: 1px solid rgba(204,161,92,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 14px;">
                <tr>
                  <td style="padding: 10px 0; color: #cca15c; font-weight: bold; width: 35%;">Client Name:</td>
                  <td style="padding: 10px 0; color: #ffffff;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #cca15c; font-weight: bold;">Client Email:</td>
                  <td style="padding: 10px 0; color: #ffffff;"><a href="mailto:${email}" style="color: #e5c596;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #cca15c; font-weight: bold;">Property Category:</td>
                  <td style="padding: 10px 0; color: #ffffff;">${propertyCategory || "Not specified"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #cca15c; font-weight: bold;">Investment Bracket:</td>
                  <td style="padding: 10px 0; color: #ffffff;">${investmentBracket || "Not specified"}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #14100c; border: 1px solid rgba(204,161,92,0.3); border-radius: 12px; padding: 24px;">
              <h4 style="margin: 0 0 10px; color: #cca15c; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; font-family: sans-serif;">Scope & Client Notes</h4>
              <p style="margin: 0; line-height: 1.6; color: #e0d8cc; font-size: 14px; white-space: pre-wrap;">${notes || "No additional notes provided."}</p>
            </div>

            <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #7a7266; font-family: sans-serif;">
              This inquiry was submitted through the Glorious Estates private client advisory portal.
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      return NextResponse.json({ success: true, method: "smtp" });
    }

    // Method 2: Fallback via FormSubmit API dispatch to siddchand246@gmail.com
    const origin = req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";
    const forwardResponse = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Referer: origin,
        Origin: origin,
      },
      body: JSON.stringify({
        _subject: `✦ New Private Inquiry from ${name} (${propertyCategory || "Luxury Estate"})`,
        Client_Name: name,
        Client_Email: email,
        Property_Category: propertyCategory,
        Target_Investment: investmentBracket,
        Architectural_Notes: notes || "No additional notes",
        Submission_Time: inquiryTime,
        _template: "table",
      }),
    });

    const forwardData = await forwardResponse.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      forwarded: true,
      details: forwardData,
    });
  } catch (error: any) {
    console.error("Inquiry submission error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit inquiry." },
      { status: 500 }
    );
  }
}
