import fs from 'fs';

// Load data
const data = JSON.parse(fs.readFileSync('data/intelligence-updates.json', 'utf8'));
console.log(`Total intelligence updates: ${data.length}`);

// Common country/location keywords to check against
const locationKeywords = {
  'kenya': { lat: -1.2921, lng: 36.8219 }, // Nairobi
  'mali': { lat: 17.5707, lng: -3.9962 }, // Around Mali
  'turkey': { lat: 38.9637, lng: 35.2433 }, // Turkey center
  'istanbul': { lat: 41.0082, lng: 28.9784 },
  'ankara': { lat: 39.9334, lng: 32.8597 },
  'china': { lat: 35.8617, lng: 104.1954 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'mekong': { lat: 15.1780, lng: 105.7893 }, // Mekong center
  'cambodia': { lat: 12.5657, lng: 104.9910 },
  'laos': { lat: 19.8563, lng: 102.4955 },
  'oman': { lat: 21.4735, lng: 55.9754 },
  'dhofar': { lat: 17.0159, lng: 54.0924 }, // Dhofar, Oman
  'ukraine': { lat: 49.4871, lng: 31.2718 },
  'russia': { lat: 61.5240, lng: 105.3188 },
  'moscow': { lat: 55.7558, lng: 37.6173 },
  'crimea': { lat: 45.3453, lng: 34.4997 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'washington': { lat: 38.9072, lng: -77.0369 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'pacific': { lat: 0, lng: -160 }, // Middle of Pacific
  'south china sea': { lat: 15.2, lng: 117.2 },
  'gao': { lat: 16.2667, lng: -0.0422 } // Gao, Mali
};

// Function to check if coordinates match the mentioned location
function checkLocationAccuracy(item) {
  const title = item.title.toLowerCase();
  const content = item.content ? item.content.toLowerCase() : '';
  const fullText = title + ' ' + content;
  
  let issues = [];
  let matchedKeywords = [];
  
  // Check if any location keywords are in the text
  for (const [keyword, coords] of Object.entries(locationKeywords)) {
    if (fullText.includes(keyword)) {
      matchedKeywords.push(keyword);
      
      // Compare coordinates - allow some margin of error (roughly 500km)
      const latDiff = Math.abs(item.location.lat - coords.lat);
      const lngDiff = Math.abs(item.location.lng - coords.lng);
      
      // Simple distance threshold (approximately ~5 degrees)
      if (latDiff > 5 || lngDiff > 5) {
        // Except for 'pacific' which could be anywhere in a large region
        if (keyword !== 'pacific' || latDiff > 25 || lngDiff > 25) {
          issues.push({
            keyword: keyword,
            expected: coords,
            actual: item.location,
            diff: { lat: latDiff, lng: lngDiff }
          });
        }
      }
    }
  }
  
  return { id: item.id, title: item.title, matchedKeywords, issues };
}

// Check all items
const locationChecks = data.map(checkLocationAccuracy);
const itemsWithLocationIssues = locationChecks.filter(check => check.issues.length > 0);

console.log(`\nItems with potential location coordinate issues: ${itemsWithLocationIssues.length}`);
itemsWithLocationIssues.forEach(item => {
  console.log(`\n  ID ${item.id}: "${item.title}"`);
  console.log(`    Matched keywords: ${item.matchedKeywords.join(', ')}`);
  item.issues.forEach(issue => {
    console.log(`    Issue with "${issue.keyword}": Coordinates [${issue.actual.lat}, ${issue.actual.lng}] don't match expected roughly [${issue.expected.lat}, ${issue.expected.lng}]`);
  });
}); 