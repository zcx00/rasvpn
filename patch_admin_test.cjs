const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

const targetTest = `  const handleTestMarzban = async () => {
    setIsTestingMarzban(true);
    setMarzbanStatus(null);
    try {
      const res = await fetch('/api/v1/admin/marzban/test', {
        method: 'POST'
      });`;

const newTest = `  const handleTestMarzban = async () => {
    setIsTestingMarzban(true);
    setMarzbanStatus(null);
    try {
      const res = await fetch('/api/v1/admin/marzban/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: marzbanUrl, username: marzbanUser, password: marzbanPass })
      });`;

code = code.replace(targetTest, newTest);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
