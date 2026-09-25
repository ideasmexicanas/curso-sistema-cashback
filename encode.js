const fs = require('fs');

// Intentional URL encoded password
const pwdWithBrackets = encodeURIComponent('[Va2345rt_@´ñ+.,ñ=)(/!"#]');
const pwdWithoutBrackets = encodeURIComponent('Va2345rt_@´ñ+.,ñ=)(/!"#');

const envContent1 = `DATABASE_URL="postgresql://postgres:${pwdWithBrackets}@db.niarqwxbfixjrywuenbk.supabase.co:5432/postgres?sslmode=require"\n`;
const envContent2 = `DATABASE_URL="postgresql://postgres:${pwdWithoutBrackets}@db.niarqwxbfixjrywuenbk.supabase.co:5432/postgres?sslmode=require"\n`;

console.log("Option 1 (with brackets): ", envContent1);
console.log("Option 2 (without brackets): ", envContent2);

// Let's write the one without brackets first, it's more likely.
fs.writeFileSync('.env', envContent2);
