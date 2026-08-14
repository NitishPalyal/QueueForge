import type { SendmailOptions } from "./mail.types.ts";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import configKeys from "../../config/config.ts";

const oauth2Client = new google.auth.OAuth2(
  configKeys.GOOGLE_CLIENT_ID,
  configKeys.GOOGLE_CLIENT_SECRET,
);

oauth2Client.setCredentials({
  refresh_token: configKeys.GOOGLE_REFRESH_TOKEN!,
});

const accessToken = await oauth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: configKeys.GOOGLE_USER,
    clientSecret: configKeys.GOOGLE_CLIENT_SECRET,
    clientId: configKeys.GOOGLE_CLIENT_ID,
    refreshToken: configKeys.GOOGLE_REFRESH_TOKEN,
    accessToken: accessToken.token!,
  },
});

transporter
  .verify()
  .then(() => {
    console.log("Email Trasporter is Ready to send emails");
  })
  .catch((err) => {
    console.error("Email Trasporter verfication failed:", err);
  });

export default transporter;
