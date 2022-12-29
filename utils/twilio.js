const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const serviceId = process.env.TWILIO_SERVICE_ID
const client = require("twilio")(accountSid, authToken);
let sid;
module.exports = {
  sendVerifyToken: (phone) => {
    console.log("qwe")
    client.verify.v2.services
      .create({ friendlyName: "HOSO OTP" })
      .then((service) => {
        sid = service.sid;
        client.verify.v2
          .services(service.sid)
          .verifications.create({ to: "+91" + phone, channel: "sms" })
          .then((verification) => console.log(verification.status));
      });
  },
  checkVerificationToken: async (phone, otp) => {
    let validation;
    await client.verify.v2
      .services(sid)
      .verificationChecks.create({ to: "+91" + phone, code: otp })
      .then((verification_check) => {
        validation = verification_check;
      });
    return validation;
  },
};