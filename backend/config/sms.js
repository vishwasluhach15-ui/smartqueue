const sendSMS = async (to, message) => {
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER &&
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
  ) {
    try {
      const twilio = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });
      console.log(`SMS sent to ${to}`);
    } catch (err) {
      console.error('Twilio error:', err.message);
    }
  } else {
    // Dev mode — OTP terminal mein print hoga
    console.log(`[SMS to ${to}]: ${message}`);
  }
};

module.exports = { sendSMS };