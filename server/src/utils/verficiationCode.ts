import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap"
import dotenv from "dotenv";

dotenv.config();

export const generateVerificationCode = (): string => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

export const sendVerificationEmail = async (email: string, verificationCode: string) => {
    const transporter = nodemailer.createTransport(MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN || 'NO_TOKEN',
    }))

    let info = await transporter.sendMail({
        from: 'mailtrap@demomailtrap.com',
        to: email,
        subject: "Email Verification",
        text: `Your verification code is: ${verificationCode}`,
        html: `<b>Your verification code is: ${verificationCode}</b>`,
    });

    console.log("Message sent: %s", info.success);
};