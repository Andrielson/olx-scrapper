import { HouseLink } from "./types";

export const filterLinks = (links: HouseLink[], existingHashes: string[]) =>
  links.filter(({ hash }) => {
    const index = existingHashes.indexOf(hash);
    if (index >= 0) {
      existingHashes.splice(index, 1);
      return false;
    }
    return true;
  });
