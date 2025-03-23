import { PrismaClient } from '@prisma/client'
import { subHours } from 'date-fns'

const prisma = new PrismaClient()

async function rotateUpdates() {
  try {
    // Get the most recent active update's timestamp
    const mostRecentUpdate = await prisma.intelligenceUpdate.findFirst({
      where: { status: 'active' },
      orderBy: { timestamp: 'desc' }
    });

    // Archive the oldest update
    const oldestUpdate = await prisma.intelligenceUpdate.findFirst({
      where: { status: 'active' },
      orderBy: { timestamp: 'asc' }
    });

    if (oldestUpdate) {
      console.log(`Archiving update: ${oldestUpdate.title} (timestamp: ${oldestUpdate.timestamp})`);
      await prisma.intelligenceUpdate.update({
        where: { id: oldestUpdate.id },
        data: { status: 'archived' }
      });
    }

    // Activate a new update from archived ones
    const archivedUpdate = await prisma.intelligenceUpdate.findFirst({
      where: {
        status: 'archived'
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    if (archivedUpdate) {
      const now = new Date();
      console.log(`Activating update: ${archivedUpdate.title} (old timestamp: ${archivedUpdate.timestamp})`);
      
      // Set the timestamp to the current time
      await prisma.intelligenceUpdate.update({
        where: { id: archivedUpdate.id },
        data: {
          status: 'active',
          timestamp: now
        }
      });
      
      console.log(`New timestamp set to: ${now}`);
    }

    console.log('Successfully rotated 1 update');
  } catch (error) {
    console.error('Error rotating updates:', error);
  }
}

// Function to run rotation with random delay
async function runContinuousRotation() {
  while (true) {
    await rotateUpdates()
    // Random delay between 5-20 seconds
    const delay = Math.floor(Math.random() * 15000) + 5000
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}

// Run the continuous rotation
runContinuousRotation()
  .catch(error => {
    console.error('Fatal error in rotation process:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 