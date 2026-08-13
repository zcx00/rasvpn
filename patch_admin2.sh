sed -i '/<FileCode className="w-4 h-4" \/>/i \
        <button\
          onClick={() => setTab("marzban")}\
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${\
            tab === "marzban" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"\
          }`}\
        >\
          <Server className="w-4 h-4" />\
          <span>Marzban Integration</span>\
        </button>\
' src/components/AdminPanel.tsx
