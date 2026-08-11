import express from 'express';
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

  // Memory store for user subscriptions by tgId or default
  const userSubscriptions = new Map<string, any>();

  let currentUser = { ...INITIAL_USER };
  let currentSubscription = { ...INITIAL_SUBSCRIPTION };
  let entryNodes = [...ENTRY_NODES];
  let exitNodes = [...EXIT_NODES];
  let cascadeRoutes = [...CASCADE_ROUTES];

  // ==================== API ROUTES ====================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), service: 'RAS VPN Master Backend' });
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
          subscriptionUrl: `https://sub.rasvpna.ru/sub/${userToken}`,
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

      const customReferral = {
        ...INITIAL_REFERRAL,
        referralCode: `REF_${tgId}`,
        inviteLink: `https://t.me/ras_vpn_bot?start=ref_${tgId}`,
      };

      return res.json({
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
  app.post('/api/v1/subscribe', (req, res) => {
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

    if (currentUser && currentUser.telegramId) {
      userSubscriptions.set(String(currentUser.telegramId), currentSubscription);
    }

    res.json({
      success: true,
      message: `Подписка на ${plan.name} успешно оформлена!`,
      subscription: currentSubscription,
      paymentMethod,
    });
  });

  // Admin: Get / Create / Update Nodes
  app.get('/api/v1/admin/nodes', (req, res) => {
    res.json({ entryNodes, exitNodes, stats: SYSTEM_STATS });
  });

  app.post('/api/v1/admin/nodes', (req, res) => {
    const { type, node } = req.body;
    if (type === 'entry') {
      const newNode = { ...node, id: `node_ru_${Date.now()}` };
      entryNodes.push(newNode);
      return res.json({ success: true, node: newNode });
    } else {
      const newNode = { ...node, id: `node_exit_${Date.now()}` };
      exitNodes.push(newNode);
      return res.json({ success: true, node: newNode });
    }
  });

  // Admin: Get / Update Cascade Routes
  app.get('/api/v1/admin/routes', (req, res) => {
    res.json({ cascadeRoutes });
  });

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

    // Generate VLESS Reality URIs with XTLS-Vision flow for max speed & anti-censorship
    const v2rayLinks = cascadeRoutes.map(route => {
      const exitNode = exitNodes.find(e => e.id === route.exitNodeId) || exitNodes[0];
      const entryNode = entryNodes.find(e => e.id === route.entryNodeId) || entryNodes[0];
      const tag = `${route.code} (${entryNode.code}➔${exitNode.code})`;
      const encodedRemark = encodeURIComponent(tag);
      return `vless://${token}@${entryNode.ip}:${entryNode.port}?encryption=none&security=reality&flow=xtls-rprx-vision&sni=dl.google.com&fp=chrome&pbk=7a9d3e1f0b4c8a2e5d9c6b3a1f0e4d2c&sid=1a2b3c4d&type=tcp#${encodedRemark}`;
    });

    const rawSubContent = v2rayLinks.join('\n');
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
      return res.json({
        marzbanUsername: currentSubscription.marzbanUsername,
        expireDate: currentSubscription.expireDate,
        trafficLimitGb: currentSubscription.trafficLimitGb,
        trafficUsedGb: currentSubscription.trafficUsedGb,
        protocol: 'VLESS + Reality (XTLS-Vision)',
        vlessLinks: v2rayLinks,
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
