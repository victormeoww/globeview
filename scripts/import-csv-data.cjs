const fs = require('fs');
const path = require('path');

// Define file paths for our "database" files
const DATA_DIR = path.join(process.cwd(), 'data');
const INTELLIGENCE_UPDATES_FILE = path.join(DATA_DIR, 'intelligence-updates.json');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');
const WEBHOOKS_FILE = path.join(DATA_DIR, 'webhooks.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
function initializeFile(filePath, initialData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

// Initialize all database files
initializeFile(INTELLIGENCE_UPDATES_FILE);
initializeFile(TAGS_FILE);
initializeFile(WEBHOOKS_FILE);

// Generic functions to read and write data
function readData(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

function writeData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Helper functions
function parseCoordinates(coordsString) {
  try {
    if (!coordsString) return { lat: 0, lng: 0 };
    
    // Handle format like "(35.6762,139.6503)"
    const match = coordsString.match(/\(([^,]+),([^)]+)\)/);
    if (match && match.length === 3) {
      return { 
        lat: parseFloat(match[1]), 
        lng: parseFloat(match[2]) 
      };
    }
    
    return { lat: 0, lng: 0 };
  } catch (error) {
    return { lat: 0, lng: 0 };
  }
}

function getIconForSourceType(sourceType) {
  // Map source types to appropriate icons
  const icons = {
    'VERIFIED': 'shield-check',
    'MEDIA': 'newspaper',
    'ANALYSIS': 'chart-bar',
    'OSINT': 'globe',
    'DEFAULT': 'info-circle'
  };
  
  return icons[sourceType?.toUpperCase()] || icons.DEFAULT;
}

function getCategoryIcon(category) {
  // Map categories to appropriate icons
  const icons = {
    'Conflict': 'fire',
    'Economy': 'chart-line',
    'Humanitarian': 'heart',
    'Security': 'lock',
    'Diplomacy': 'handshake',
    'Technology': 'microchip',
    'Environment': 'leaf',
    'Politics': 'landmark',
    'DEFAULT': 'info-circle'
  };
  
  return icons[category] || icons.DEFAULT;
}

// Create a new intelligence update
function createIntelligenceUpdate(data) {
  const updates = readData(INTELLIGENCE_UPDATES_FILE);
  
  // Generate ID (simulating auto-increment)
  const newId = updates.length > 0 ? Math.max(...updates.map(update => update.id)) + 1 : 1;
  
  // Create new update object
  const now = new Date().toISOString();
  const newUpdate = {
    id: newId,
    title: data.title,
    category: data.category,
    location: data.location || {},
    date: data.date || now,
    time: data.time || new Date().toLocaleTimeString(),
    source: data.source,
    sourceType: data.sourceType,
    sourceIcon: data.sourceIcon,
    excerpt: data.excerpt,
    content: data.content,
    sourceUrl: data.sourceUrl,
    timestamp: now,
    icon: data.icon,
    createdAt: now,
    updatedAt: now,
    webhookId: data.webhookId,
    metadata: data.metadata || {},
    tags: [], // We'll handle tags separately
    status: data.status || 'active'
  };
  
  // Add to collection and save
  updates.push(newUpdate);
  writeData(INTELLIGENCE_UPDATES_FILE, updates);
  
  return newUpdate;
}

// Import CSV data function
async function importCSVData(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }
  
  const csvData = fs.readFileSync(filePath, 'utf8');
  const lines = csvData.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  let importedCount = 0;
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // More careful parsing for CSV
    let inQuote = false;
    let currentValue = '';
    let values = [];
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue.trim());
    
    // Make sure we have the correct number of values
    if (values.length !== headers.length) {
      console.warn(`Skipping line ${i}: column count mismatch (${values.length} vs ${headers.length})`);
      continue;
    }
    
    const data = {};
    
    headers.forEach((header, index) => {
      data[header] = values[index].replace(/"/g, '');
    });
    
    // Special handling based on file format
    let title = data.title;
    let category = data.category;
    let coordinates = data.coordinates;
    let time_filter = data.time_filter;
    let source_name = data.source_name;
    let source_type = data.source_type;
    let source_link = data.source_link;
    let description = data.description;
    
    // The second CSV file has a different format
    if (!title && data.category && data.title === undefined) {
      // This means the second CSV format is being used
      title = data[Object.keys(data)[1]]; // Second column is title
      category = data[Object.keys(data)[0]]; // First column is category
      coordinates = data[Object.keys(data)[data.coordinates ? 2 : 7]]; // Coordinates might be at different positions
      time_filter = data[Object.keys(data)[2]]; // Third column might be time_filter
      source_name = data[Object.keys(data)[3]]; // Fourth column might be source_name
      source_type = data[Object.keys(data)[4]]; // Fifth column might be source_type
      source_link = data[Object.keys(data)[5]]; // Sixth column might be source_link
      description = data[Object.keys(data)[6]]; // Seventh column might be description
    }
    
    if (title && category) {
      // Map CSV fields to our data model
      const now = new Date().toISOString();
      createIntelligenceUpdate({
        title,
        category,
        location: parseCoordinates(coordinates),
        date: now,
        time: time_filter || 'LIVE',
        source: source_name,
        sourceType: source_type,
        sourceIcon: getIconForSourceType(source_type),
        excerpt: description ? (description.substring(0, 100) + '...') : '',
        content: description || '',
        sourceUrl: source_link,
        icon: getCategoryIcon(category),
        status: 'active'
      });
      
      importedCount++;
    }
  }
  
  return importedCount;
}

// Main function to import data
async function main() {
  try {
    console.log('Starting CSV data import...');
    
    // Import the CSV files
    const csvFile1 = path.join(process.cwd(), '35_BREAKING_Intelligence_Reports.csv');
    const csvFile2 = path.join(process.cwd(), 'Additional_50_BREAKING_Intelligence_Reports.csv');
    
    console.log(`Importing from ${csvFile1}...`);
    const count1 = await importCSVData(csvFile1);
    console.log(`Successfully imported ${count1} intelligence updates from first CSV file.`);
    
    console.log(`Importing from ${csvFile2}...`);
    const count2 = await importCSVData(csvFile2);
    console.log(`Successfully imported ${count2} intelligence updates from second CSV file.`);
    
    console.log(`Total imported: ${count1 + count2} intelligence updates`);
    console.log('CSV data import completed successfully!');
    
  } catch (error) {
    console.error('Error importing CSV data:', error);
    process.exit(1);
  }
}

main(); 