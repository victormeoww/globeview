import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import { Webhook } from '@prisma/client'

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const calculatedSignature = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  )
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-webhook-signature')
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      )
    }

    const body = await request.text()
    const webhooks = await prisma.webhook.findMany({
      where: { isActive: true },
    })

    // Try to verify with each active webhook's secret
    const validWebhook = webhooks.find((webhook: Webhook) =>
      verifyWebhookSignature(body, signature, webhook.secret)
    )

    if (!validWebhook) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // Parse the payload
    const data = JSON.parse(body)

    // Create the intelligence update
    const update = await prisma.intelligenceUpdate.create({
      data: {
        title: data.title,
        category: data.category,
        location: data.location,
        date: new Date(data.date),
        time: data.time,
        source: data.source,
        sourceType: data.sourceType,
        sourceIcon: data.sourceIcon,
        excerpt: data.excerpt,
        content: data.content,
        sourceUrl: data.sourceUrl,
        icon: data.icon,
        webhookId: validWebhook.id.toString(),
        metadata: data.metadata || {},
        tags: {
          connectOrCreate: (data.tags || []).map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: {
        tags: true,
      },
    })

    // Update webhook last trigger time
    await prisma.webhook.update({
      where: { id: validWebhook.id },
      data: { lastTrigger: new Date() },
    })

    return NextResponse.json(update)
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 