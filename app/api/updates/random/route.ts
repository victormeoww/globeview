import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const updates = await prisma.intelligenceUpdate.findMany({
      where: {
        status: 'active'
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No intelligence updates found' }, { status: 404 });
    }

    // Return a random update
    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
    
    // Convert the timestamp to a number (milliseconds since epoch)
    const formattedUpdate = {
      ...randomUpdate,
      timestamp: randomUpdate.timestamp ? new Date(randomUpdate.timestamp).getTime() : Date.now()
    };

    return NextResponse.json(formattedUpdate);
  } catch (error) {
    console.error('Error fetching random update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 