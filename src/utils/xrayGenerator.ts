import { EntryNode, ExitNode, CascadeRoute } from '../types';

export function generateEntryXrayConfig(entryNode: EntryNode, exitNode: ExitNode, clientUuid: string) {
  return {
    log: {
      loglevel: "warning"
    },
    inbounds: [
      {
        tag: "vless-inbound",
        port: entryNode.port,
        protocol: "vless",
        settings: {
          clients: [
            {
              id: clientUuid,
              flow: "xtls-rprx-vision",
              email: "user@rasvpna.ru"
            }
          ],
          decryption: "none"
        },
        streamSettings: {
          network: "tcp",
          security: "reality",
          realitySettings: {
            show: false,
            dest: "dl.google.com:443",
            xver: 0,
            serverNames: ["dl.google.com", "www.microsoft.com"],
            privateKey: "GENERATE_SERVER_PRIVATE_KEY_HERE",
            shortIds: ["1a2b3c4d5e6f"]
          }
        }
      }
    ],
    outbounds: [
      {
        tag: "cascade-outbound-to-exit-node",
        protocol: "vless",
        settings: {
          vnext: [
            {
              address: exitNode.ip,
              port: exitNode.port,
              users: [
                {
                  id: clientUuid,
                  encryption: "none",
                  flow: "xtls-rprx-vision"
                }
              ]
            }
          ]
        },
        streamSettings: {
          network: "tcp",
          security: "tls",
          tlsSettings: {
            serverName: "exit.rasvpna.ru",
            allowInsecure: false
          }
        }
      },
      {
        tag: "direct-blocked",
        protocol: "blackhole"
      }
    ],
    routing: {
      domainStrategy: "IPIfNonMatch",
      rules: [
        {
          type: "field",
          inboundTag: ["vless-inbound"],
          outboundTag: "cascade-outbound-to-exit-node"
        }
      ]
    }
  };
}

export function generateExitXrayConfig(exitNode: ExitNode, clientUuid: string) {
  return {
    log: {
      loglevel: "warning"
    },
    inbounds: [
      {
        tag: "cascade-inbound-from-ru-entry",
        port: exitNode.port,
        protocol: "vless",
        settings: {
          clients: [
            {
              id: clientUuid,
              email: "cascade-relay@rasvpna.ru"
            }
          ],
          decryption: "none"
        },
        streamSettings: {
          network: "tcp",
          security: "tls",
          tlsSettings: {
            certificates: [
              {
                certificateFile: "/etc/letsencrypt/live/exit.rasvpna.ru/fullchain.pem",
                keyFile: "/etc/letsencrypt/live/exit.rasvpna.ru/privkey.pem"
              }
            ]
          }
        }
      }
    ],
    outbounds: [
      {
        tag: "direct-internet",
        protocol: "freedom",
        settings: {}
      },
      {
        tag: "block-private",
        protocol: "blackhole",
        settings: {
          response: {
            type: "http"
          }
        }
      }
    ],
    routing: {
      domainStrategy: "AsIs",
      rules: [
        {
          type: "field",
          ip: ["geoip:private"],
          outboundTag: "block-private"
        },
        {
          type: "field",
          network: "tcp,udp",
          outboundTag: "direct-internet"
        }
      ]
    }
  };
}

export function generateDockerComposeSnippet(serverRole: 'entry' | 'exit' | 'master') {
  if (serverRole === 'master') {
    return `version: '3.8'

services:
  marzban:
    image: gozargah/marzban:latest
    container_name: marzban-master
    restart: always
    env_file: .env
    network_mode: host
    volumes:
      - /var/lib/marzban:/var/lib/marzban
      - /etc/certs:/etc/certs

  backend-api:
    build: .
    container_name: rasvpn-backend
    restart: always
    ports:
      - "8000:8000"
    environment:
      - POSTGRES_URL=postgresql://ras_user:secret_pass@postgres:5432/rasvpn
      - REDIS_URL=redis://redis:6379/0
      - MARZBAN_URL=http://localhost:8000
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    container_name: rasvpn-db
    restart: always
    environment:
      POSTGRES_DB: rasvpn
      POSTGRES_USER: ras_user
      POSTGRES_PASSWORD: secret_pass
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: rasvpn-redis
    restart: always

volumes:
  pgdata:`;
  }

  return `version: '3.8'

services:
  xray-${serverRole}:
    image: teddysun/xray:latest
    container_name: xray-${serverRole}-node
    restart: always
    volumes:
      - ./config.json:/etc/xray/config.json:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    network_mode: host`;
}
