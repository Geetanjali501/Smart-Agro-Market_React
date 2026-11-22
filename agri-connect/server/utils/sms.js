const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Sends an OTP SMS via Twilio.
 * @param {string} to - Phone number with country code e.g. +919876543210
 * @param {string} otp - 6-digit OTP
 */
async function sendOtpSms(to, otp) {
  // Normalize: ensure number starts with +
  const phone = to.startsWith('+') ? to : `+${to}`;

  await client.messages.create({
    body: `Your AgriConnect OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
}

module.exports = { sendOtpSms };
