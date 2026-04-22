import fs from 'fs';
['d:/vscode/website-ban-dien-thoai/Frontend/src/components/Navbar.jsx', 'd:/vscode/website-ban-dien-thoai/Frontend/src/components/Footer.jsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/blue-600/g, 'yellow-500');
  content = content.replace(/blue-500/g, 'yellow-400');
  content = content.replace(/blue-200/g, 'yellow-200');
  content = content.replace(/purple-600/g, 'orange-500');
  fs.writeFileSync(file, content);
});
console.log('Colors replaced successfully');
