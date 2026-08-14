const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `          {appTab === 'referrals' && (
            <ReferralProgram referral={referral} onClaimBonus={handleClaimReferralBonus} />
          )}`;
const replacement = `          {appTab === 'referrals' && (
            <ReferralProgram referral={referral} onClaimBonus={handleClaimReferralBonus} />
          )}

          {/* Legal Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-[10px] text-slate-500 space-y-3">
            <div className="flex flex-wrap justify-center gap-3">
              <a href="https://telegra.ph/Polzovatelskoe-soglashenie-08-01-39" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">Пользовательское соглашение</a>
              <span>&bull;</span>
              <a href="https://telegra.ph/Politika-konfidencialnosti-08-01-83" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">Политика конфиденциальности</a>
              <span>&bull;</span>
              <a href="https://t.me/rasvpn_manager" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">Поддержка</a>
            </div>
            <div className="opacity-50">
              VPN сервис RASvpn. Кодовое слово: plat chek
            </div>
          </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
