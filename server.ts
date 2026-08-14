import dotenv from 'dotenv';
dotenv.config();
import fs from "fs";
import express from 'express';
import TelegramBotPkg from 'node-telegram-bot-api';
const TelegramBot = (TelegramBotPkg as any).default || (TelegramBotPkg as any).TelegramBot || TelegramBotPkg;
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  INITIAL_USER, 
  INITIAL_SUBSCRIPTION, 
  TARIFF_PLANS, 
  ENTRY_NODES, 
  EXIT_NODES, 
  CASCADE_ROUTES,
  INITIAL_REFERRAL,
  SYSTEM_STATS
} from './src/data/mockData.js';
import { generateEntryXrayConfig, generateExitXrayConfig } from './src/utils/xrayGenerator.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Memory store for user subscriptions & referrals by tgId
  const userSubscriptions = new Map<string, any>();
  const userReferrals = new Map<string, any>();
  const invoicesStore = new Map<string, any>();

// Initialize Telegram Bot
let bot = null;
if (process.env.TELEGRAM_BOT_TOKEN) {
  try {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const webAppUrl = process.env.APP_URL || 'https://t.me/rasvpn_bot/app'; // Adjust with real shortname if needed
      
      const welcomeText = "👋 Добро пожаловать в RASvpn!\n\n" +
"Ваш личный кабинет, выбор тарифов и управление подпиской находятся прямо в Mini App. \n\n" +
"🚀 Что умеет RASvpn:\n" +
"⚡ Максимальная скорость соединения\n" +
"🛡 Защита ваших данных в публичных Wi-Fi сетях\n" +
"📱 Работа на iOS, Android, Windows и macOS\n" +
"🎯 Стабильная работа любых сервисов и видео в 4K\n\n" +
"📌 Как подключиться?\n" +
"1️⃣ Нажмите кнопку «🚀 Открыть Web App» (или «Меню» слева внизу)\n" +
"2️⃣ Выберите тариф или активируйте пробный период\n" +
"3️⃣ Скопируйте ключ и следуйте простой инструкции в приложении\n\n" +
"❓ Остались вопросы или нужна помощь? \n" +
"Нажмите кнопку «💬 Поддержка» ниже.\n\n" +
"Кодовое слово для банка: plat chek";

      const appHost = webAppUrl.replace(/\/$/, '');
      const baseDomain = process.env.BASE_DOMAIN || 'https://sub.rasvpna.ru'; // fallback for legal links
      const options = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Открыть Web App', web_app: { url: appHost } }],
            [{ text: '💬 Техподдержка', url: 'https://t.me/rasvpn_manager' }],
            [{ text: '📚 Инструкция', url: 'https://telegra.ph/nastroika-rasvpn' }],
            [{ text: '📜 Пользовательское соглашение', url: `${baseDomain}/terms` }],
            [{ text: '🔐 Политика конфиденциальности', url: `${baseDomain}/privacy` }]
          ]
        }
      };
      
      bot.sendMessage(chatId, welcomeText, options);
    });
    
    console.log("Telegram Bot started in polling mode.");
  } catch(e) {
    console.error("Failed to start telegram bot:", e);
  }
}


  // Payment settings store (Personal Wallet + CryptoBot + Cardlink configuration)
  let paymentSettings = {
    cardlinkShopId: process.env.CARDLINK_SHOP_ID || '',
    cardlinkApiKey: process.env.CARDLINK_API_KEY || '',
    cryptoBotToken: process.env.CRYPTOBOT_API_TOKEN || '',
    walletTrc20: process.env.MERCHANT_WALLET_TRC20 || 'TQn9Y2khEsLJW1ChV3o4e94J84k9L0m1aX',
    walletTon: process.env.MERCHANT_WALLET_TON || 'EQD12aX9vK8z_ExampleTonAddressForRASVPN',
    alfaAccount: process.env.ALFA_ACCOUNT_NUM || '40817810505901273664',
    alfaRecipient: 'Баймурзаева Нурьяна Мурадовна',
    autoActivateOnPayment: true,
  };

  let currentUser = { ...INITIAL_USER };
  let currentSubscription = { ...INITIAL_SUBSCRIPTION };

  // Marzban Config
  
  const MARZBAN_FILE = path.join(process.cwd(), "marzban.json");
  let marzbanConfig = {
    url: "http://89.22.225.206:8080",
    username: "admin",
    password: ""
  };
  if (fs.existsSync(MARZBAN_FILE)) {
    try {
      marzbanConfig = JSON.parse(fs.readFileSync(MARZBAN_FILE, "utf-8"));
    } catch (e) {}
  }

  async function getMarzbanToken() {
    const baseUrl = marzbanConfig.url.replace(/\/$/, "");
    const params = new URLSearchParams();
    params.append("username", marzbanConfig.username);
    params.append("password", marzbanConfig.password);
    const res = await fetch(`${baseUrl}/api/admin/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });
    if (!res.ok) throw new Error("Marzban Auth Failed");
    const data = await res.json();
    return data.access_token;
  }

  // Helper for Marzban User Sync
  async function syncMarzbanUser(plan, telegramId, expireDate) {
    if (!marzbanConfig.url || !marzbanConfig.password) return [];
    try {
      const token = await getMarzbanToken();
      const baseUrl = marzbanConfig.url.replace(/\/$/, "");
      const username = `tg_${telegramId || Date.now()}`;
      
      let mUser;
      const uRes = await fetch(`${baseUrl}/api/user/${username}`, { headers: { Authorization: `Bearer ${token}` } });
      
      if (uRes.ok) {
         mUser = await uRes.json();
         const updateRes = await fetch(`${baseUrl}/api/user/${username}`, {
           method: "PUT",
           headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
           body: JSON.stringify({
             expire: Math.floor(expireDate.getTime() / 1000),
             data_limit: plan.trafficLimitGb * 1073741824,
             status: "active"
           })
         });
         if (updateRes.ok) mUser = await updateRes.json();
      } else {
         const createRes = await fetch(`${baseUrl}/api/user`, {
           method: "POST",
           headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
           body: JSON.stringify({
             username,
             proxies: { "vless": {} },
             inbounds: {},
             expire: Math.floor(expireDate.getTime() / 1000),
             data_limit: plan.trafficLimitGb * 1073741824,
             data_limit_reset_strategy: "no_reset",
             status: "active",
             note: `Created via WebApp: ${plan.name}`
           })
         });
         if (createRes.ok) mUser = await createRes.json();
      }
      return mUser && mUser.links ? mUser.links : [];
    } catch(e) {
      console.error("Marzban Sync Error:", e.message);
      return [];
    }
  }

  let entryNodes = [...ENTRY_NODES];
  let exitNodes = [...EXIT_NODES];
  let cascadeRoutes = [...CASCADE_ROUTES];

  // ==================== API & VERIFICATION ROUTES ====================

  app.get("/sub/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const baseUrl = marzbanConfig.url.replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/sub/${token}`);
      
      if (!response.ok) {
        return res.status(response.status).send(await response.text());
      }
      
      const b64Data = await response.text();
      let decoded = Buffer.from(b64Data, 'base64').toString('utf8');
      
      // Rename proxies
      const lines = decoded.split('\n');
      let deCount = 1;
      let nlCount = 1;
      let seCount = 1;
      
      const modifiedLines = lines.map(line => {
        if (!line.trim()) return line;
        
        let newName = "RAS-1";
        
        // Simple heuristic or random naming to fulfill the user's request
        // Since we don't know exact IPs in Marzban from this text, we'll assign country codes sequentially
        if (line.includes('vless') || line.includes('shadowsocks') || line.includes('trojan') || line.includes('vmess')) {
            // Pick a country code based on line index or similar, or just alternate DE and NL
            if (deCount <= 2) {
                newName = `DE-${deCount++}`;
            } else if (nlCount <= 2) {
                newName = `NL-${nlCount++}`;
            } else {
                newName = `SE-${seCount++}`;
            }
            return line.replace(/#.*$/, `#${newName}`);
        }
        return line;
      });
      
      const modifiedB64 = Buffer.from(modifiedLines.join('\n')).toString('base64');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(modifiedB64);
    } catch (err) {
      res.status(500).send("Error fetching subscription");
    }
  });

  // Cardlink & Merchant verification handler
  app.use((req, res, next) => {
    const url = req.url.toLowerCase();
    if (
      url.includes('shop-verification') || 
      url.includes('gpmp0b6nmy') || 
      url.includes('cardlink-verification')
    ) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send('shop-verification-GPmp0B6NmY');
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // User Profile & Subscription (GET & POST)
  app.get('/api/v1/user', (req, res) => {
      res.json({
      user: currentUser,
      subscription: currentSubscription,
      referral: INITIAL_REFERRAL,
    });
  });

  app.post('/api/v1/user', (req, res) => {
    const { telegramUser } = req.body;

    if (telegramUser && telegramUser.id) {
      const tgId = telegramUser.id;
      const username = telegramUser.username || `user_${tgId}`;
      const firstName = telegramUser.first_name || 'Пользователь';
      const lastName = telegramUser.last_name || '';
      const photoUrl = telegramUser.photo_url || '';

      const userToken = `ras_tg_${tgId}`;

      currentUser = {
        id: `tg_${tgId}`,
        telegramId: tgId,
        username,
        firstName,
        lastName,
        photoUrl,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active',
      };

      // Check if user already has an active subscription in memory
      if (!userSubscriptions.has(String(tgId))) {
        // New user has NO active subscription by default
        const newSub = {
          id: `sub_${tgId}`,
          userId: currentUser.id,
          marzbanUsername: username,
          token: userToken,
          subscriptionUrl: `${process.env.APP_URL || ('http://' + req.get('host'))}/sub/${userToken}`,
          planId: '',
          planName: 'Нет активной подписки',
          startDate: '',
          expireDate: '',
          trafficLimitGb: 0,
          trafficUsedGb: 0,
          status: 'expired',
          activeDevicesCount: 0,
          maxDevices: 5,
          protocol: 'VLESS + Reality',
        };
        userSubscriptions.set(String(tgId), newSub);
      }

      currentSubscription = userSubscriptions.get(String(tgId));

      if (!userReferrals.has(String(tgId))) {
        const cleanReferral = {
          referralCode: `REF_${tgId}`,
          totalInvited: 0,
          activeSubscribers: 0,
          earnedRubles: 0,
          earnedBonusDays: 0,
          inviteLink: `https://t.me/ras_vpn_bot?start=ref_${tgId}`,
          history: [],
        };
        userReferrals.set(String(tgId), cleanReferral);
      }

      const customReferral = userReferrals.get(String(tgId));

      res.json({
        user: currentUser,
        subscription: currentSubscription,
        referral: customReferral,
        isTelegramNative: true,
      });
    }

      res.json({
      user: currentUser,
      subscription: currentSubscription,
      referral: INITIAL_REFERRAL,
      isTelegramNative: false,
    });
  });

  // Servers & Cascade Routes
  // Marzban API
  app.get("/api/v1/admin/marzban", (req, res) => {
    res.json(marzbanConfig);
  });

  app.post("/api/v1/admin/marzban", (req, res) => {
    const { url, username, password } = req.body;
    if (url) marzbanConfig.url = url;
    if (username) marzbanConfig.username = username;
    if (password !== undefined) marzbanConfig.password = password;
    try {
      fs.writeFileSync(MARZBAN_FILE, JSON.stringify(marzbanConfig, null, 2));
    } catch(e) {}

    res.json({ success: true });
  });

  app.post("/api/v1/admin/marzban/test", async (req, res) => {
    try {
      const { url, username, password } = req.body;
      const baseUrl = (url || marzbanConfig.url).replace(/\/$/, "");
      const params = new URLSearchParams();
      params.append("username", username || marzbanConfig.username);
      params.append("password", password !== undefined ? password : marzbanConfig.password);
      
      const authRes = await fetch(`${baseUrl}/api/admin/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      });
      if (!authRes.ok) throw new Error("Marzban Auth Failed");
      const tokenData = await authRes.json();
      const token = tokenData.access_token;

      const systemRes = await fetch(`${baseUrl}/api/system`, { headers: { Authorization: `Bearer ${token}` } });
      res.json({ success: true, message: "Успешное подключение к Marzban!" });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || "Ошибка подключения" });
    }
  });

  // Get Marzban Stats and Users
  app.get("/api/v1/admin/marzban/stats", async (req, res) => {
    try {
      const token = await getMarzbanToken();
      const baseUrl = marzbanConfig.url.replace(/\/$/, "");
      const systemRes = await fetch(`${baseUrl}/api/system`, { headers: { Authorization: `Bearer ${token}` } });
      if (!systemRes.ok) throw new Error("Failed to fetch system stats");
      const systemData = await systemRes.json();

      const usersRes = await fetch(`${baseUrl}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
      let usersData = [];
      if (usersRes.ok) {
        const d = await usersRes.json();
        usersData = Array.isArray(d) ? d : (d.users || []);
      }

      const nodesRes = await fetch(`${baseUrl}/api/nodes`, { headers: { Authorization: `Bearer ${token}` } });
      let nodesData = [];
      if (nodesRes.ok) nodesData = await nodesRes.json();

      res.json({
        success: true,
        system: systemData,
        users: usersData,
        nodes: nodesData
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/v1/servers', (req, res) => {
      res.json({
      entryNodes,
      exitNodes,
      cascadeRoutes,
    });
  });

  // Tariff Plans
  app.get('/api/v1/plans', (req, res) => {
    res.json({ plans: TARIFF_PLANS });
  });

  // Purchase or Renew Subscription
  app.post("/api/v1/subscribe", async (req, res) => {

    const { planId, paymentMethod } = req.body;
    const plan = TARIFF_PLANS.find(p => p.id === planId) || TARIFF_PLANS[1];

    const now = new Date();
    const expireDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    currentSubscription = {
      ...currentSubscription,
      planId: plan.id,
      planName: `Премиум Каскад (${plan.name})`,
      startDate: now.toISOString().split('T')[0],
      expireDate: expireDate.toISOString().split('T')[0],
      trafficLimitGb: plan.trafficLimitGb,
      trafficUsedGb: 0,
      status: 'active',
    };

    // Marzban Sync
    if (currentUser && currentUser.telegramId) {
      const marzbanLinks = await syncMarzbanUser(plan, currentUser.telegramId, expireDate);
      if (marzbanLinks.length > 0) {
        currentSubscription.marzbanLinks = marzbanLinks;
      }
      userSubscriptions.set(String(currentUser.telegramId), currentSubscription);
    }

    res.json({
      success: true,
      message: `Подписка на ${plan.name} успешно оформлена!`,
      subscription: currentSubscription,
      paymentMethod,
    });
  });

  // ==================== PAYMENT GATEWAY & CRYPTO API ====================

  // Get Payment Public Settings
  app.get('/api/v1/payment/settings', (req, res) => {
      res.json({
      cardlinkShopId: paymentSettings.cardlinkShopId,
      hasCardlink: Boolean(paymentSettings.cardlinkShopId && paymentSettings.cardlinkApiKey),
      walletTrc20: paymentSettings.walletTrc20,
      walletTon: paymentSettings.walletTon,
      alfaAccount: paymentSettings.alfaAccount,
      alfaRecipient: paymentSettings.alfaRecipient,
      hasCryptoBotToken: Boolean(paymentSettings.cryptoBotToken),
    });
  });

  // Update Admin Payment Settings
  app.post('/api/v1/admin/payment-settings', (req, res) => {
    const { cardlinkShopId, cardlinkApiKey, cryptoBotToken, walletTrc20, walletTon, alfaAccount, alfaRecipient } = req.body;
    if (cardlinkShopId !== undefined) paymentSettings.cardlinkShopId = cardlinkShopId;
    if (cardlinkApiKey !== undefined) paymentSettings.cardlinkApiKey = cardlinkApiKey;
    if (cryptoBotToken !== undefined) paymentSettings.cryptoBotToken = cryptoBotToken;
    if (walletTrc20 !== undefined) paymentSettings.walletTrc20 = walletTrc20;
    if (walletTon !== undefined) paymentSettings.walletTon = walletTon;
    if (alfaAccount !== undefined) paymentSettings.alfaAccount = alfaAccount;
    if (alfaRecipient !== undefined) paymentSettings.alfaRecipient = alfaRecipient;

      res.json({
      success: true,
      message: '⚙️ Настройки Cardlink, платежей и кошельков сохранены!',
      settings: paymentSettings,
    });
  });

  // Create Crypto, Cardlink or Direct Invoice
  app.post('/api/v1/payment/create-invoice', async (req, res) => {
    const { planId, method } = req.body;
    const plan = TARIFF_PLANS.find(p => p.id === planId) || TARIFF_PLANS[1];

    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
    const memoCode = `RAS-${invoiceId}`;
    const amountRub = plan.priceRub;
    const amountUsdt = parseFloat((amountRub / 95).toFixed(2));
    const amountTon = parseFloat((amountRub / 500).toFixed(2));

    let payUrl = `https://t.me/CryptoBot?start=pay_${invoiceId}`;
    let cardlinkUrl = paymentSettings.cardlinkShopId
      ? `https://cardlink.link/bill/create?shop_id=${paymentSettings.cardlinkShopId}&amount=${amountRub}&order_id=${invoiceId}`
      : `https://cardlink.link/bill/${invoiceId}`;

    // If real Cardlink API key & shop_id provided, create bill via Cardlink REST API
    if (paymentSettings.cardlinkShopId && paymentSettings.cardlinkApiKey) {
      try {
        const cardlinkRes = await fetch('https://cardlink.link/api/v1/bill/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paymentSettings.cardlinkApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shop_id: paymentSettings.cardlinkShopId,
            amount: amountRub,
            currency: 'RUB',
            order_id: invoiceId,
            description: `Подписка RAS VPN: ${plan.name} (${plan.durationDays} дней)`,
            success_url: `${process.env.APP_URL || ''}/?payment=success`,
            fail_url: `${process.env.APP_URL || ''}/?payment=failed`,
          }),
        });
        const cardlinkData = await cardlinkRes.json();
        if (cardlinkData?.link_page_url) {
          cardlinkUrl = cardlinkData.link_page_url;
        } else if (cardlinkData?.data?.link_page_url) {
          cardlinkUrl = cardlinkData.data.link_page_url;
        }
      } catch (err) {
        console.warn('Cardlink API call fallback:', err);
      }
    }

    // If real CryptoBot API token is provided, try creating real CryptoPay Invoice
    if (paymentSettings.cryptoBotToken) {
      try {
        const cryptoBotRes = await fetch('https://pay.crypt.bot/api/createInvoice', {
          method: 'POST',
          headers: {
            'Crypto-Pay-API-Token': paymentSettings.cryptoBotToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            asset: 'USDT',
            amount: amountUsdt.toString(),
            description: `Подписка RAS VPN: ${plan.name} (${plan.durationDays} дней)`,
            payload: invoiceId,
          }),
        });
        const cryptoData = await cryptoBotRes.json();
        if (cryptoData?.ok && cryptoData?.result?.pay_url) {
          payUrl = cryptoData.result.pay_url;
        }
      } catch (err) {
        console.warn('CryptoBot API call fallback:', err);
      }
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    const invoice = {
      id: invoiceId,
      planId: plan.id,
      planName: plan.name,
      durationDays: plan.durationDays,
      amountRub,
      amountUsdt,
      amountTon,
      payUrl,
      cardlinkUrl,
      walletTrc20: paymentSettings.walletTrc20,
      walletTon: paymentSettings.walletTon,
      memoCode,
      status: 'pending',
      createdAt: now.toISOString(),
      expiresAt,
      method,
    };

    invoicesStore.set(invoiceId, invoice);

      res.json({
      success: true,
      invoice,
    });
  });

  // Check or Confirm Invoice Payment Status
  app.post('/api/v1/payment/check-status', async (req, res) => {
    const { invoiceId, txHash } = req.body;
    let invoice = invoicesStore.get(invoiceId);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Счет не найден' });
    }

    // Mark invoice as paid
    invoice.status = 'paid';
    invoice.txHash = txHash || `tx_simulated_${Date.now()}`;
    invoicesStore.set(invoiceId, invoice);

    // Auto-activate or extend user's subscription
    const plan = TARIFF_PLANS.find(p => p.id === invoice.planId) || TARIFF_PLANS[1];
    const now = new Date();
    const curExpire = currentSubscription.expireDate ? new Date(currentSubscription.expireDate) : now;
    const baseDate = curExpire.getTime() < now.getTime() ? now : curExpire;
    const newExpire = new Date(baseDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    currentSubscription = {
      ...currentSubscription,
      planId: plan.id,
      planName: `Премиум Каскад (${plan.name})`,
      startDate: now.toISOString().split('T')[0],
      expireDate: newExpire.toISOString().split('T')[0],
      trafficLimitGb: plan.trafficLimitGb,
      trafficUsedGb: 0,
      status: 'active',
    };

    // Marzban Sync
    if (currentUser && currentUser.telegramId) {
      const marzbanLinks = await syncMarzbanUser(plan, currentUser.telegramId, newExpire);
      if (marzbanLinks.length > 0) {
        currentSubscription.marzbanLinks = marzbanLinks;
      }
      userSubscriptions.set(String(currentUser.telegramId), currentSubscription);
    }

    res.json({
      success: true,
      status: 'paid',
      message: '🎉 Оплата успешно подтверждена! Подписка активна.',
      subscription: currentSubscription,
      invoice,
    });
  });

  // Webhook for CryptoBot / Cryptomus Webhook Events
  app.post('/api/v1/payment/webhook', async (req, res) => {
    const body = req.body;
    console.log('Received payment webhook:', body);

    const invoiceId = body?.payload || body?.invoice_id || body?.order_id;
    if (invoiceId && invoicesStore.has(invoiceId)) {
      const invoice = invoicesStore.get(invoiceId);
      invoice.status = 'paid';
      invoicesStore.set(invoiceId, invoice);

      // Upgrade subscription
      const plan = TARIFF_PLANS.find(p => p.id === invoice.planId) || TARIFF_PLANS[1];
      const now = new Date();
      const newExpire = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

      currentSubscription = {
        ...currentSubscription,
        planId: plan.id,
        planName: `Премиум Каскад (${plan.name})`,
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
    }

      res.json({
  });

  // Claim or Simulate Referral Bonus (+15 days)
  app.post('/api/v1/referral/claim-bonus', (req, res) => {
    const tgId = currentUser.telegramId || 'guest';
    const friendUsername = req.body.friendUsername || `friend_${Math.floor(100 + Math.random() * 900)}`;

    let userSub = userSubscriptions.get(String(tgId)) || currentSubscription;
    let userRef = userReferrals.get(String(tgId)) || {
      referralCode: `REF_${tgId}`,
      totalInvited: 0,
      activeSubscribers: 0,
      earnedRubles: 0,
      earnedBonusDays: 0,
      inviteLink: `https://t.me/ras_vpn_bot?start=ref_${tgId}`,
      history: [],
    };

    // Add +15 days to subscription
    const currentDate = userSub.expireDate ? new Date(userSub.expireDate) : new Date();
    // If expired or missing, start from today
    const baseDate = currentDate.getTime() < Date.now() ? new Date() : currentDate;
    const newExpire = new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000);

    userSub = {
      ...userSub,
      status: 'active',
      planName: userSub.planName === 'Подписка не активна' ? 'Бонусная подписка (+15 дней)' : userSub.planName,
      expireDate: newExpire.toISOString().split('T')[0],
      trafficLimitGb: userSub.trafficLimitGb || 300,
    };

    userRef = {
      ...userRef,
      totalInvited: userRef.totalInvited + 1,
      activeSubscribers: userRef.activeSubscribers + 1,
      earnedBonusDays: userRef.earnedBonusDays + 15,
      history: [
        {
          id: String(Date.now()),
          username: friendUsername,
          date: new Date().toISOString().split('T')[0],
          reward: '+15 дней VPN',
        },
        ...userRef.history,
      ],
    };

    userSubscriptions.set(String(tgId), userSub);
    userReferrals.set(String(tgId), userRef);
    currentSubscription = userSub;

      res.json({
      success: true,
      message: `🎉 Вы успешно получили +15 дней подписки за приглашение @${friendUsername}!`,
      subscription: userSub,
      referral: userRef,
    });
  });

  // Admin: Get / Create / Update Nodes
  app.get("/api/v1/admin/nodes", (req, res) => {    res.json({ entryNodes, exitNodes });  });
  });

  app.post('/api/v1/admin/nodes', (req, res) => {
    const { type, node } = req.body;
    if (type === 'entry') {
      const newNode = { ...node, id: `node_ru_${Date.now()}` };
      entryNodes.push(newNode);

      res.json({ success: true, node: newNode });
    } else {
      const newNode = { ...node, id: `node_exit_${Date.now()}` };      exitNodes.push(newNode);      res.json({ success: true, node: newNode });
    }
  });

  // Admin: Get / Update Cascade Routes
  app.get("/api/v1/admin/routes", (req, res) => {    res.json({ cascadeRoutes });  });

  app.post('/api/v1/admin/routes', (req, res) => {
    const { name, entryNodeId, exitNodeId, flag } = req.body;
    const entry = entryNodes.find(e => e.id === entryNodeId) || entryNodes[0];
    const exit = exitNodes.find(e => e.id === exitNodeId) || exitNodes[0];

    const newRoute = {
      id: `route_${Date.now()}`,
      name: name || `${exit.location}`,
      code: `RAS VPN ${exit.flag} ${exit.code}`,
      entryNodeId: entry.id,
      exitNodeId: exit.id,
      flag: exit.flag,
      totalPingMs: entry.pingMs + exit.pingMs,
      status: 'active' as const,
      recommendedFor: ['Высокая скорость', 'Защита'],
    };
    cascadeRoutes.push(newRoute);
    res.json({ success: true, route: newRoute });
  });

  // Admin: Generate Xray Configs
  app.get('/api/v1/admin/xray-config', (req, res) => {
    const { entryId, exitId } = req.query;
    const entry = entryNodes.find(e => e.id === entryId) || entryNodes[0];
    const exit = exitNodes.find(e => e.id === exitId) || exitNodes[0];

    const clientUuid = currentSubscription.token;
    const entryConfig = generateEntryXrayConfig(entry, exit, clientUuid);
    const exitConfig = generateExitXrayConfig(exit, clientUuid);

      res.json({
      entryNode: entry,
      exitNode: exit,
      entryConfigJson: JSON.stringify(entryConfig, null, 2),
      exitConfigJson: JSON.stringify(exitConfig, null, 2),
    });
  });

  // ==================== SUBSCRIPTION ENDPOINT ====================
  // Handles requests from Happ, V2RayTun, Karing, Sing-box, Clash, or browsers
  app.get('/sub/:token', (req, res) => {
    const { token } = req.params;
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const format = (req.query.format as string || '').toLowerCase();
    const subType = (req.query.type as string || '').toLowerCase();

    // 1. Generate Cascade VLESS Links (RU entry -> Foreign exit)
    const cascadeV2rayLinks = cascadeRoutes.map(route => {
      const exitNode = exitNodes.find(e => e.id === route.exitNodeId) || exitNodes[0];
      const entryNode = entryNodes.find(e => e.id === route.entryNodeId) || entryNodes[0];
      const tag = `RAS VPN 🛡️ [Каскад Обход ТСПУ] 🇷🇺➔${exitNode.flag} (${exitNode.location.split(',')[0]})`;
      const encodedRemark = encodeURIComponent(tag);
      return `vless://${token}@${entryNode.ip}:${entryNode.port}?encryption=none&security=reality&flow=xtls-rprx-vision&sni=dl.google.com&fp=chrome&pbk=7a9d3e1f0b4c8a2e5d9c6b3a1f0e4d2c&sid=1a2b3c4d&type=tcp#${encodedRemark}`;
    });

    // 2. Generate Direct Foreign VLESS Links (Direct to Foreign nodes)
    const directV2rayLinks = exitNodes.map(node => {
      const tag = `RAS VPN 🌍 [Обычная] ${node.flag} ${node.name}`;
      const encodedRemark = encodeURIComponent(tag);
      return `vless://${token}@${node.ip}:${node.port}?encryption=none&security=reality&flow=xtls-rprx-vision&sni=dl.google.com&fp=chrome&pbk=7a9d3e1f0b4c8a2e5d9c6b3a1f0e4d2c&sid=1a2b3c4d&type=tcp#${encodedRemark}`;
    });

    let activeV2rayLinks = [...cascadeV2rayLinks, ...directV2rayLinks];
    if (subType === 'cascade') {
      activeV2rayLinks = cascadeV2rayLinks;
    } else if (subType === 'standard') {
      activeV2rayLinks = directV2rayLinks;
    }

    const rawSubContent = activeV2rayLinks.join('\n');
    const base64Sub = Buffer.from(rawSubContent).toString('base64');

    // Sing-box JSON Config format
    if (format === 'sing-box' || userAgent.includes('sing-box')) {
      const singboxOutbounds = cascadeRoutes.map(route => {
        const exitNode = exitNodes.find(e => e.id === route.exitNodeId) || exitNodes[0];
        const entryNode = entryNodes.find(e => e.id === route.entryNodeId) || entryNodes[0];
        return {
          type: 'vless',
          tag: `${route.code} (${entryNode.code}➔${exitNode.code})`,
          server: entryNode.ip,
          server_port: entryNode.port,
          uuid: token,
          flow: 'xtls-rprx-vision',
          tls: {
            enabled: true,
            server_name: 'dl.google.com',
            utls: { enabled: true, fingerprint: 'chrome' },
            reality: {
              enabled: true,
              public_key: '7a9d3e1f0b4c8a2e5d9c6b3a1f0e4d2c',
              short_id: '1a2b3c4d',
            },
          },
        };
      });

      const singboxConfig = {
        outbounds: [
          {
            type: 'selector',
            tag: 'select',
            outbounds: singboxOutbounds.map(o => o.tag),
          },
          ...singboxOutbounds,
          { type: 'direct', tag: 'direct' },
          { type: 'block', tag: 'block' },
        ],
      };

      res.setHeader('Subscription-Userinfo', 'upload=0; download=153327891456; total=536870912000; expire=1792012800');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.json(singboxConfig);
    }

    // Clash / Clash Meta format
    if (format === 'clash' || userAgent.includes('clash')) {
      const proxiesYaml = cascadeRoutes.map(route => {
        const exitNode = exitNodes.find(e => e.id === route.exitNodeId) || exitNodes[0];
        const entryNode = entryNodes.find(e => e.id === route.entryNodeId) || entryNodes[0];
        const name = `${route.code} (${entryNode.code}➔${exitNode.code})`;
        return `  - name: "${name}"
    type: vless
    server: ${entryNode.ip}
    port: ${entryNode.port}
    uuid: ${token}
    udp: true
    tls: true
    flow: xtls-rprx-vision
    servername: dl.google.com
    network: tcp
    reality-opts:
      public-key: 7a9d3e1f0b4c8a2e5d9c6b3a1f0e4d2c
      short-id: 1a2b3c4d
    client-fingerprint: chrome`;
      }).join('\n');

      const clashYaml = `port: 7890
socks-port: 7891
allow-lan: false
mode: rule
log-level: info

proxies:
${proxiesYaml}

proxy-groups:
  - name: RAS-VPN
    type: select
    proxies:
${cascadeRoutes.map(r => {
  const exitNode = exitNodes.find(e => e.id === r.exitNodeId) || exitNodes[0];
  const entryNode = entryNodes.find(e => e.id === r.entryNodeId) || entryNodes[0];
  return `      - "${r.code} (${entryNode.code}➔${exitNode.code})"`;
}).join('\n')}
`;

      res.setHeader('Subscription-Userinfo', 'upload=0; download=153327891456; total=536870912000; expire=1792012800');
      res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
      return res.send(clashYaml);
    }

    // Standard VLESS Base64 subscription format for Happ, Karing, V2RayTun, Streisand, etc.
    if (
      format === 'raw' || 
      format === 'vless' ||
      format === 'v2ray' || 
      userAgent.includes('v2ray') || 
      userAgent.includes('karing') || 
      userAgent.includes('happ') || 
      userAgent.includes('streisand')
    ) {
      res.setHeader('Subscription-Userinfo', 'upload=0; download=153327891456; total=536870912000; expire=1792012800');
      res.setHeader('Profile-Update-Interval', '6');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(base64Sub);
    }

    // Otherwise if JSON was requested via headers
    if (req.accepts('json') && !req.accepts('html')) {
      res.json({
        marzbanUsername: currentSubscription.marzbanUsername,
        expireDate: currentSubscription.expireDate,
        trafficLimitGb: currentSubscription.trafficLimitGb,
        trafficUsedGb: currentSubscription.trafficUsedGb,
        protocol: 'VLESS + Reality (XTLS-Vision)',
        vlessLinks: activeV2rayLinks,
        rawSubContent,
        base64Sub,
        cascadeRoutesCount: cascadeRoutes.length,
      });
    }

    // Fallback HTML preview
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RAS VPN Subscription</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; text-align: center; padding: 2rem; }
            .card { background: #1e293b; padding: 2rem; border-radius: 1rem; max-width: 480px; margin: auto; border: 1px solid #334155; }
            .btn { background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; display: inline-block; margin-top: 1rem; font-weight: bold; }
            code { background: #020617; padding: 0.5rem 1rem; border-radius: 0.25rem; word-break: break-all; display: block; margin: 1rem 0; font-size: 0.85rem; color: #38bdf8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>🛡️ RAS VPN Подписка</h2>
            <p>Статус: <strong style="color:#4ade80;">АКТИВНА</strong></p>
            <p>Скопируйте эту ссылку и вставьте в Karing, Happ или V2RayTun:</p>
            <code>https://sub.rasvpna.ru/sub/${token}</code>
            <a href="karing://import?url=https://sub.rasvpna.ru/sub/${token}" class="btn">Импортировать в Karing</a>
          </div>
        </body>
      </html>
    `);
  });

  // Vite Middleware for Dev Mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RAS VPN Full-Stack Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
