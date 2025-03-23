import fs from 'fs';

// Load data
const data = JSON.parse(fs.readFileSync('data/intelligence-updates.json', 'utf8'));
console.log(`Total intelligence updates before fixing: ${data.length}`);

// 1. Fix duplicates by removing the higher ID duplicates
const uniqueTitles = new Set();
const duplicatesToRemove = [];

// Sort by ID to ensure we keep the lower ID versions
data.sort((a, b) => a.id - b.id);

data.forEach(item => {
  if (uniqueTitles.has(item.title)) {
    duplicatesToRemove.push(item.id);
  } else {
    uniqueTitles.add(item.title);
  }
});

// 2. Fix location coordinates
const locationFixes = [
  { id: 1, title: "Military Exercise in Pacific", location: { lat: 0, lng: -160 } },
  { id: 8, title: "Turkey Threatens to Veto Sweden's NATO Bid Over Extradition Dispute", location: { lat: 39.9334, lng: 32.8597 } }, // Ankara coordinates
  { id: 9, title: "China Unveils Hypersonic Drone Capable of Swarm Coordination", location: { lat: 39.9042, lng: 116.4074 } }, // Beijing coordinates
  { id: 10, title: "Mass Fish Die-Off in Mekong River Triggers Regional Alarm", location: { lat: 15.1780, lng: 105.7893 } }, // Mekong River coordinates
  { id: 14, title: "Major Quantum Computing Breakthrough Achieved in Silicon Valley", location: { lat: 37.4419, lng: -122.143 } }, // Keep Silicon Valley coordinates
  { id: 15, title: "Russian Cyber Attack Disrupts Baltic Energy Grid", location: { lat: 59.4369, lng: 24.7536 } }, // Keep Baltic coordinates
  { id: 17, title: "ASEAN Summit Addresses South China Sea Tensions", location: { lat: 15.2, lng: 117.2 } }, // South China Sea coordinates
  { id: 20, title: "Historic Peace Agreement Signed in Horn of Africa", location: { lat: 11.5886, lng: 43.1458 } }, // Keep Horn of Africa coordinates
  { id: 21, title: "Military Exercises Commence in South China Sea", location: { lat: 15.2, lng: 117.2 } }, // South China Sea coordinates
  { id: 23, title: "Major Oil Discovery in Arctic Triggers Geopolitical Tensions", location: { lat: 78.9241, lng: 11.9277 } }, // Keep Arctic coordinates
  { id: 24, title: "Heavy Fighting Reported in Eastern Ukraine", location: { lat: 50.0049, lng: 36.2314 } }, // Keep Eastern Ukraine coordinates
  { id: 31, title: "Ethnic Clashes Erupt in Myanmar's Shan State", location: { lat: 22.0363, lng: 98.7407 } }, // Keep Shan State coordinates
  { id: 32, title: "Suspected Russian Submarine Activity in North Atlantic", location: { lat: 61.9241, lng: -6.9112 } }, // Keep North Atlantic coordinates
  { id: 39, title: "Saudi Arabia and Israel Normalize Relations", location: { lat: 24.7136, lng: 46.6753 } }, // Keep Saudi coordinates
  { id: 46, title: "Unusual Military Movement Detected in Eastern Mediterranean", location: { lat: 34.6788, lng: 33.0444 } }, // Keep Eastern Mediterranean coordinates
  { id: 50, title: "Major Bank Run in Turkey", location: { lat: 38.9637, lng: 35.2433 } }, // Central Turkey coordinates
  { id: 59, title: "Secret US-China Trade Talks", location: { lat: 39.9042, lng: 116.4074 } }, // Beijing coordinates
  { id: 64, title: "Major Earthquake in Pacific Ring of Fire", location: { lat: -9.6457, lng: 159.9722 } }, // Keep specific Pacific Ring of Fire coordinates
  { id: 75, title: "Clan del Golfo vs Gaitanista Self-Defense Forces War Erupts in Buenaventura", location: { lat: 3.4516, lng: -76.532 } } // Keep Buenaventura coordinates
];

// Apply location fixes
locationFixes.forEach(fix => {
  const index = data.findIndex(item => item.id === fix.id);
  if (index !== -1) {
    console.log(`Fixing location for ID ${fix.id}: "${fix.title}"`);
    console.log(`  Old coordinates: [${data[index].location.lat}, ${data[index].location.lng}]`);
    console.log(`  New coordinates: [${fix.location.lat}, ${fix.location.lng}]`);
    data[index].location = fix.location;
  }
});

// Remove duplicates
const filteredData = data.filter(item => !duplicatesToRemove.includes(item.id));
console.log(`\nRemoved ${data.length - filteredData.length} duplicate entries`);
console.log(`Total intelligence updates after fixing: ${filteredData.length}`);

// Save updated data
const backupPath = 'data/intelligence-updates.backup.json';
fs.writeFileSync(backupPath, fs.readFileSync('data/intelligence-updates.json', 'utf8'));
console.log(`\nBackup created at ${backupPath}`);

fs.writeFileSync('data/intelligence-updates.json', JSON.stringify(filteredData, null, 2));
console.log(`Updated data saved to data/intelligence-updates.json`);

// List removed duplicates
console.log('\nRemoved duplicate entries:');
duplicatesToRemove.forEach(id => {
  const item = data.find(item => item.id === id);
  console.log(`  ID ${id}: "${item.title}"`);
}); 