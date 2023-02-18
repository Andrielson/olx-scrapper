import { AxiosResponse, get } from "axios";
import { AnyNode, CheerioAPI, load } from "cheerio";
import { digest } from "./digest";
import { sanitizeInfo } from "./sanitize";
import { HouseInfo, HouseLink } from "./types";

const mainUrl =
  "https://www.olx.com.br/imoveis/aluguel/casas/estado-sp/regiao-de-sao-jose-do-rio-preto/regiao-de-sao-jose-do-rio-preto/sao-jose-do-rio-preto";

const houseLinkSelector = "li.sc-1mburcf-1 > a";
const houseFieldSelector = ".sc-hmzhuo.ad__sc-1f2ug0x-3.sSzeX.sc-jTzLTM.iwtnNi";

const PAGE_SEARCHS_LIMIT = 1;

const getNthChildText = <T extends AnyNode>(i: number, el: T, $: CheerioAPI) =>
  $($(el).children().get(i)).text();

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

  while (pageNumber <= PAGE_SEARCHS_LIMIT) {
    const newLinks = await getHouseLinksOnPage(pageNumber++);
    if (!newLinks || newLinks.length === 0) break;
    links.push(...newLinks);
  }

  return links;
}
