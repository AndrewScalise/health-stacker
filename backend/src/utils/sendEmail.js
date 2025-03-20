const nodemailer = require("nodemailer");
const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_FROM,
  NODE_ENV,
} = require("../config/env");
const logger = require("./logger");

/**
 * Send email using configured transport
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email body (text)
 * @param {string} options.html - Email body (html, optional)
 * @returns {Promise} Send result
 */
const sendEmail = async (options) => {
  // For development/testing, log email instead of sending
  if (NODE_ENV === "development" && !EMAIL_HOST) {
    logger.info("Email would have been sent:", {
      to: options.email,
      subject: options.subject,
      text: options.message,
    });
    return true;
  }

  // Create email transporter
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  // Message configuration
  const message = {
    from: `HealthStack <${EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // Send email
  const info = await transporter.sendMail(message);

  logger.info(`Email sent: ${info.messageId}`);

  return info;
};

module.exports = sendEmail;
