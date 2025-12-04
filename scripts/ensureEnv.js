const fs = require('fs');
const path = require('path');

const examplePath = path.join(process.cwd(), '.env.example');
const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('.env created from .env.example');
  } else {
    // fallback default
    const defaultEnv = 'MONGO_URI=mongodb://127.0.0.1:27017/ai_study_companion\nPORT=4000\n';
    fs.writeFileSync(envPath, defaultEnv);
    console.log('.env created with default values');
  }
} else {
  console.log('.env already exists');
}
