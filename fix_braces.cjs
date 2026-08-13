const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = "    } catch(e) {}\n\n      res.json({\n  });\n  app.post(\"/api/v1/admin/marzban/test\"";
const replacement = "    } catch(e) {}\n    res.json({ success: true });\n  });\n\n  app.post(\"/api/v1/admin/marzban/test\"";
code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
