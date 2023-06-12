import { HouseRecord } from "./types";

const IGNORED_NEIGHBORHOODS: string[] = [
  "Boa Vista",
  "Centro",
  "Chácara Jockey Club (Zona Rural)",
  "Eldorado",
  "Fazenda Retiro (Zona Rural)",
  "Jardim Canaã",
  "Jardim Congonhas",
  "Jardim João Paulo II",
  "Jardim Nunes",
  "Jardim Residencial Vetorasso",
  "Jardim Suzana",
  "Parque das Aroeiras",
  "Parque Industrial",
  "Parque Jaguaré",
  "Parque Residencial Joaquim Nabuco",
  "Parque Residencial Nature I",
  "Parque Residencial Universo",
  "Residencial Ana Célia",
  "Residencial Ary Attab",
  "Residencial Macedo Teles I",
  "Residencial Nato Vetorasso",
  "Setparque Avenida 2",
  "Solo Sagrado I",
  "Vila Anchieta",
  "Vila Clementina",
  "Vila Esplanada",
  "Vila São Pedro",
  "Vila Sinibaldi",
  "Vila Novaes",
  "Vila Moreira",
  "Jardim Santa Rosa I",
];
const MIN_BEDROOMS = Number(process.env["MIN_BEDROOMS"]) ?? 3;
const MIN_RENT_AMOUNT = Number(process.env["MIN_RENT_AMOUNT"]) ?? 2000;
const MAX_RENT_AMOUNT = Number(process.env["MAX_RENT_AMOUNT"]) ?? 5000;

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
