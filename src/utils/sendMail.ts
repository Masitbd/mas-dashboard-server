import nodemailer from "nodemailer";
import config from "../app/config";


const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  filename?: string,
  path?: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: config.mail_user,
        pass: config.mail_secret,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Nexist" <${config.mail_user}>`,
      to,
      subject,
      html,
    };

    if (filename && path) {
      mailOptions.attachments = [
        {
          filename,
          path,
          contentType: "application/pdf",
        },
      ];
    }

    const response = await transporter.sendMail(mailOptions);

    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;
