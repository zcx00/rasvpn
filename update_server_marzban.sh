sed -i '/app.get('\''\/api\/v1\/servers'\'',/i \
  // Get Marzban Stats and Users\
  app.get("/api/v1/admin/marzban/stats", async (req, res) => {\
    try {\
      const token = await getMarzbanToken();\
      const baseUrl = marzbanConfig.url.replace(/\\/$/, "");\
      const systemRes = await fetch(`${baseUrl}/api/system`, { headers: { Authorization: `Bearer ${token}` } });\
      if (!systemRes.ok) throw new Error("Failed to fetch system stats");\
      const systemData = await systemRes.json();\
\
      const usersRes = await fetch(`${baseUrl}/api/users`, { headers: { Authorization: `Bearer ${token}` } });\
      let usersData = [];\
      if (usersRes.ok) usersData = await usersRes.json();\
\
      const nodesRes = await fetch(`${baseUrl}/api/nodes`, { headers: { Authorization: `Bearer ${token}` } });\
      let nodesData = [];\
      if (nodesRes.ok) nodesData = await nodesRes.json();\
\
      res.json({\
        success: true,\
        system: systemData,\
        users: usersData,\
        nodes: nodesData\
      });\
    } catch (err: any) {\
      res.status(500).json({ success: false, error: err.message });\
    }\
  });\
' server.ts
