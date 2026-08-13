const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

const target = `                {marzbanData && marzbanData.users ? (
                  marzbanData.users.map((u: any) => (`;

const replacement = `                {marzbanData && marzbanData.users && Array.isArray(marzbanData.users) ? (
                  marzbanData.users.map((u: any) => (`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
