import checkRequiredOptionsFromEnv from "./check-required-options-from-env";
import { MailConfig } from "./types";

export default function mailConfigFromEnvFactory(
  env: NodeJS.ProcessEnv = process.env
): MailConfig {
  const required = [
    "MAIL_FROM_ADDRESS",
    "MAIL_FROM_NAME",
    "MAIL_MAILTO_UNSUBSCRIBE",
  ];
  checkRequiredOptionsFromEnv(env, required);
  const fromAddress = env.MAIL_FROM_ADDRESS!;
  const fromName = env.MAIL_FROM_NAME!;
  const mailToUnsubscribe = env.MAIL_MAILTO_UNSUBSCRIBE!;

  return {
    fromAddress,
    fromName,
    mailToUnsubscribe,
  };
}
