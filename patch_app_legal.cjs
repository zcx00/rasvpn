const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add imports
code = code.replace(
  "import { \n  INITIAL_USER,",
  "import { PrivacyPolicy, TermsOfService } from './components/LegalPages';\nimport { \n  INITIAL_USER,"
);

// 2. Change activeView state
const targetState = "const [activeView, setActiveView] = useState<'app' | 'sub' | 'admin'>('app');";
const replacementState = `const [activeView, setActiveView] = useState<'app' | 'sub' | 'admin' | 'privacy' | 'terms'>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/sub')) return 'sub';
    if (path.startsWith('/privacy')) return 'privacy';
    if (path.startsWith('/terms')) return 'terms';
    if (window.location.hostname.startsWith('sub.')) return 'sub';
    if (window.location.hostname.startsWith('admin.')) return 'admin';
    return 'app';
  });`;

code = code.replace(targetState, replacementState);

// 3. Render the views
const targetRender = `      {/* VIEW 3: ADMIN PANEL (admin.rasvpna.ru) */}`;
const replacementRender = `      {/* LEGAL VIEWS */}
      {activeView === 'privacy' && (
        <main className="min-h-screen bg-slate-950 py-10">
          <PrivacyPolicy />
        </main>
      )}
      {activeView === 'terms' && (
        <main className="min-h-screen bg-slate-950 py-10">
          <TermsOfService />
        </main>
      )}

      {/* VIEW 3: ADMIN PANEL (admin.rasvpna.ru) */}`;

code = code.replace(targetRender, replacementRender);

// 4. Update the links in footer
code = code.replace(/href="https:\/\/telegra\.ph\/Polzovatelskoe-soglashenie-08-01-39"/g, 'href="/terms"');
code = code.replace(/href="https:\/\/telegra\.ph\/Politika-konfidencialnosti-08-01-83"/g, 'href="/privacy"');

fs.writeFileSync('src/App.tsx', code);
