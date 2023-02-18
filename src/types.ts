export interface HouseLink {
  hash: string;
  link: string;
}

export interface HouseInfo {
  title?: string;
  rentAmount?: number;
  condominiumFee?: number;
  taxAmount?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  garages?: number;
  postalCode?: string;
  city?: string;
  neighborhood?: string;
  address?: string;
}

export interface HouseRecord extends HouseLink, HouseInfo {
  ignored: boolean;
  available: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface NodemailerOptions {
  service?: string;
  host?: string;
  port?: string;
  secure?: boolean;
  pool?: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface MailConfig {
  readonly fromAddress: string;
  readonly fromName: string;
  readonly mailToUnsubscribe: string;
}

export interface MailMessage {
  readonly subject: string;
  readonly text: string;
  readonly to: string;
}