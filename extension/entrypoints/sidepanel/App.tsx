import { useState } from 'react';
import type { ListingData, Marketplace, Language } from 'shared/types';
import { rewriteListing, translateListing } from '../../lib/api';

type Status = 'idle' | 'reading' | 'rewriting' | 'translating' | 'done' | 'error';

const MARKETPLACES: { value: Marketplace; label: string }[] = [
  { value: 'US', label: '🇺🇸 US' },
  { value: 'UK', label: '🇬🇧 UK' },
  { value: 'JP', label: '🇯🇵 JP' },
  { value: 'DE', label: '🇩🇪 DE' },
  { value: 'FR', label: '🇫🇷 FR' },
  { value: 'ES', label: '🇪🇸 ES' },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
];

export default function App() {
  const [status, setStatus] = useState<Status>('idle');
  const [original, setOriginal] = useState<ListingData | null>(null);
  const [optimized, setOptimized] = useState<string>('');
  const [parsed, setParsed] = useState<ListingData | null>(null);
  const [marketplace, setMarketplace] = useState<Marketplace>('US');
  const [language, setLanguage] = useState<Language>('en');
  const [error, setError] = useState('');

  /** 从当前页面读取Listing */
  const handleRead = async () => {
    setStatus('reading');
    setError('');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab');
      const res = await chrome.tabs.sendMessage(tab.id, { type: 'READ_LISTING' }).catch(() => null);
      if (res?.data) {
        setOriginal(res.data);
        setStatus('idle');
      } else {
        throw new Error('Please open an Amazon Seller Central listing edit page first (sellercentral.amazon.com)');
      }
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  };

  /** AI重写 */
  const handleRewrite = async () => {
    if (!original) return;
    setStatus('rewriting');
    setOptimized('');
    setError('');
    try {
      let text = '';
      await rewriteListing({ listing: original, marketplace, language }, (chunk) => {
        text += chunk;
        setOptimized(text);
      });
      tryParse(text);
      setStatus('done');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  };

  /** 翻译 */
  const handleTranslate = async () => {
    const source = parsed || original;
    if (!source) return;
    setStatus('translating');
    setOptimized('');
    setError('');
    try {
      let text = '';
      await translateListing({ listing: source, marketplace, language }, (chunk) => {
        text += chunk;
        setOptimized(text);
      });
      tryParse(text);
      setStatus('done');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  };

  /** 回填到页面 */
  const handleFill = async () => {
    if (!parsed) return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    const res = await chrome.tabs.sendMessage(tab.id, { type: 'FILL_LISTING', data: parsed });
    if (!res?.success) setError(res?.error || 'Fill failed');
  };

  /** 尝试从流式输出解析JSON */
  function tryParse(text: string) {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const json = JSON.parse(match[0]);
        setParsed(json.listing || json);
      }
    } catch {}
  }

  const isLoading = status === 'reading' || status === 'rewriting' || status === 'translating';

  return (
    <div className="p-4 text-sm">
      <h1 className="text-lg font-bold mb-3">AI Listing Optimizer</h1>

      {/* 控制栏 */}
      <div className="flex gap-2 mb-3">
        <select value={marketplace} onChange={(e) => setMarketplace(e.target.value as Marketplace)}
          className="border rounded px-2 py-1 text-xs">
          {MARKETPLACES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}
          className="border rounded px-2 py-1 text-xs">
          {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Btn onClick={handleRead} disabled={isLoading}>
          {status === 'reading' ? 'Reading...' : 'Read Listing'}
        </Btn>
        <Btn onClick={handleRewrite} disabled={isLoading || !original}>
          {status === 'rewriting' ? 'Rewriting...' : 'AI Rewrite'}
        </Btn>
        <Btn onClick={handleTranslate} disabled={isLoading || !original}>
          {status === 'translating' ? 'Translating...' : 'Translate'}
        </Btn>
        {parsed && (
          <Btn onClick={handleFill} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            Fill Back
          </Btn>
        )}
      </div>

      {error && <div className="text-red-500 text-xs mb-3">{error}</div>}

      {/* 原始数据 */}
      {original && (
        <Section title="Original Listing">
          <Field label="Title" value={original.title} />
          {original.bulletPoints.map((bp, i) => (
            <Field key={i} label={`Bullet ${i + 1}`} value={bp} />
          ))}
          <Field label="Description" value={original.description} />
          <Field label="Search Terms" value={original.searchTerms} />
        </Section>
      )}

      {/* AI输出 */}
      {optimized && (
        <Section title="AI Output">
          <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded max-h-96 overflow-y-auto">
            {optimized}
          </pre>
        </Section>
      )}
    </div>
  );
}

function Btn({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`px-3 py-1.5 text-xs text-white rounded
      bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="font-semibold text-xs text-gray-500 uppercase mb-1">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return value ? (
    <div className="mb-1">
      <span className="text-xs text-gray-400">{label}: </span>
      <span className="text-xs">{value}</span>
    </div>
  ) : null;
}
