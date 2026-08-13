const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetCheckStatus = `  app.post('/api/v1/payment/check-status', (req, res) => {`;
const newCheckStatus = `  app.post('/api/v1/payment/check-status', async (req, res) => {`;
code = code.replace(targetCheckStatus, newCheckStatus);

const targetBody = `    if (currentUser && currentUser.telegramId) {
      userSubscriptions.set(String(currentUser.telegramId), currentSubscription);
    }

      res.json({`;

const newBody = `    // Marzban Sync
    if (currentUser && currentUser.telegramId) {
      const marzbanLinks = await syncMarzbanUser(plan, currentUser.telegramId, newExpire);
      if (marzbanLinks.length > 0) {
        currentSubscription.marzbanLinks = marzbanLinks;
      }
      userSubscriptions.set(String(currentUser.telegramId), currentSubscription);
    }

    res.json({`;

code = code.replace(targetBody, newBody);
fs.writeFileSync('server.ts', code);
