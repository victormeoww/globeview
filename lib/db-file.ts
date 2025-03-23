import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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
function initializeFile(filePath: string, initialData: any = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

// Initialize all database files
initializeFile(INTELLIGENCE_UPDATES_FILE);
initializeFile(TAGS_FILE);
initializeFile(WEBHOOKS_FILE);

// Generic functions to read and write data
function readData<T>(filePath: string): T {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data) as T;
}

function writeData<T>(filePath: string, data: T): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Type definitions (matching Prisma models)
export interface IntelligenceUpdate {
  id: number;
  title: string;
  category: string;
  location: any; // JSON
  date: string; // ISO date string
  time: string;
  source: string;
  sourceType: string;
  sourceIcon: string;
  excerpt: string;
  content: string;
  sourceUrl?: string;
  timestamp: string; // ISO date string
  icon: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  webhookId?: number;
  metadata?: any; // JSON
  tags: Tag[];
  status: string;
}

export interface Tag {
  id: number;
  name: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Webhook {
  id: number;
  name: string;
  secret: string;
  url: string;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  lastTrigger?: string; // ISO date string
}

// Utility functions for intelligence updates
export async function createIntelligenceUpdate(data: any): Promise<IntelligenceUpdate> {
  const updates = readData<IntelligenceUpdate[]>(INTELLIGENCE_UPDATES_FILE);
  
  // Generate ID (simulating auto-increment)
  const newId = updates.length > 0 ? Math.max(...updates.map(update => update.id)) + 1 : 1;
  
  // Create new update object
  const now = new Date().toISOString();
  const newUpdate: IntelligenceUpdate = {
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
  
  // Handle tags if provided
  if (data.tags && data.tags.length > 0) {
    const allTags = readData<Tag[]>(TAGS_FILE);
    newUpdate.tags = data.tags.map((tagId: number) => {
      return allTags.find(tag => tag.id === tagId) as Tag;
    }).filter(Boolean);
  }
  
  // Add to collection and save
  updates.push(newUpdate);
  writeData(INTELLIGENCE_UPDATES_FILE, updates);
  
  return newUpdate;
}

export async function getIntelligenceUpdates(params: {
  category?: string;
  sourceType?: string;
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<IntelligenceUpdate[]> {
  let updates = readData<IntelligenceUpdate[]>(INTELLIGENCE_UPDATES_FILE);
  
  // Filter updates
  if (params.category) {
    updates = updates.filter(update => update.category === params.category);
  }
  
  if (params.sourceType) {
    updates = updates.filter(update => update.sourceType === params.sourceType);
  }
  
  if (params.status) {
    updates = updates.filter(update => update.status === params.status);
  } else {
    updates = updates.filter(update => update.status === 'active');
  }
  
  // Sort by timestamp desc
  updates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Apply pagination
  const offset = params.offset || 0;
  const limit = params.limit || 10;
  
  return updates.slice(offset, offset + limit);
}

export async function getIntelligenceUpdateById(id: number): Promise<IntelligenceUpdate | null> {
  const updates = readData<IntelligenceUpdate[]>(INTELLIGENCE_UPDATES_FILE);
  
  return updates.find(update => update.id === id) || null;
}

export async function updateIntelligenceUpdate(id: number, data: any): Promise<IntelligenceUpdate | null> {
  const updates = readData<IntelligenceUpdate[]>(INTELLIGENCE_UPDATES_FILE);
  
  const index = updates.findIndex(update => update.id === id);
  if (index === -1) return null;
  
  const now = new Date().toISOString();
  updates[index] = {
    ...updates[index],
    ...data,
    updatedAt: now,
    // Handle special cases
    location: data.location || updates[index].location,
    metadata: data.metadata || updates[index].metadata
  };
  
  writeData(INTELLIGENCE_UPDATES_FILE, updates);
  
  return updates[index];
}

export async function deleteIntelligenceUpdate(id: number): Promise<IntelligenceUpdate | null> {
  const updates = readData<IntelligenceUpdate[]>(INTELLIGENCE_UPDATES_FILE);
  
  const index = updates.findIndex(update => update.id === id);
  if (index === -1) return null;
  
  updates[index].status = 'deleted';
  updates[index].updatedAt = new Date().toISOString();
  
  writeData(INTELLIGENCE_UPDATES_FILE, updates);
  
  return updates[index];
}

// Webhook management functions
export async function createWebhook(data: {
  name: string;
  url: string;
  secret: string;
}): Promise<Webhook> {
  const webhooks = readData<Webhook[]>(WEBHOOKS_FILE);
  
  // Generate ID
  const newId = webhooks.length > 0 ? Math.max(...webhooks.map(webhook => webhook.id)) + 1 : 1;
  
  const now = new Date().toISOString();
  const newWebhook: Webhook = {
    id: newId,
    name: data.name,
    url: data.url,
    secret: data.secret,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
  
  webhooks.push(newWebhook);
  writeData(WEBHOOKS_FILE, webhooks);
  
  return newWebhook;
}

export async function getWebhooks(): Promise<Webhook[]> {
  const webhooks = readData<Webhook[]>(WEBHOOKS_FILE);
  
  return webhooks.filter(webhook => webhook.isActive);
}

export async function updateWebhookStatus(id: number, isActive: boolean): Promise<Webhook | null> {
  const webhooks = readData<Webhook[]>(WEBHOOKS_FILE);
  
  const index = webhooks.findIndex(webhook => webhook.id === id);
  if (index === -1) return null;
  
  webhooks[index].isActive = isActive;
  webhooks[index].updatedAt = new Date().toISOString();
  
  writeData(WEBHOOKS_FILE, webhooks);
  
  return webhooks[index];
}

// Tag management functions
export async function createTag(name: string): Promise<Tag> {
  const tags = readData<Tag[]>(TAGS_FILE);
  
  // Check if tag already exists
  const existingTag = tags.find(tag => tag.name === name);
  if (existingTag) return existingTag;
  
  // Generate ID
  const newId = tags.length > 0 ? Math.max(...tags.map(tag => tag.id)) + 1 : 1;
  
  const now = new Date().toISOString();
  const newTag: Tag = {
    id: newId,
    name,
    createdAt: now,
    updatedAt: now
  };
  
  tags.push(newTag);
  writeData(TAGS_FILE, tags);
  
  return newTag;
}

export async function getTags(): Promise<Tag[]> {
  return readData<Tag[]>(TAGS_FILE);
}

export async function addTagToUpdate(updateId: number, tagId: number): Promise<IntelligenceUpdate | null> {
  const updates = readData<IntelligenceUpdate[]>(INTELLIGENCE_UPDATES_FILE);
  const tags = readData<Tag[]>(TAGS_FILE);
  
  const updateIndex = updates.findIndex(update => update.id === updateId);
  if (updateIndex === -1) return null;
  
  const tag = tags.find(tag => tag.id === tagId);
  if (!tag) return null;
  
  // Check if tag is already associated with the update
  if (!updates[updateIndex].tags.some(t => t.id === tagId)) {
    updates[updateIndex].tags.push(tag);
    updates[updateIndex].updatedAt = new Date().toISOString();
    
    writeData(INTELLIGENCE_UPDATES_FILE, updates);
  }
  
  return updates[updateIndex];
}

// Import CSV data function
export async function importCSVData(filePath: string): Promise<number> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found: ${filePath}`);
  }
  
  const csvData = fs.readFileSync(filePath, 'utf8');
  const lines = csvData.split('\n');
  const headers = lines[0].split(',').map((h: string) => h.replace(/"/g, '').trim());
  
  let importedCount = 0;
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map((v: string) => v.replace(/"/g, '').trim());
    const data: any = {};
    
    headers.forEach((header: string, index: number) => {
      if (values[index]) {
        data[header] = values[index];
      }
    });
    
    if (data.title && data.category) {
      // Map CSV fields to our data model
      const now = new Date().toISOString();
      await createIntelligenceUpdate({
        title: data.title,
        category: data.category,
        location: parseCoordinates(data.coordinates),
        date: now,
        time: data.time_filter || 'LIVE',
        source: data.source_name,
        sourceType: data.source_type,
        sourceIcon: getIconForSourceType(data.source_type),
        excerpt: data.description?.substring(0, 100) + '...',
        content: data.description,
        sourceUrl: data.source_link,
        icon: getCategoryIcon(data.category),
        status: 'active'
      });
      
      importedCount++;
    }
  }
  
  return importedCount;
}

// Helper functions
function parseCoordinates(coordsString: string): any {
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

function getIconForSourceType(sourceType: string): string {
  // Map source types to appropriate icons
  const icons: {[key: string]: string} = {
    'VERIFIED': 'shield-check',
    'MEDIA': 'newspaper',
    'ANALYSIS': 'chart-bar',
    'OSINT': 'globe',
    'DEFAULT': 'info-circle'
  };
  
  return icons[sourceType?.toUpperCase()] || icons.DEFAULT;
}

function getCategoryIcon(category: string): string {
  // Map categories to appropriate icons
  const icons: {[key: string]: string} = {
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