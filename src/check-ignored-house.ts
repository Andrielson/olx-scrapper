import { HouseRecord } from "./types";

const IGNORED_NEIGHBORHOODS: string[] = [
  "Boa Vista",
  "Parque Industrial",
  "Centro",
  "Vila São Pedro",
  "Residencial Ary Attab",
  "Eldorado",
  "Vila Clementina",
  "Residencial Ana Célia",
  "Jardim João Paulo II",
  "Jardim Canaã",
  "Fazenda Retiro (Zona Rural)",
  "Chácara Jockey Club (Zona Rural)",
];
const MIN_BEDROOMS = 3;
const MIN_RENT_AMOUNT = 1500;
const MAX_RENT_AMOUNT = 4500;

export function checkIgnoredHouse(house: HouseRecord) {
  if (!!house.bedrooms && house.bedrooms < MIN_BEDROOMS) return true;
  if (
    !!house.rentAmount &&
    (house.rentAmount < MIN_RENT_AMOUNT || house.rentAmount > MAX_RENT_AMOUNT)
  )
    return true;
  if (
    !!house.neighborhood &&
    IGNORED_NEIGHBORHOODS.includes(house.neighborhood)
  )
    return true;
  return false;
}
