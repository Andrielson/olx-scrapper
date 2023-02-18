import checkRequiredOptionsFromEnv from "./check-required-options-from-env";
import { NodemailerOptions } from "./types";


export default function nodemailerConfigFromEnvFactory(
  env: NodeJS.ProcessEnv = process.env
): NodemailerOptions {
  const defaultOptions = ["NODEMAILER_SMTP_USER", "NODEMAILER_SMTP_PASS"];
  const wellKnownOptions = [...defaultOptions, "NODEMAILER_WELL_KNOWN"];
  const providersOptions = [
    ...defaultOptions,
    "NODEMAILER_SMTP_HOST",
    "NODEMAILER_SMTP_PORT",
    "NODEMAILER_SMTP_SECURE",
  ];

  const options: Partial<NodemailerOptions> = {};

  if (wellKnownOptions.every((it) => !!env[it])) {
    options.service = process.env.NODEMAILER_WELL_KNOWN as string;
  } else if (providersOptions.every((it) => !!env[it])) {
    options.host = env.NODEMAILER_SMTP_HOST!;
    options.port = env.NODEMAILER_SMTP_PORT!;
    options.secure = env.NODEMAILER_SMTP_SECURE! === "true";
  } else {
    checkRequiredOptionsFromEnv(env, providersOptions);
  }

  const user = env.NODEMAILER_SMTP_USER!;
  const pass = env.NODEMAILER_SMTP_PASS!;
  options.auth = { user, pass };

  options.pool =
    !!env.NODEMAILER_SMTP_POOL && env.NODEMAILER_SMTP_POOL === "true";

  return options as NodemailerOptions;
}
