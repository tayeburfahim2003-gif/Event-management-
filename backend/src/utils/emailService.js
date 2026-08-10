const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendEmail = async(to, subject, html) => {
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"Green University" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.error('Email Error:', error);
        return false;
    }
};

const sendRegistrationConfirmation = async(user, event, qrCode) => {
    const html = `
        <h2>Registration Confirmed!</h2>
        <p>Dear ${user.name},</p>
        <p>You have successfully registered for <strong>${event.title}</strong>.</p>
        <p><strong>Event Details:</strong></p>
        <ul>
            <li><strong>Date:</strong> ${new Date(event.startDate).toLocaleString()}</li>
            <li><strong>Venue:</strong> ${event.venue}</li>
            <li><strong>Category:</strong> ${event.category}</li>
        </ul>
        <p><strong>Your QR Code for Check-in:</strong></p>
        <img src="${qrCode}" alt="QR Code" style="width: 200px; height: 200px;" />
        <p>Please show this QR code at the venue for check-in.</p>
        <p>Thank you,<br>Green University Events Team</p>
    `;
    return await sendEmail(user.email, `Registration Confirmed: ${event.title}`, html);
};

module.exports = { sendEmail, sendRegistrationConfirmation };