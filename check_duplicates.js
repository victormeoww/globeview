import fs from 'fs';

// Load data
const data = JSON.parse(fs.readFileSync('data/intelligence-updates.json', 'utf8'));
console.log(`Total intelligence updates: ${data.length}`);

// Check for duplicate IDs
const idMap = new Map();
data.forEach(item => {
  if (!idMap.has(item.id)) {
    idMap.set(item.id, [item]);
  } else {
    idMap.get(item.id).push(item);
  }
});

const duplicateIds = [...idMap.entries()].filter(([id, items]) => items.length > 1);
console.log(`\nDuplicate IDs found: ${duplicateIds.length}`);
duplicateIds.forEach(([id, items]) => {
  console.log(`  ID ${id} appears ${items.length} times`);
  items.forEach((item, i) => {
    console.log(`    ${i+1}. "${item.title}"`);
  });
});

// Check for duplicate titles
const titleMap = new Map();
data.forEach(item => {
  if (!titleMap.has(item.title)) {
    titleMap.set(item.title, [item]);
  } else {
    titleMap.get(item.title).push(item);
  }
});

const duplicateTitles = [...titleMap.entries()].filter(([title, items]) => items.length > 1);
console.log(`\nDuplicate titles found: ${duplicateTitles.length}`);
duplicateTitles.forEach(([title, items]) => {
  console.log(`  "${title}" appears ${items.length} times`);
  items.forEach((item, i) => {
    console.log(`    ${i+1}. ID: ${item.id}`);
  });
}); 