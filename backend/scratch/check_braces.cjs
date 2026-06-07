const fs = require('fs');
const content = fs.readFileSync('../Frontend/src/pages/Admin/ProductManagement.jsx', 'utf8');

let openBraces = 0;
let openBrackets = 0;
let openParens = 0;

for (let i = 0; i < content.length; i++) {
  if (content[i] === '{') openBraces++;
  if (content[i] === '}') openBraces--;
  if (content[i] === '[') openBrackets++;
  if (content[i] === ']') openBrackets--;
  if (content[i] === '(') openParens++;
  if (content[i] === ')') openParens--;
}

console.log(`Braces: ${openBraces}`);
console.log(`Brackets: ${openBrackets}`);
console.log(`Parens: ${openParens}`);
