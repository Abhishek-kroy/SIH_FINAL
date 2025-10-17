const sendEmail = require('../utils/sendEmail'); // Your nodemailer utility

// Contact form controller
const contactUs = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const emailBody = `
      You have received a new message from your Contact Us form:

      Name: ${name}
      Email: ${email}
      Subject: ${subject}
      Message:
      ${message}
    `;

    // Send email to your support address
    await sendEmail('codechain.loanwork@gmail.com', `New Contact Form Message: ${subject}`, emailBody);

    return res.status(200).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ message: 'Failed to send message' });
  }
};

module.exports = { contactUs };
