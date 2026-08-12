import { EntryNode, ExitNode, CascadeRoute, TariffPlan, ClientApp, UserProfile, VpnSubscription, ReferralStat, SystemStats } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr_948201',
  telegramId: 849302194,
  username: 'alex_vpn',
  firstName: 'Алексей',
  lastName: 'Смирнов',
  photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  createdAt: '2026-01-15',
  status: 'active',
};

export const EMPTY_SUBSCRIPTION: VpnSubscription = {
  id: '',
  userId: '',
  marzbanUsername: '',
  token: '',
  subscriptionUrl: '',
  planId: '',
  planName: 'Подписка не активна',
  startDate: '',
  expireDate: '',
  trafficLimitGb: 0,
  trafficUsedGb: 0,
  status: 'expired',
  activeDevicesCount: 0,
  maxDevices: 5,
  protocol: 'VLESS + Reality',
};

export const INITIAL_SUBSCRIPTION: VpnSubscription = EMPTY_SUBSCRIPTION;

export const TARIFF_PLANS: TariffPlan[] = [
  // Обычные тарифы (Зарубежные сервера)
  {
    id: 'plan_std_1m',
    name: '1 Месяц (Обычная)',
    type: 'standard',
    priceRub: 149,
    durationDays: 30,
    trafficLimitGb: 300,
    description: 'Обычная подписка: 2 зарубежных сервера (Нидерланды, Германия). Напрямую без каскада.',
  },
  {
    id: 'plan_std_3m',
    name: '3 Месяца (Обычная)',
    type: 'standard',
    priceRub: 399,
    durationDays: 90,
    trafficLimitGb: 500,
    discountPercent: 10,
    description: 'Обычная подписка: 2 зарубежных сервера с высокой скоростью.',
  },
  // Тарифы «Обход глушилок» (Каскад через РФ)
  {
    id: 'plan_casc_1m',
    name: '1 Месяц (Обход глушилок)',
    type: 'cascade',
    priceRub: 199,
    durationDays: 30,
    trafficLimitGb: 400,
    popular: true,
    description: 'Подписка «Обход глушилок»: 1 Российский вход + 2 Зарубежных сервера через двойной каскад VLESS.',
  },
  {
    id: 'plan_casc_3m',
    name: '3 Месяца (Обход глушилок)',
    type: 'cascade',
    priceRub: 549,
    durationDays: 90,
    trafficLimitGb: 800,
    discountPercent: 15,
    description: 'Максимальная маскировка ТСПУ / Блокировок РКН + поддержка 5 устройств.',
  },
  {
    id: 'plan_casc_12m',
    name: '1 Год (Обход глушилок VIP)',
    type: 'cascade',
    priceRub: 1790,
    durationDays: 365,
    trafficLimitGb: 2000,
    discountPercent: 30,
    description: 'Полный каскадный доступ на 1 год. Максимальная стабильность.',
  },
];

export const ENTRY_NODES: EntryNode[] = [
  {
    id: 'node_ru_01',
    name: 'Россия (Москва - Каскадный Вход)',
    code: 'RU-01',
    location: 'Москва, Россия',
    flag: '🇷🇺',
    ip: '185.178.208.12',
    port: 443,
    status: 'online',
    loadPercent: 32,
    pingMs: 12,
  },
];

export const EXIT_NODES: ExitNode[] = [
  {
    id: 'node_nl_01',
    name: 'Нидерланды (Амстердам)',
    code: 'NL-01',
    location: 'Амстердам, Нидерланды',
    flag: '🇳🇱',
    ip: '213.108.196.40',
    port: 8443,
    status: 'online',
    loadPercent: 41,
    pingMs: 45,
  },
  {
    id: 'node_de_01',
    name: 'Германия (Франкфурт)',
    code: 'DE-01',
    location: 'Франкфурт, Германия',
    flag: '🇩🇪',
    ip: '116.202.140.77',
    port: 8443,
    status: 'online',
    loadPercent: 38,
    pingMs: 38,
  },
];

