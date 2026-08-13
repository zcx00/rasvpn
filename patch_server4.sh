sed -i '/let marzbanConfig = {/c \
  import fs from "fs";\
  const MARZBAN_FILE = path.join(process.cwd(), "marzban.json");\
  let marzbanConfig = {\
    url: "http://89.22.225.206:8080",\
    username: "admin",\
    password: ""\
  };\
  if (fs.existsSync(MARZBAN_FILE)) {\
    try {\
      marzbanConfig = JSON.parse(fs.readFileSync(MARZBAN_FILE, "utf-8"));\
    } catch (e) {}\
  }\
' server.ts
