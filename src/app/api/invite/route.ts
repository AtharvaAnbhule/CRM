// app/api/invite/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import ical, { ICalCalendarMethod } from 'ical-generator';
import { format, addDays } from 'date-fns';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, attendeeEmail, startTime, endTime, description, location } = body;

    // Create iCal event
    const calendar = ical({ name: 'Meeting Invitation' });
    calendar.method(ICalCalendarMethod.REQUEST);

    const event = calendar.createEvent({
      start: new Date(startTime),
      end: new Date(endTime),
      summary: title,
      description,
      location: location || 'Online Meeting',
      organizer: {
        name: 'Organizer',
        email: process.env.CONTACT_EMAIL || 'noreply@yourcompany.com',
      },
      attendees: [{
        email: attendeeEmail,
        rsvp: true,
      }]
    });

    // Generate calendar HTML for email
    const generateCalendarHTML = (date: Date) => {
      const days = [];
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - 2); // Show 2 days before event
      
      for (let i = 0; i < 5; i++) { // Show 5-day window
        const currentDate = addDays(startDate, i);
        const isEventDay = currentDate.toDateString() === new Date(startTime).toDateString();
        
        days.push(`
          <div style="
            width: 14%; 
            text-align: center; 
            padding: 8px 0;
            border-radius: 4px;
            background: ${isEventDay ? '#2d5f9e' : '#f5f5f5'};
            color: ${isEventDay ? 'white' : '#333'};
            font-weight: ${isEventDay ? 'bold' : 'normal'};
          ">
            <div style="font-size: 12px;">${format(currentDate, 'EEE')}</div>
            <div style="font-size: 16px;">${format(currentDate, 'd')}</div>
            ${isEventDay ? '<div style="font-size: 10px;">★</div>' : ''}
          </div>
        `);
      }
      
      return `
        <div style="
          display: flex; 
          justify-content: space-between;
          margin: 20px 0;
          background: white;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          ${days.join('')}
        </div>
      `;
    };

    // Zoho-style professional email template with calendar
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Meeting Invitation: ${title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; }
          .header { background-color: #2d5f9e; padding: 25px; color: white; text-align: center; }
          .content { padding: 25px; background: #ffffff; }
          .event-title { color: #2d5f9e; font-size: 22px; margin-bottom: 15px; font-weight: 600; }
          .detail { margin-bottom: 15px; display: flex; }
          .detail-icon { margin-right: 10px; color: #2d5f9e; }
          .detail-text { flex: 1; }
          .buttons { margin: 25px 0; text-align: center; }
          .button { display: inline-block; padding: 12px 24px; margin: 0 10px; border-radius: 4px; text-decoration: none; font-weight: 500; }
          .accept { background-color: #2d9e5f; color: white; }
          .decline { background-color: #e74c3c; color: white; }
          .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
          .calendar-container { 
            background: #f9f9f9; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
            border: 1px solid #e1e1e1;
          }
          .time-display {
            font-size: 18px;
            color: #2d5f9e;
            text-align: center;
            margin: 10px 0;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Meeting Invitation</h1>
        </div>
        
        <div class="content">
          <div class="event-title">${title}</div>
          
          <div class="time-display">
            ${format(new Date(startTime), 'EEEE, MMMM d, yyyy')}<br>
            ${format(new Date(startTime), 'h:mm a')} - ${format(new Date(endTime), 'h:mm a')}
          </div>
          
          <!-- Visual Calendar -->
          <div class="calendar-container">
            <h3 style="margin-top: 0; color: #2d5f9e;">Event Date</h3>
            ${generateCalendarHTML(new Date(startTime))}
          </div>
          
          <div class="detail">
            <div class="detail-icon">📍</div>
            <div class="detail-text">
              <strong>Location:</strong><br>
              ${location || 'Online Meeting'}
            </div>
          </div>
          
          ${description && `
            <div class="detail">
              <div class="detail-icon">📝</div>
              <div class="detail-text">
                <strong>Description:</strong><br>
                ${description}
              </div>
            </div>
          `}
          
         
          
          <div class="footer">
            <p>This meeting invitation was sent from Workeloo CRM.</p>
            <p>The calendar attachment contains complete event details.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const transporter = nodemailer.createTransport({
      host: 'smtp.zeptomail.in',
  port: 587, // Or use 465 for SSL
  secure: false, // true if using port 465
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"Workeloo Team" <noreply@workeloo.com>',
      to: attendeeEmail,
      subject: `Invitation: ${title}`,
      html: emailHtml,
      icalEvent: {
        filename: 'meeting-invite.ics',
        method: 'REQUEST',
        content: calendar.toString(),
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error sending invite:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send invitation' },
      { status: 500 }
    );
  }
}