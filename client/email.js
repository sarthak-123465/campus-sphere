const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = (email, token) => {
  const msg = {
    to: email,
    from: 'no-reply@your-app.com',
    subject: 'Verify your email address',
    text: `Please click the following link to verify your email address:
    https://campus-sphere.onrender.com/verify/${token}`,
    html: `<p>Please click the following link to verify your email address:</p>
    <p><a href="https://campus-sphere.onrender.com/verify/${token}">Verify Email</a></p>`,
  };

  sgMail.send(msg);
};
