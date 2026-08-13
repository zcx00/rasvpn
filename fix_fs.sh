sed -i 's/import fs from "fs";//g' server.ts
sed -i '1s/^/import fs from "fs";\n/' server.ts
