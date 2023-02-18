import { PrismaClient } from "@prisma/client";
import { HouseLink, HouseRecord } from "./types";

const prisma = new PrismaClient();

async function close() {
  await prisma.$disconnect();
}

async function getAllHashesAndUpdateAvailableLinks(links: HouseLink[]) {
  const hashes = links.map((l) => l.hash);
  const selectQuery = prisma.house.findMany();
  const updateQuery = prisma.house.updateMany({
    where: {
      hash: {
        notIn: hashes,
      },
    },
    data: {
      available: false,
      updatedAt: new Date(),
    },
  });
  const [houses] = await prisma.$transaction([selectQuery, updateQuery]);
  return houses.map((h) => h.hash);
}

async function insertMany(data: HouseRecord[]) {
  await prisma.house.createMany({ data });
}

export const DB = {
  insertMany,
  getAllHashesAndUpdateAvailableLinks,
  close,
};
