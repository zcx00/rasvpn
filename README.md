# RAS VPN — Панель и Веб-приложение с поддержкой VLESS + Reality & Marzban

Полнофункциональное веб-приложение и Telegram Mini App для сервиса **RAS VPN** с прямой интеграцией с панелью **Marzban** (VLESS Reality, Shadowsocks, Trojan).

![RAS VPN Preview](https://img.shields.io/badge/Status-Active-emerald) ![Marzban Integration](https://img.shields.io/badge/Marzban-Connected-cyan) ![Protocol](https://img.shields.io/badge/Protocol-VLESS%20%2B%20Reality-purple)

---

## ⚡ Особенности приложения

- 🚀 **Интеграция с Marzban Panel**: Прямое подключение к REST API Marzban на `http://89.22.225.206:8080`.
- 🔐 **Поддержка VLESS + Reality**: Защищенный доступ с ключами x25519 для обхода любых блокировок DPI (ТСПУ).
- 📲 **Мгновенный импорт подписки**:
  - Быстрый запуск в **Happ v2** (`v2raytun://import/...`)
  - Быстрый запуск в **Karing** (`karing://import?url=...`)
  - Совместимость с **V2RayTun**, **Streisand**, **Hiddify**.
- 💳 **Мульти-оплата**: Поддержка СБП, банковских карт, CryptoBot, TON и USDT TRC-20.
- 🛡️ **Защищенная Админка**: Доступ по секретному паролю `1969111Izi@`.

---

## 🚀 Запуск и Развертывание

### 1. Требования
- **Node.js**: v18 или выше
- **npm** / **yarn**
- **Docker** & **Marzban Panel** (запущен на вашем VPS)

### 2. Установка и запуск
```bash
# Клонируйте репозиторий
git clone https://github.com/YOUR_USERNAME/ras-vpn.git
cd ras-vpn

# Установите зависимости
npm install

# Запустите в режиме разработки
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:3000`

### 3. Сборка для Production
```bash
npm run build
npm start
```

---

## 🔒 Конфигурация Marzban Xray Core (VLESS + Reality)

Для корректной работы выдачи ключей добавьте следующий JSON в **Marzban Dashboard ➔ Core Settings**:

```json
{
  "log": {
    "loglevel": "warning"
  },
  "routing": {
    "rules": [
      {
        "type": "field",
        "ip": [
          "geoip:private"
        ],
        "outboundTag": "BLOCK"
      }
    ]
  },
  "inbounds": [
    {
      "tag": "VLESS REALITY",
      "listen": "0.0.0.0",
      "port": 443,
      "protocol": "vless",
      "settings": {
        "clients": [],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "yahoo.com:443",
          "xver": 0,
          "serverNames": [
            "yahoo.com",
            "www.yahoo.com"
          ],
          "privateKey": "iOl3x0B1PoqCtWwk-hjVG6BWTPaL1-d2opIHGPyDp0I",
          "shortIds": [
            ""
          ]
        }
      }
    },
    {
      "tag": "Shadowsocks TCP",
      "listen": "0.0.0.0",
      "port": 1080,
      "protocol": "shadowsocks",
      "settings": {
        "clients": [],
        "network": "tcp,udp"
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "DIRECT"
    },
    {
      "protocol": "blackhole",
      "tag": "BLOCK"
    }
  ]
}
```

---

## 🔑 Вход в Админ-панель
- Откройте вкладку **«Админка»** в шапке приложения.
- Введите пароль: **`1969111Izi@`**

© 2026 RAS VPN. All Rights Reserved.
