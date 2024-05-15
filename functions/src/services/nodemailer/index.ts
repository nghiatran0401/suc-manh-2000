import * as nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
async function getTransporter() {
  const GOOGLE_MAILER_CLIENT_ID = process.env.GOOGLE_MAILER_CLIENT_ID;
  const GOOGLE_MAILER_CLIENT_SECRET = process.env.GOOGLE_MAILER_CLIENT_SECRET;
  const GOOGLE_MAILER_REFRESH_TOKEN = process.env.GOOGLE_MAILER_REFRESH_TOKEN;
  const myOAuth2Client = new OAuth2Client(
    GOOGLE_MAILER_CLIENT_ID,
    GOOGLE_MAILER_CLIENT_SECRET
  );
  myOAuth2Client.setCredentials({
    refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
  });
  const myAccessTokenObject = await myOAuth2Client.getAccessToken();
  const myAccessToken = myAccessTokenObject?.token;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "thedh.dev@gmail.com, Sucmanh2000.ho@gmail.com",
      clientId: GOOGLE_MAILER_CLIENT_ID,
      clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
      accessToken: myAccessToken ?? "",
      refreshToken: GOOGLE_MAILER_REFRESH_TOKEN,
    },
  });
  return transporter;
}

export async function sendEmail(props: {
  html: string;
  to: string;
  subject: string;
  text: string;
}) {
  const { html, to, subject, text } = props;
  const info = await (
    await getTransporter()
  ).sendMail({
    from: "thedh.dev@gmail.com",
    to: to,
    subject: subject,
    text: text,
    html: html,
  });

  console.log("Message sent: %s", info.messageId);
  return info;
}
