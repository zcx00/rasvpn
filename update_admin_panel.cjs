const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

// Add users and users icon
if (!code.includes('Users')) {
  code = code.replace(/Terminal, CreditCard, Wallet } from 'lucide-react';/, "Terminal, CreditCard, Wallet, Users } from 'lucide-react';");
}

// State for marzban stats
const stateInsert = `
  const [marzbanData, setMarzbanData] = useState<any>(null);
  
  React.useEffect(() => {
    fetch('/api/v1/admin/marzban/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
           setMarzbanData(data);
        }
      })
      .catch(() => {});
  }, []);
`;
code = code.replace(/const \[tab, setTab\] = useState.*?;/, `const [tab, setTab] = useState<'marzban' | 'users' | 'payments'>('marzban');${stateInsert}`);

// Replace overview stats
const oldStatsBlock = `      {/* Overview Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Активных пользователей</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">{stats.activeUsers}</div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Передано трафика</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{stats.totalTrafficTb} ТБ</div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Каскадных маршрутов</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{cascadeRoutes.length}</div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Узлов в сети</div>
          <div className="text-xl font-bold text-blue-400 mt-1">{entryNodes.length + exitNodes.length}</div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-400">Средняя нагрузка</div>
          <div className="text-xl font-bold text-purple-400 mt-1">{stats.serverLoadAverage}%</div>
        </div>
      </div>`;

const newStatsBlock = `      {/* Overview Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Активных пользователей</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">{marzbanData ? marzbanData.system.users_active : 0} / {marzbanData ? marzbanData.system.total_user : 0}</div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Передано трафика (Marzban)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {marzbanData ? (marzbanData.system.outgoing_bandwidth / 1073741824).toFixed(2) : 0} GB
          </div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Узлов в сети</div>
          <div className="text-xl font-bold text-blue-400 mt-1">{marzbanData ? marzbanData.nodes.length : 0}</div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Память сервера</div>
          <div className="text-xl font-bold text-purple-400 mt-1">
            {marzbanData ? ((marzbanData.system.mem_used / marzbanData.system.mem_total)*100).toFixed(1) : 0}%
          </div>
        </div>
      </div>`;

if(code.includes('Активных пользователей')) {
  // It's a bit hard to replace exactly via regex due to formatting. Let's do a trick:
  const startIndex = code.indexOf('{/* Overview Stats Header */}');
  const endIndex = code.indexOf('</div>', code.indexOf('stats.serverLoadAverage')) + 6;
  const fullBlock = code.substring(startIndex, endIndex + 13);
  if (startIndex > -1) {
    code = code.replace(fullBlock, newStatsBlock + '\n      </div>');
  }
}

// Replace Tabs
const tabsRegex = /\{\/\* Admin Tabs \*\/\}[\s\S]*?<\/div>/;
const newTabs = `{/* Admin Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 p-2 rounded-xl gap-2 text-xs font-semibold">
        <button
          onClick={() => setTab("marzban")}
          className={\`px-4 py-2 rounded-lg flex items-center gap-2 transition-all \${
            tab === "marzban" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }\`}
        >
          <Server className="w-4 h-4" />
          <span>Marzban Integration</span>
        </button>
        <button
          onClick={() => setTab("users")}
          className={\`px-4 py-2 rounded-lg flex items-center gap-2 transition-all \${
            tab === "users" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }\`}
        >
          <Users className="w-4 h-4" />
          <span>Пользователи (VLESS)</span>
        </button>
        <button
          onClick={() => {
            setTab('payments');
            fetchPaymentSettings();
          }}
          className={\`px-4 py-2 rounded-lg flex items-center gap-2 transition-all \${
            tab === 'payments' ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }\`}
        >
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span>💳 Оплата & Кошельки</span>
        </button>
      </div>`;

code = code.replace(tabsRegex, newTabs);

// Remove Xray and Docker tab contents
const tab3Start = code.indexOf("{/* TAB 3: XRAY JSON CONFIG GENERATOR */}");
const paymentsTabStart = code.indexOf("{tab === 'payments' && (");
if (tab3Start > -1 && paymentsTabStart > -1) {
  code = code.substring(0, tab3Start) + code.substring(paymentsTabStart);
}

// Add Users tab content
const usersTabContent = `
      {tab === 'users' && (
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-4">
            <Users className="w-5 h-5" />
            <span>Управление пользователями Marzban</span>
          </div>
          <p className="text-xs text-slate-400">
            Здесь отображаются пользователи, созданные в Marzban (включая тех, кто купил подписку через WebApp). Вы можете просматривать их лимиты и ссылки.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Username</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Истекает</th>
                  <th className="px-4 py-3">Трафик</th>
                  <th className="px-4 py-3 rounded-tr-xl">Ссылки</th>
                </tr>
              </thead>
              <tbody>
                {marzbanData && marzbanData.users ? (
                  marzbanData.users.map((u: any) => (
                    <tr key={u.username} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-mono text-cyan-400">{u.username}</td>
                      <td className="px-4 py-3">
                        <span className={\`px-2 py-1 rounded text-xs font-bold \${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}\`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{u.expire ? new Date(u.expire * 1000).toLocaleDateString() : '∞'}</td>
                      <td className="px-4 py-3">{(u.used_traffic / 1073741824).toFixed(2)} GB / {u.data_limit ? (u.data_limit / 1073741824).toFixed(2) + ' GB' : '∞'}</td>
                      <td className="px-4 py-3">
                        {u.links && u.links.length > 0 ? (
                          <button 
                            onClick={() => {
                               navigator.clipboard.writeText(u.links.join('\\n'));
                               alert('Ссылки скопированы!');
                            }}
                            className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-lg text-xs hover:bg-purple-600/40 transition-colors"
                          >
                            Копировать ({u.links.length})
                          </button>
                        ) : 'Нет'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Нет данных или панель Marzban не подключена
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
`;

if (!code.includes("tab === 'users'")) {
  code = code.replace("{tab === 'payments' && (", usersTabContent + "\n      {tab === 'payments' && (");
}

fs.writeFileSync('src/components/AdminPanel.tsx', code);
console.log('AdminPanel updated successfully!');
