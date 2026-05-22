import fs from 'fs';
import path from 'path';
// Removed dotenv

// Fix ES module imports
import { getLiveCollections } from './src/services/server/themeService.js';

async function updateStaticData() {
  console.log('Fetching live theme collections...');
  try {
    const data = await getLiveCollections();
    
    const output = {
      code: 200,
      status: "success",
      message: "success",
      meta: {
        updatedAt: new Date().toISOString(),
        totalCount: data.length
      },
      data: {
        list: data
      }
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'public', 'data', 'theme-collections.json'),
      JSON.stringify(output, null, 2)
    );
    console.log('Successfully updated theme-collections.json!');
  } catch (error) {
    console.error('Failed to update static data:', error);
  }
}

updateStaticData();
