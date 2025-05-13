import nodemailer from 'nodemailer';

// POST function to handle incoming POST requests
export async function POST(req:Request) {
  try {
    const { answers, userEmail } = await req.json(); // Get the request body

    // Create a Nodemailer transporter object
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Can be replaced with any other service
      auth: {
        user: process.env.CONTACT_EMAIL, // Your email address from environment variables
        pass: process.env.CONTACT_EMAIL_PASSWORD, // Your email password or app password
      },
    });

    // Compose the email content
    const mailOptions = {
      from: process.env.EMAIL, // Sender's email
      to: 'your-email@example.com', // Your destination email address
      subject: 'New Chatbot Response from User', // Subject line
      html: `
        <h3>New Submission from the Chatbot</h3>
        <p><strong>User Email:</strong> ${userEmail}</p>
        <ul>
          ${answers
            .map(
              (answer:any) =>
                `<li><strong>${answer.question}:</strong> ${answer.response}</li>`
            )
            .join('')}
        </ul>
      `, // Email body in HTML format
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Return success response
    return new Response(JSON.stringify({ message: 'Email sent successfully!' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
    });
  }
}
