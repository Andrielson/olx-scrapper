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
