export interface HouseRecord {
  hash: string;
  link: string;
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
  ignored: boolean;
  available: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export type HouseInfo = Omit<
  HouseRecord,
  "hash" | "link" | "ignored" | "available" | "createdAt" | "updatedAt"
>;
