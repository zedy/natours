import Nodemailer from 'nodemailer';

const sendEmail = async (opts) => {
  const transporter = Nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: 2525,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS
    }
  });

  const mailOpts = {
    from: 'Natours <info@natours.io>',
    to: opts.email,
    subject: opts.subject,
    text: opts.message,
  }

  await transporter.sendMail(mailOpts);
};

export default sendEmail;