export interface UserProfile {
  id: string;
  telegramId: number;
  username: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  createdAt: string;
  status: 'active' | 'suspended' | 'expired';
}

export interface VpnSubscription {
  id: string;
  userId: string;
  marzbanUsername: string;
  token: string;
  subscriptionUrl: string;
  subscriptionType?: 'standard' | 'cascade';
  planId: string;
  planName: string;
  startDate: string;
  expireDate: string;
  trafficLimitGb: number;
  trafficUsedGb: number;
  status: 'active' | 'expired' | 'disabled';
  activeDevicesCount: number;
  maxDevices: number;
  protocol?: string;
}

export interface TariffPlan {
  id: string;
  name: string;
  type: 'standard' | 'cascade';
  priceRub: number;
  durationDays: number;
  trafficLimitGb: number;
  popular?: boolean;
  discountPercent?: number;
  description: string;
}

export interface EntryNode {
  id: string;
  name: string;
  code: string; // e.g. RU-01
  location: string;
  flag: string;
  ip: string;
  port: number;
  status: 'online' | 'degraded' | 'offline';
  loadPercent: number;
  pingMs: number;
}

export interface ExitNode {
  id: string;
  name: string;
  code: string; // e.g. DE-01
  location: string;
  flag: string;
  ip: string;
  port: number;
  status: 'online' | 'degraded' | 'offline';
  loadPercent: number;
  pingMs: number;
}

export interface CascadeRoute {
  id: string;
  name: string;
  code: string;
  entryNodeId: string;
  exitNodeId: string;
  flag: string; // Exit country flag
  totalPingMs: number;
  status: 'active' | 'maintenance' | 'disabled';
  recommendedFor?: string[];
}

export interface ClientApp {
  id: string;
  name: string;
  iconName: string;
  platforms: ('iOS' | 'Android' | 'Windows' | 'macOS')[];
  recommended: boolean;
  importProtocol: string;
  deepLinkScheme: string;
  guideSteps: string[];
  downloadUrl: string;
}

export interface ReferralStat {
  referralCode: string;
  totalInvited: number;
  activeSubscribers: number;
  earnedRubles: number;
  earnedBonusDays: number;
  inviteLink: string;
  history: {
    id: string;
    username: string;
    date: string;
    reward: string;
  }[];
}

export interface SystemStats {
  activeUsers: number;
  totalTrafficTb: number;
  activeCascadeRoutes: number;
  onlineNodes: number;
  serverLoadAverage: number;
}

export interface PaymentSettings {
  cardlinkShopId: string;
  cardlinkApiKey: string;
  cryptoBotToken: string;
  walletTrc20: string;
  walletTon: string;
  alfaAccount: string;
  alfaRecipient: string;
  autoActivateOnPayment: boolean;
}

export interface CryptoInvoice {
  id: string;
  planId: string;
  planName: string;
  amountRub: number;
  amountUsdt: number;
  amountTon: number;
  payUrl?: string;
  cardlinkUrl?: string;
  walletTrc20: string;
  walletTon: string;
  status: 'pending' | 'paid' | 'expired';
  createdAt: string;
  expiresAt: string;
  memoCode: string;
}
