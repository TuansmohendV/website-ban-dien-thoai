const fs = require('fs');
let content = fs.readFileSync('../Frontend/src/pages/Admin/ProductManagement.jsx', 'utf8');

// Simple regex to remove comments and strings (might be imperfect but better than nothing)
content = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
content = content.replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '');

let openBraces = 0;
for (let i = 0; i < content.length; i++) {
  if (content[i] === '{') openBraces++;
  if (content[i] === '}') openBraces--;
}

console.log(`Braces: ${openBraces}`);
