import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

let prisma: PrismaClient | undefined = global.prismaGlobal;

function getDbClient() {
  if (!prisma) {
    prisma = new PrismaClient();
    if (process.env.NODE_ENV !== "production") {
      global.prismaGlobal = prisma;
    }
  }

  return prisma;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getDbClient() as unknown as Record<PropertyKey, unknown>;
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
