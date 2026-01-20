import dotenv from "dotenv";

dotenv.config();

export default {
  node_env: process.env.NODE_MODULE,
  port: process.env.PORT,
  salt: Number(process.env.SALT_ROUND),
  database_url: process.env.DATABASE_URL,
  fronted_url:
    process.env.NODE_MODULE === "development"
      ? process.env.FRONTEND_URL_DEV
      : process.env.FRONTEND_URL_PROD,
  mail_user: process.env.MAIL_USER,
  mail_secret: process.env.MAIL_SECRET,
  password_reset_link: process.env.RESET_LINK,

  jwt: {
    access_secret: process.env.ACCESS_TOKEN,
    refresh_secret: process.env.REFRESH_TOKEN,
    expire_in: process.env.EXPIRES_IN,
    refresh_expire_in: process.env.REFRESH_EXPIRES_IN,
  },
  sms: {
    api_key: process.env.API_KEY,
    sender_id: process.env.SENDER_ID,
    api_url: process.env.API_URL,
  },
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  default_user_pass: process.env.DEFAULT_USER_PASS,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
};
