const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetWebhook = `  app.post('/api/v1/payment/webhook', (req, res) => {`;
const newWebhook = `  app.post('/api/v1/payment/webhook', async (req, res) => {`;
code = code.replace(targetWebhook, newWebhook);

const targetWebhookBody = `      currentSubscription = {
        ...currentSubscription,
        planId: plan.id,
        planName: \`Премиум Каскад (\${plan.name})\`,
        startDate: now.toISOString().split('T')[0],
        expireDate: newExpire.toISOString().split('T')[0],
        trafficLimitGb: plan.trafficLimitGb,
        status: 'active',
      };
    }`;
const newWebhookBody = `      currentSubscription = {
        ...currentSubscription,
        planId: plan.id,
        planName: \`Премиум Каскад (\${plan.name})\`,
        startDate: now.toISOString().split('T')[0],
        expireDate: newExpire.toISOString().split('T')[0],
        trafficLimitGb: plan.trafficLimitGb,
        status: 'active',
      };
      
      if (currentUser && currentUser.telegramId) {
        const marzbanLinks = await syncMarzbanUser(plan, currentUser.telegramId, newExpire);
        if (marzbanLinks.length > 0) {
          currentSubscription.marzbanLinks = marzbanLinks;
        }
        userSubscriptions.set(String(currentUser.telegramId), currentSubscription);
      }
    }`;
code = code.replace(targetWebhookBody, newWebhookBody);
fs.writeFileSync('server.ts', code);
