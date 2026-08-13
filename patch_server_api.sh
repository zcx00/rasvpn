sed -i '/app.get('\''\/api\/v1\/servers'\'',/i \
  // Marzban API\
  app.get("/api/v1/admin/marzban", (req, res) => {\
    res.json(marzbanConfig);\
  });\
\
  app.post("/api/v1/admin/marzban", (req, res) => {\
    const { url, username, password } = req.body;\
    if (url) marzbanConfig.url = url;\
    if (username) marzbanConfig.username = username;\
    if (password !== undefined) marzbanConfig.password = password;\
    res.json({ success: true, marzbanConfig });\
  });\
\
  app.post("/api/v1/admin/marzban/test", async (req, res) => {\
    try {\
      const token = await getMarzbanToken();\
      const baseUrl = marzbanConfig.url.replace(/\\/$/, "");\
      const systemRes = await fetch(`${baseUrl}/api/system`, { headers: { Authorization: `Bearer ${token}` } });\
      res.json({ success: true, message: "Успешное подключение к Marzban!" });\
    } catch (err: any) {\
      res.status(400).json({ success: false, error: err.message || "Ошибка подключения" });\
    }\
  });\
' server.ts
