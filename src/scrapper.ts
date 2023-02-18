import { AxiosResponse, get } from "axios";
import { AnyNode, CheerioAPI, load } from "cheerio";
import { digest } from "./digest";
import { sanitizeInfo } from "./sanitize";
import { HouseInfo, HouseLink } from "./types";

const homeUrl = process.env["OLX_HOME_URL"];
const houseLinkSelector = process.env["OLX_HOUSE_LINK_SELECTOR"];
const houseFieldSelector = process.env["OLX_HOUSE_FIELD_SELECTOR"];
const pageSearchsLimit = Number(process.env["OLX_PAGE_SEARCHS_LIMIT"]);

const getNthChildText = <T extends AnyNode>(i: number, el: T, $: CheerioAPI) =>
  $($(el).children().get(i)).text();

async function getHouseLinksOnPage(pageNumber: number) {
  console.log(`Searching page ${pageNumber}`);
  let response: AxiosResponse<string>;

  try {
    response = await get<string>(`${homeUrl}?o=${pageNumber}`);
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

export async function getHouseInfo(houseUrl: string): Promise<HouseInfo> {
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

export async function getHouseLinks() {
  const links: HouseLink[] = [];
  let pageNumber = 1;

  while (pageNumber <= pageSearchsLimit) {
    const newLinks = await getHouseLinksOnPage(pageNumber++);
    if (!newLinks || newLinks.length === 0) break;
    links.push(...newLinks);
  }

  return links;
}
