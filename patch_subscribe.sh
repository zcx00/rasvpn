sed -i '/app.post('\''\/api\/v1\/subscribe'\'',/c \
  app.post("/api/v1/subscribe", async (req, res) => {\
' server.ts
sed -i '/res.json({/c \
    // Marzban Integration\
    let marzbanLinks = [];\
    try {\
      if (marzbanConfig.url && marzbanConfig.password) {\
        const token = await getMarzbanToken();\
        const baseUrl = marzbanConfig.url.replace(/\\/$/, "");\
        const username = `tg_${currentUser.telegramId || Date.now()}`;\
        \
        // Try to get user first\
        const uRes = await fetch(`${baseUrl}/api/user/${username}`, { headers: { Authorization: `Bearer ${token}` } });\
        let mUser;\
        if (uRes.ok) {\
           mUser = await uRes.json();\
           // Update user (extend expire)\
           await fetch(`${baseUrl}/api/user/${username}`, {\
             method: "PUT",\
             headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },\
             body: JSON.stringify({ expire: Math.floor(expireDate.getTime() / 1000), data_limit: plan.trafficLimitGb * 1073741824, status: "active" })\
           });\
        } else {\
           // Create new user\
           const createRes = await fetch(`${baseUrl}/api/user`, {\
             method: "POST",\
             headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },\
             body: JSON.stringify({\
               username,\
               proxies: { "vless": {}, "vmess": {}, "trojan": {}, "shadowsocks": {} },\
               inbounds: {},\
               expire: Math.floor(expireDate.getTime() / 1000),\
               data_limit: plan.trafficLimitGb * 1073741824,\
               data_limit_reset_strategy: "no_reset",\
               status: "active",\
               note: `Created via WebApp: ${plan.name}`\
             })\
           });\
           if (createRes.ok) mUser = await createRes.json();\
        }\
        if (mUser && mUser.links) marzbanLinks = mUser.links;\
      }\
    } catch(e) { console.error("Marzban sub error", e); }\
\
    if (marzbanLinks.length > 0) {\
        currentSubscription.marzbanLinks = marzbanLinks;\
    }\
\
    res.json({\
' server.ts
