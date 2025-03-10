const { spawn } = require('child_process');
const { exit } = require('process');

try {
  console.log('🔧 Running drizzle-kit push...');
  const drizzle = spawn('npx', ['drizzle-kit', 'push:pg'], { stdio: 'inherit' });
  
  drizzle.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Database schema updated successfully');
      
      console.log('🦸‍♂️ Creating debug user...');
      const setupData = spawn('node', ['scripts/setup-data.js'], { stdio: 'inherit' });
      
      setupData.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Debug data created successfully');
          exit(0);
        } else {
          console.error('❌ Error creating debug data');
          exit(1);
        }
      });
    } else {
      console.error('❌ Error updating database schema');
      exit(1);
    }
  });
} catch (error) {
  console.error('❌ Error:', error);
  exit(1);
}