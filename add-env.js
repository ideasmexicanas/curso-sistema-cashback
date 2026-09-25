const { execSync } = require('child_process');
try {
  execSync('cmd /c vercel env add SMS_MASIVOS_API_KEY production', { 
    input: '4272002b8a218faa777e3fd9b7aac07f40c40cfc', 
    stdio: ['pipe', 'inherit', 'inherit'] 
  });
  console.log("Environment variable added successfully.");
} catch (e) {
  console.error(e.message);
}
