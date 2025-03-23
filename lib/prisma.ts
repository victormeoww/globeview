// This file now proxies to our file-based database implementation
import * as dbFile from './db-file';

// Create a mock PrismaClient that redirects to our file-based database
export const prisma = {
  intelligenceUpdate: {
    create: (args: any) => dbFile.createIntelligenceUpdate(args.data),
    findMany: (args: any) => dbFile.getIntelligenceUpdates({
      category: args.where?.category,
      sourceType: args.where?.sourceType,
      limit: args.take,
      offset: args.skip,
      status: args.where?.status
    }),
    findUnique: (args: any) => dbFile.getIntelligenceUpdateById(args.where.id),
    update: (args: any) => dbFile.updateIntelligenceUpdate(args.where.id, args.data)
  },
  webhook: {
    create: (args: any) => dbFile.createWebhook(args.data),
    findMany: (args: any) => dbFile.getWebhooks(),
    update: (args: any) => dbFile.updateWebhookStatus(args.where.id, args.data.isActive)
  },
  tag: {
    create: (args: any) => dbFile.createTag(args.data.name),
    findMany: () => dbFile.getTags()
  }
}; 