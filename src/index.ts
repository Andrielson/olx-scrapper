import { checkIgnoredHouse } from "./check-ignored-house";
import { DB } from "./db";
import { filterLinks } from "./filter-links";
import mailServiceFactory from "./mail.service";
import { getHouseInfo, getHouseLinks } from "./scrapper";
import { HouseInfo, HouseRecord } from "./types";

async function notifyNewHouses(houses: HouseRecord[]) {
  const mailService = mailServiceFactory();

  const text = houses.map((h) => `- ${h.link}`).join("\n\n");

  await mailService.sendMessage({
    text,
    to: "andrielson@gmail.com",
    subject: "Novas casas encontradas na OLX",
  });
}

async function main() {
  const links = await getHouseLinks();

  const existingHashes = await DB.getAllHashesAndUpdateAvailableLinks(links);

  const searchableLinks = filterLinks(links, existingHashes);

  if (searchableLinks.length === 0) {
    console.log("No house was found!");
    return;
  }

  const notifiableHouses: HouseRecord[] = [];

  console.log(`Collecting info from ${searchableLinks.length} houses...`);
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
    console.log("Saving results...");
    await DB.insertMany(houseRecords);
  } catch (error) {
    console.error(error);
  }

  if (notifiableHouses.length > 0) {
    console.log(`Found ${notifiableHouses.length} houses of interest!`);
    await notifyNewHouses(notifiableHouses);
  }
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
