import { checkIgnoredHouse } from "./check-ignored-house";
import { DB } from "./db";
import { filterLinks } from "./filter-links";
import { getHouseInfo, getHouseLinks } from "./scrapper";
import { HouseInfo, HouseRecord } from "./types";

async function main() {
  const links = await getHouseLinks();

  const existingHashes = await DB.getAllHashesAndUpdateAvailableLinks(links);

  const searchableLinks = filterLinks(links, existingHashes);

  const notifiableHouses: HouseRecord[] = [];

  console.log(`Searching on ${searchableLinks.length} links...`);
  const houseRecords: HouseRecord[] = await searchableLinks.reduce(
    async (previous, { hash, link }) => {
      const records = await previous;
      let houseInfo: HouseInfo;
      try {
        houseInfo = await getHouseInfo(link);
      } catch (error) {
        console.error(error);
        return records;
      }
      const data = { hash, link } as HouseRecord;
      Object.assign(data, houseInfo);
      data.ignored = checkIgnoredHouse(data);
      if (!data.ignored) notifiableHouses.push(data);
      records.push(data);
      return records;
    },
    Promise.resolve([] as HouseRecord[])
  );

  try {
    await DB.insertMany(houseRecords);
  } catch (error) {
    console.error(error);
  }

  //notify new houses
  console.log(notifiableHouses.length);
}

main()
  .then(async () => {
    await DB.close();
  })
  .catch(async (e) => {
    console.error(e);
    await DB.close();
    process.exit(1);
  });