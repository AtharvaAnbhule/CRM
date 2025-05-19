// app/api/send-email/route.ts
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { emails } = await request.json()

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'Invalid email data' },
        { status: 400 }
      )
    }

    // Create reusable transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASSWORD,
      },
    })

    // Send each email individually for better tracking
    const results = await Promise.all(
      emails.map(async (email) => {
        try {
          const info = await transporter.sendMail({
            from: `"team Workeloo" <${process.env.CONTACT_EMAIL}>`,
            to: email.to,
            subject: email.subject,
            text: email.content,
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${email.content.replace(/\n/g, '<br>')}</div>`,
          })

          return {
            email: email.to,
            status: 'success',
            messageId: info.messageId,
          }
        } catch (error) {
          return {
            email: email.to,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      })
    )

    // Count successes and failures
    const successCount = results.filter((r) => r.status === 'success').length
    const errorCount = results.filter((r) => r.status === 'error').length

    return NextResponse.json({
      message: `Emails processed: ${successCount} successful, ${errorCount} failed`,
      results,
    })
  } catch (error) {
    console.error('Error sending emails:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}