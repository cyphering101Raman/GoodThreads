import nodemailer from "nodemailer";

export const sendEmail = async function(to: string, subject: string, html:string){

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"Auth Service" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
    });
};

export const sendVerificationEmail = async (to: string, otp: string) => {
    const html = `
    <p>Your email verification code:</p>
    <h2>${otp}</h2>
    <p>Expires in 10 minutes.</p>
  `;

    await sendEmail(to, "Verify your email", html);
};