export const CASCADE_ROUTES: CascadeRoute[] = [
  {
    id: 'route_ru_nl_cascade',
    name: 'Россия ➔ Нидерланды (Обход ТСПУ)',
    code: 'RAS VPN 🇷🇺➔🇳🇱 NL-01',
    entryNodeId: 'node_ru_01',
    exitNodeId: 'node_nl_01',
    flag: '🇳🇱',
    totalPingMs: 57,
    status: 'active',
    recommendedFor: ['Обход блокировок', 'YouTube 4K', 'Instagram'],
  },
  {
    id: 'route_ru_de_cascade',
    name: 'Россия ➔ Германия (Обход ТСПУ)',
    code: 'RAS VPN 🇷🇺➔🇩🇪 DE-01',
    entryNodeId: 'node_ru_01',
    exitNodeId: 'node_de_01',
    flag: '🇩🇪',
    totalPingMs: 50,
    status: 'active',
    recommendedFor: ['Обход глушилок', 'Игры', 'Высокая скорость'],
  },
];

export const CLIENT_APPS: ClientApp[] = [
  {
    id: 'app_karing',
    name: 'Karing',
    iconName: 'ShieldCheck',
    platforms: ['iOS', 'Android', 'Windows', 'macOS'],
    recommended: true,
    importProtocol: 'Sub Link / V2Ray / Sing-box / Clash',
    deepLinkScheme: 'karing://import?url=',
    downloadUrl: 'https://karing.app/',
    guideSteps: [
      'Установите приложение Karing из App Store или Google Play',
      'Нажмите кнопку "Скопировать подписку" выше или отсканируйте QR-код',
      'В Karing перейдите в "Профили" ➔ "Добавить по URL"',
      'Вставьте скопированную ссылку `sub.rasvpna.ru/sub/...` и нажмите Импорт',
      'Выберите каскадный сервер (например, 🇩🇪 Germany) и нажмите Кнопку Подключения',
    ],
  },
  {
    id: 'app_happ',
    name: 'Happ',
    iconName: 'Zap',
    platforms: ['iOS', 'Android', 'macOS'],
    recommended: true,
    importProtocol: 'Sub Link / Sing-box',
    deepLinkScheme: 'happ://import/',
    downloadUrl: 'https://happ.me/',
    guideSteps: [
      'Скачайте приложение Happ на устройство',
      'Нажмите "Импортировать в Happ" или скопируйте подписку',
      'Happ автоматически обнаружит ссылку и предложит добавить профиль RAS VPN',
      'Нажмите "Сохранить" и включите VPN',
    ],
  },
  {
    id: 'app_v2raytun',
    name: 'V2RayTun',
    iconName: 'Cpu',
    platforms: ['Android', 'iOS'],
    recommended: true,
    importProtocol: 'V2Ray / VLESS / Reality',
    deepLinkScheme: 'v2raytun://import/',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.v2raytun.android',
    guideSteps: [
      'Установите V2RayTun из Google Play или App Store',
      'Скопируйте ссылку подписки RAS VPN',
      'Откройте V2RayTun, нажмите значок "+" вверху и выберите "Импортировать подписку по URL"',
      'Вставьте URL и обновите список серверов',
    ],
  },
  {
    id: 'app_streisand',
    name: 'Streisand',
    iconName: 'Smartphone',
    platforms: ['iOS'],
    recommended: false,
    importProtocol: 'V2Ray / Sing-box',
    deepLinkScheme: 'streisand://import/',
    downloadUrl: 'https://apps.apple.com/app/streisand/id6450534064',
    guideSteps: [
      'Откройте Streisand на iPhone / iPad',
      'Нажмите "+" ➔ "Импорт подписки"',
      'Вставьте ссылку RAS VPN и нажмите "Добавить"',
    ],
  },
];

export const EMPTY_REFERRAL: ReferralStat = {
  referralCode: 'REF-NEW',
  totalInvited: 0,
  activeSubscribers: 0,
  earnedRubles: 0,
  earnedBonusDays: 0,
  inviteLink: 'https://t.me/ras_vpn_bot?start=ref_new',
  history: [],
};

export const INITIAL_REFERRAL: ReferralStat = EMPTY_REFERRAL;

export const SYSTEM_STATS: SystemStats = {
  activeUsers: 1482,
  totalTrafficTb: 18.4,
  activeCascadeRoutes: 4,
  onlineNodes: 7,
  serverLoadAverage: 38,
};
