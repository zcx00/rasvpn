sed -i '/let currentSubscription = { ...INITIAL_SUBSCRIPTION };/a \
\
  // Marzban Config\
  let marzbanConfig = {\
    url: "http://89.22.225.206:8080",\
    username: "admin",\
    password: ""\
  };\
\
  async function getMarzbanToken() {\
    const baseUrl = marzbanConfig.url.replace(/\\/$/, "");\
    const params = new URLSearchParams();\
    params.append("username", marzbanConfig.username);\
    params.append("password", marzbanConfig.password);\
    const res = await fetch(`${baseUrl}/api/admin/token`, {\
      method: "POST",\
      headers: { "Content-Type": "application/x-www-form-urlencoded" },\
      body: params.toString()\
    });\
    if (!res.ok) throw new Error("Marzban Auth Failed");\
    const data = await res.json();\
    return data.access_token;\
  }\
' server.ts
