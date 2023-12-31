const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.firstName = user.name.split(' ')[0];
    this.to = user.email;
    this.from = 'Mohammed Riyad <riyadmh05@gmail.com>';
    this.url = url;
  }
  newTransport() {
    let transporter;
    if ( process.env.NODE_ENV === 'production') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MY_EMAIL,
          pass: process.env.MY_PASSWORD
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
    transporter
      .verify()
      .then(() => {
        console.log('Server is ready to take our messages');
      })
      .catch(console.error);
    return transporter;
  }

  async send(template, subject) {
    // 1) render html based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // 2)   define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      // text: htmlToText.fromString(html),
    };
    //   // 3) send the  email

    await this.newTransport().sendMail(mailOptions);
  }

  async verifyEmail() {
    await this.send('verify' , 'Verify Your Email')
  }

  async sendWelcome() {
    await this.send('welcome', 'welcome to natours family');
  }
  async sendResetPass() {
    await this.send(
      'passwordReset',
      'your password reset token (valid for 10 mins)'
    );
  }
};

// const sendEmail = async (options) => {
//   // 1) create a trasporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // 2) define email options
//   const mailOptions = {
//     from: ' Mohammed Riyad <riyadmh05@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   // 3) send the  email

//   await transporter.sendMail(mailOptions);

// };
// module.exports = sendEmail;
