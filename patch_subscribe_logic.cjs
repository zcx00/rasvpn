const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetSubscribe = `    if (currentUser && currentUser.telegramId) {
      userSubscriptions.set(String(currentUser.telegramId), currentSubscription);
    }

      res.json({`;

const newSubscribe = `    // Marzban Sync
    if (currentUser && currentUser.telegramId) {
      const marzbanLinks = await syncMarzbanUser(plan, currentUser.telegramId, expireDate);
      if (marzbanLinks.length > 0) {
        currentSubscription.marzbanLinks = marzbanLinks;
      }
      userSubscriptions.set(String(currentUser.telegramId), currentSubscription);
    }

    res.json({`;

code = code.replace(targetSubscribe, newSubscribe);
fs.writeFileSync('server.ts', code);
