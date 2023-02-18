import { HouseInfo } from "./types";

const houseKeysMap = new Map<string, string>([
  ["link", "link"],
  ["title", "title"],
  ["rentAmount", "rentAmount"],
  //["Categoria", "category"],
  //["Tipo", "type"],
  ["Condomínio", "condominiumFee"],
  ["IPTU", "taxAmount"],
  ["Área útil", "area"],
  ["Quartos", "bedrooms"],
  ["Banheiros", "bathrooms"],
  ["Vagas na garagem", "garages"],
  ["cep", "postalCode"],
  ["Município", "city"],
  ["Bairro", "neighborhood"],
  ["Logradouro", "address"],
]);

export function sanitizeInfo(rawInfo: Record<string, string>) {
  return Object.entries(rawInfo).reduce((prev: HouseInfo, curr) => {
    const [key, value] = curr;
    if (!houseKeysMap.has(key)) return prev;
    let formattedValue: number | string | undefined;
    const mappedKey = houseKeysMap.get(key)!;
    switch (mappedKey) {
      case "rentAmount":
      case "bedrooms":
      case "bathrooms":
      case "garages":
        formattedValue = Number(value.replace(".", "").replace(",", "."));
        break;
      case "condominiumFee":
      case "taxAmount":
        formattedValue = !value
          ? undefined
          : Number(value.replace("R$", "").replace(".", "").replace(",", "."));
        break;
      case "area":
        formattedValue = !value
          ? undefined
          : Number(value.replace("m²", "").replace(".", "").replace(",", "."));
        break;
      default:
        return { ...prev, [mappedKey]: value };
    }
    formattedValue = isNaN(formattedValue!) ? undefined : formattedValue;
    return { ...prev, [mappedKey]: formattedValue };
  }, {});
}
