sed -i '/if (password !== undefined) marzbanConfig.password = password;/a \
    try {\
      fs.writeFileSync(MARZBAN_FILE, JSON.stringify(marzbanConfig, null, 2));\
    } catch(e) {}\
' server.ts
