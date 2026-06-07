const fs = require('fs');
let content = fs.readFileSync('../Frontend/src/pages/Admin/ProductManagement.jsx', 'utf8');

// Count <div and </div
let openDivs = (content.match(/<div/g) || []).length;
let closeDivs = (content.match(/<\/div/g) || []).length;

console.log(`Open Divs: ${openDivs}`);
console.log(`Close Divs: ${closeDivs}`);
