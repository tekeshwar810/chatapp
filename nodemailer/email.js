var nodemailer = require('nodemailer');
const logger = require('../logger');
function sendEmail(){
  this.Mail = (email,token)=>{
      logger.debug('inside email sent function')
      var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'tekeshwardevelopersveltosest@gmail.com',
        pass: '123@Sveltose'
      }
    });
    const Token = token
    var mailOptions = {
      from: 'tekeshwar810@gmail.com',
      to: email,
      subject: 'email verification of user',
      html: `<div style="text-align: center;">
      <h1>Verify Your Email</h1>
      <p>please click the button below for verify email</p>
      <button style="background-color: #4CAF50;border: none;
      padding: 15px 32px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer; "><a href="http://localhost:8080/api/user_verify_email/${Token}" style="text-decoration: none; color:white"  >Click Here</a></button>
      <p style = "color:red">This email verification link is expire after 10 min and also use the link only one time</p>
      </div>` 
    };
   
    return new Promise((resolve, reject) => { 
    transporter.sendMail(mailOptions)
    .then((resp)=>{
      resolve('success')
    }).catch((err)=>{
      logger.error(err)
      reject('error')
    })
  })
} 
  
  this.admin_mail = (email,userInfo)=>{
    logger.debug('inside email sent to admin function')
  var transporter = nodemailer.createTransport({
    service: 'gmail',
      auth: {
        user: 'tekeshwardevelopersveltosest@gmail.com',
        pass: '123@Sveltose'
    }
  });
    var mailOptions = {
      from: 'tekeshwar810@gmail.com',
      to: email,
      subject: 'User Account Activation',
      html: `<h1>User Details</h1>
      <ul>
      <li>Name: ${userInfo.name}</li>
      <li>Email: ${userInfo.email}</li>
      <li>DOB: ${userInfo.dob}</li>
      </ul>`
};

return new Promise((resolve, reject) => {
transporter.sendMail(mailOptions, function (error, info) {
if (error) {
  logger.error(error)
  reject('error')
} else {
  resolve('success')
}
});
})
  } 
}
module.exports = new sendEmail()


