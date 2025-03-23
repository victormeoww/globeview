import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    // Get the URL parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const category = url.searchParams.get('category');
    const sourceType = url.searchParams.get('sourceType');
    
    // Read the updates from the JSON file
    const filePath = path.join(process.cwd(), 'data', 'intelligence-updates.json');
    let updates = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Filter by status (only active updates)
    updates = updates.filter((update: any) => update.status === 'active');
    
    // Apply category filter if provided
    if (category) {
      updates = updates.filter((update: any) => 
        update.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply sourceType filter if provided
    if (sourceType) {
      updates = updates.filter((update: any) => 
        update.sourceType.toLowerCase() === sourceType.toLowerCase()
      );
    }
    
    // Simplify the approach - just get a diverse mix of updates
    // Randomize the order for variety
    updates = updates.sort(() => 0.5 - Math.random());
    
    // Create a diverse mix by grouping by category first
    const categoryMap: {[key: string]: any[]} = {};
    
    // Group updates by category
    updates.forEach((update: any) => {
      const category = update.category.toLowerCase();
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      categoryMap[category].push(update);
    });
    
    // Take updates from each category to create a diverse set
    const mixedUpdates: any[] = [];
    const categories = Object.keys(categoryMap);
    
    // Calculate how many items to take from each category
    const itemsPerCategory = Math.max(1, Math.ceil(limit / categories.length));
    
    // Take items from each category
    categories.forEach(category => {
      const categoryUpdates = categoryMap[category];
      const toTake = Math.min(itemsPerCategory, categoryUpdates.length);
      
      // Take random updates from this category
      const selectedUpdates = categoryUpdates
        .sort(() => 0.5 - Math.random())
        .slice(0, toTake);
      
      mixedUpdates.push(...selectedUpdates);
    });
    
    // Randomize again and limit to the requested number
    const finalUpdates = mixedUpdates
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
    
    return NextResponse.json(finalUpdates);
  } catch (error) {
    console.error('Error fetching intelligence updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intelligence updates' },
      { status: 500 }
    );
  }
} 