import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Utility functions for intelligence updates
export async function createIntelligenceUpdate(data: any) {
  return prisma.intelligenceUpdate.create({
    data: {
      ...data,
      location: data.location || {},
      metadata: data.metadata || {},
    },
    include: {
      tags: true,
    },
  })
}

export async function getIntelligenceUpdates(params: {
  category?: string
  sourceType?: string
  limit?: number
  offset?: number
  status?: string
}) {
  return prisma.intelligenceUpdate.findMany({
    where: {
      category: params.category,
      sourceType: params.sourceType,
      status: params.status || 'active',
    },
    take: params.limit || 10,
    skip: params.offset || 0,
    orderBy: {
      timestamp: 'desc',
    },
    include: {
      tags: true,
    },
  })
}

export async function getIntelligenceUpdateById(id: number) {
  return prisma.intelligenceUpdate.findUnique({
    where: { id },
    include: {
      tags: true,
    },
  })
}

export async function updateIntelligenceUpdate(id: number, data: any) {
  return prisma.intelligenceUpdate.update({
    where: { id },
    data,
    include: {
      tags: true,
    },
  })
}

export async function deleteIntelligenceUpdate(id: number) {
  return prisma.intelligenceUpdate.update({
    where: { id },
    data: { status: 'deleted' },
  })
}

// Webhook management functions
export async function createWebhook(data: {
  name: string
  url: string
  secret: string
}) {
  return prisma.webhook.create({
    data,
  })
}

export async function getWebhooks() {
  return prisma.webhook.findMany({
    where: {
      isActive: true,
    },
  })
}

export async function updateWebhookStatus(id: number, isActive: boolean) {
  return prisma.webhook.update({
    where: { id },
    data: { isActive },
  })
}

// Tag management functions
export async function createTag(name: string) {
  return prisma.tag.create({
    data: { name },
  })
}

export async function getTags() {
  return prisma.tag.findMany()
}

export async function addTagToUpdate(updateId: number, tagId: number) {
  return prisma.intelligenceUpdate.update({
    where: { id: updateId },
    data: {
      tags: {
        connect: { id: tagId },
      },
    },
    include: {
      tags: true,
    },
  })
} 