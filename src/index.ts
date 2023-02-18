import { PrismaClient } from "@prisma/client";
import { AxiosResponse, get } from "axios";
import { AnyNode, CheerioAPI, load } from "cheerio";
import { createHash } from "node:crypto";
import { checkIgnoredHouse } from "./check-ignored-house";
import { houseKeysMap } from "./house-keys-map";
import { HouseInfo, HouseRecord } from "./types";

// put in .env
const mainUrl =
  "https://www.olx.com.br/imoveis/aluguel/casas/estado-sp/regiao-de-sao-jose-do-rio-preto/regiao-de-sao-jose-do-rio-preto/sao-jose-do-rio-preto";

const houseLinkSelector = "li.sc-1mburcf-1 > a";
const houseFieldSelector = ".sc-hmzhuo.ad__sc-1f2ug0x-3.sSzeX.sc-jTzLTM.iwtnNi";
const PAGE_SEARCHS_LIMIT = 1;

interface HouseLink {
  hash: string;
  link: string;
}

const prisma = new PrismaClient();

function digest(text: string) {
  const hash = createHash("sha256");
  hash.update(text);
  return hash.digest("hex");
}

function sanitizeInfo(rawInfo: Record<string, string>) {
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

async function getHouseLinksOnPage(pageNumber: number) {
  console.log(`Searching page ${pageNumber}`);
  let response: AxiosResponse<string>;

  try {
    response = await get<string>(`${mainUrl}?o=${pageNumber}`);
  } catch (error) {
    return [];
  }

  const $ = load(response.data);

  return $(houseLinkSelector)
    .toArray()
    .map((el) => $(el).attr("href")!)
    .filter((link) => !!link)
    .map((link): HouseLink => ({ link, hash: digest(link) }));
}

const getNthChildText = <T extends AnyNode>(i: number, el: T, $: CheerioAPI) =>
  $($(el).children().get(i)).text();

async function getHouseInfo(houseUrl: string): Promise<HouseInfo> {
  let response: AxiosResponse<string>;
  const info: Record<string, string> = {};

  try {
    response = await get<string>(houseUrl);
  } catch (error) {
    return info;
  }

  const $ = load(response.data);
  info.title = $("h1").text();
  info.rentAmount = $($("h2").get(2)).text();
  const allInfo = $(houseFieldSelector)
    .toArray()
    .reduce((prev, curr) => {
      const key = getNthChildText(0, curr, $);
      const value = getNthChildText(1, curr, $);
      return Object.assign(prev, { [key]: value });
    }, info);
  return sanitizeInfo(allInfo);
}

async function main() {
  const links: HouseLink[] = [];
  let pageNumber = 1;

  while (pageNumber <= PAGE_SEARCHS_LIMIT) {
    const newLinks = await getHouseLinksOnPage(pageNumber++);
    if (!newLinks || newLinks.length === 0) break;
    links.push(...newLinks);
  }

  const hashesFromLinks = links.map((l) => l.hash);

  const hashesFromPrisma = await prisma.house
    .findMany()
    .then((houses) => houses.map((h) => h.hash));

  //filter only not existing
  const goodHashes: string[] = [];
  const searchableLinks = links.filter(({ hash }) => {
    const index = hashesFromPrisma.indexOf(hash);
    if (index >= 0) {
      hashesFromPrisma.splice(index, 1);
      return false;
    }
    goodHashes.push(hash);
    return true;
  });

  await prisma.house.updateMany({
    where: {
      hash: {
        notIn: hashesFromLinks,
      },
    },
    data: {
      available: false,
      updatedAt: new Date(),
    },
  });

  const notifiableHouses: HouseRecord[] = [];

  console.log(`Searching on ${searchableLinks.length} links...`);
  const houseRecords: HouseRecord[] = await searchableLinks.reduce(
    async (previous, { hash, link }, i) => {
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
    await prisma.$transaction(
      houseRecords.map((data) => prisma.house.create({ data }))
    );
  } catch (error) {
    console.error(error);
  }

  //notify new houses
  console.log(notifiableHouses.length);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
