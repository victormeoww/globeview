import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parse } from 'csv-parse/sync'
import { subHours } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  // First, delete all existing intelligence updates
  await prisma.intelligenceUpdate.deleteMany()
  
  // Read and parse the CSV file
  const csvFilePath = join(process.cwd(), 'Additional_50_BREAKING_Intelligence_Reports.csv')
  const fileContent = readFileSync(csvFilePath, 'utf-8')
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true
  })

  // Process each record
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    // Parse coordinates from string "(lat, lng)" format
    const coordsMatch = record.coordinates.match(/\(([-\d.]+),\s*([-\d.]+)\)/)
    const location = coordsMatch ? {
      lat: parseFloat(coordsMatch[1]),
      lng: parseFloat(coordsMatch[2])
    } : { lat: 0, lng: 0 }

    // Create the intelligence update
    const now = new Date();
    const timestamp = i < 25 
      ? new Date(now.getTime() - (24 - i) * 1000) // Active updates are 1 second apart
      : new Date(now.getTime() - (i - 24) * 60000); // Archived updates are 1 minute apart

    // Clean up the title by removing "BREAKING:" prefix
    const cleanTitle = record.title.replace(/^BREAKING:\s*/i, '').trim();

    console.log(`Creating update: ${cleanTitle} with timestamp: ${timestamp}`);

    await prisma.intelligenceUpdate.create({
      data: {
        title: cleanTitle,
        category: record.category.toLowerCase(),
        location: location,
        date: timestamp,
        time: record.time_filter || 'LIVE',
        source: record.source_name,
        sourceType: record.source_type.toLowerCase(),
        sourceIcon: getSourceIcon(record.source_type),
        excerpt: record.description.substring(0, 150) + '...',
        content: record.description,
        sourceUrl: record.source_link,
        icon: getCategoryIcon(record.category),
        status: i < 25 ? 'active' : 'archived',
        timestamp: timestamp,
        metadata: {
          originalTimestamp: timestamp.toISOString(),
          coordinates: record.coordinates
        }
      }
    })
  }

  console.log('Database seeded successfully!')
}

function getSourceIcon(sourceType: string): string {
  switch (sourceType.toLowerCase()) {
    case 'verified':
      return 'verified'
    case 'osint':
      return 'osint'
    case 'analysis':
      return 'analysis'
    case 'media':
      return 'media'
    default:
      return 'default'
  }
}

function getCategoryIcon(category: string): string {
  switch (category.toLowerCase()) {
    case 'conflict':
      return 'fas fa-fighter-jet'
    case 'security':
      return 'fas fa-shield-alt'
    case 'economy':
      return 'fas fa-chart-line'
    case 'diplomacy':
      return 'fas fa-handshake'
    case 'humanitarian':
      return 'fas fa-hands-helping'
    case 'politics':
      return 'fas fa-landmark'
    case 'technology':
      return 'fas fa-microchip'
    case 'environment':
      return 'fas fa-leaf'
    default:
      return 'fas fa-globe'
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 