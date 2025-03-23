import path from 'path';
import { importCSVData } from '../lib/db-file';

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