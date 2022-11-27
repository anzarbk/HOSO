//  const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);
  
//   let sid;
  
//   module.exports = {
//     sendOtp: (phone) => {
//       console.log("otp check", phone);
//       client.verify.v2.services
//       .create({ friendlyName: "HOSO OTP Verification" })
//         .then((service) => {
//           sid = service.sid;
//           client.verify.v2
//             .services(service.sid)
//             .verifications.create({ to: "+91" + phone, channel: "sms" })
//             .then((verification) => console.log(verification.status));
//         });
//     },
//     verifyOtp: (phone, otp) => {
//       return new Promise(async (resolve,reject)=>{
//         await client.verify.v2
//         .services(sid)
//         .verificationChecks.create({ to: "+91" + phone, code: otp })
//         .then((verification_check) => {
//           resolve(verification_check)
//         });
//       })
//     },
//   };



//     const client =require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)



//   let sid

//   module.exports={
      
        
    
//       sendOtp : (phone)=>{
//           console.log("otp check",phone)
//           client.verify.v2.services
//           .create({friendlyName: 'La Bonnz OTP Verification'})
//           .then(service =>{
//               sid=service.sid;
//               client.verify.v2.services(service.sid)
//               .verifications
//               .create({to: '+91'+phone, channel: 'sms'})
//               .then(verification => console.log(verification.status))
//           }
            
//           ); 
//       },
//       verifyOtp : async(phone,otp)=>{
//           let validation
//           console.log("otp check",phone,otp)
//           await client.verify.v2.services(sid)
//               .verificationChecks
//               .create({to: '+91'+phone, code: otp})
//               .then((verification_check) => {
//                   console.log(verification_check)
//               validation= verification_check
//         });
//         return validation
//       }
//   }

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_ID
const client = require("twilio")(accountSid, authToken);

console.log(client.verify.v2.services)

client.verify.v2.services
  .create({ friendlyName: "HOSO" })
  .then((service) => console.log("OTP Ready"));

function sendVerifyToken(mobile) {
  return new Promise((resolve, reject) => {
    client.verify.v2
      .services(serviceId)
      .verifications.create({ to: `+91${mobile}`, channel: "sms" })
      .then((verification) => {
        resolve(verification.status);
      });
  });
}

function checkVerificationToken(mobile, code) {
  return new Promise((resolve, reject) => {
    client.verify.v2
      .services(serviceId)
      .verificationChecks.create({ to: `+91${mobile}`, code: code })
      .then((verification_check) => {
        resolve(verification_check.status);
      });
  });
}

module.exports = {
  sendVerifyToken,
  checkVerificationToken,
};