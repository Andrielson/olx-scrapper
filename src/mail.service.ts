import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import mailConfigFromEnvFactory from "./mail.config";
import nodemailerConfigFromEnvFactory from "./nodemailer.config";
import { MailConfig, MailMessage } from "./types";

export default function mailServiceFactory(
  mailConfig: MailConfig = mailConfigFromEnvFactory(),
  config = nodemailerConfigFromEnvFactory()
) {
  const transporter = createTransport(config as any);
  const from: Mail.Address = {
    address: mailConfig.fromAddress,
    name: mailConfig.fromName,
  };
  const headers: Mail.Headers = {
    key: "List-Unsubscribe",
    value: `mailto:${mailConfig.mailToUnsubscribe}?subject=unsubscribe`,
  };
  const sendMessage = async (message: MailMessage) => {
    try {
      await transporter.sendMail({
        ...message,
        from,
        headers,
      });
      console.info("Email enviado!");
    } catch (error) {
      console.error("Falha no envio do email!");
      console.error(error);
    }
  };
  return { sendMessage };
}
