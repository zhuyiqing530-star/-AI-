"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getAllLeads,
  addLead,
  updateLeadStatus,
  deleteLead,
  exportLeadsCSV,
  getStats,
  type Lead,
  type LeadStatus,
} from "../../lib/storage";
import { generateOutreachMessages } from "../../lib/templates";
import { getOpportunityLabel } from "../../lib/analyzer";
import { rewriteListing, suggestKeywords } from "../../lib/api";

// ─── 类型 ───────────────────────────────────────────────────────────────────

interface PageAnalysis {
  asin: string;
  title: string;
  sellerName: string;
  brand: string;
  marketplace: string;
  imageUrl: string;
  productUrl: string;
  bullets: string[];
  description: string;
  hasVideo: boolean;
  detection: { isChinese: boolean; confidence: number; signals: string[] };
  analysis: {
    qualityScore: number;
    opportunityScore: number;
    gaps: string[];
    details: { dimension: string; score: number; maxScore: number; label: string }[];
  };
}

type Tab = "current" | "leads" | "optimize";
type LeadStatusFilter = "all" | LeadStatus;

// ─── 主组件 ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("current");
  const [pageData, setPageData] = useState<PageAnalysis | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, contacted: 0, converted: 0 });
  const [isOnSellerCentral, setIsOnSellerCentral] = useState(false);
  const [addedAsin, setAddedAsin] = useState<string | null>(null);

  // 监听内容脚本消息
  useEffect(() => {
    const handler = (message: { type: string; payload: unknown }) => {
      if (message.type === "LISTING_ANALYZED") {
        setPageData(message.payload as PageAnalysis);
      }
      if (message.type === "SELLER_CENTRAL_DETECTED") {
        setIsOnSellerCentral(true);
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  // 加载线索库
  const refreshLeads = useCallback(async () => {
    const [all, s] = await Promise.all([getAllLeads(), getStats()]);
    setLeads(all.sort((a, b) => b.opportunityScore - a.opportunityScore));
    setStats(s);
  }, []);

  useEffect(() => {
    refreshLeads();
  }, [refreshLeads, activeTab]);

  // 请求当前页面数据（侧边栏打开时主动拉取）
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "REQUEST_PAGE_DATA" }, (resp) => {
          if (resp?.payload) {
            // 有数据但还没有 analysis，触发内容脚本重新分析
          }
        });
      }
    });
  }, []);

  const handleAddLead = async () => {
    if (!pageData) return;
    await addLead({
      asin: pageData.asin,
      productTitle: pageData.title.slice(0, 60),
      sellerName: pageData.sellerName,
      brand: pageData.brand,
      marketplace: pageData.marketplace,
      opportunityScore: pageData.analysis.opportunityScore,
      qualityScore: pageData.analysis.qualityScore,
      gaps: pageData.analysis.gaps,
      isChinese: pageData.detection.isChinese,
      chineseSignals: pageData.detection.signals,
      imageUrl: pageData.imageUrl,
      productUrl: pageData.productUrl,
    });
    setAddedAsin(pageData.asin);
    await refreshLeads();
    setTimeout(() => setAddedAsin(null), 2000);
  };

  const handleExport = async () => {
    const csv = await exportLeadsCSV();
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `videolingo_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部 Header */}
      <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">VideoLingo 引流助手</span>
          <span className="bg-indigo-400 text-white text-xs px-1.5 py-0.5 rounded">Beta</span>
        </div>
        <div className="flex gap-3 text-xs text-indigo-200">
          <span>{stats.total} 线索</span>
          <span>{stats.converted} 转化</span>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="flex border-b border-gray-200 bg-white">
        {(["current", "leads", "optimize"] as Tab[]).map((tab) => {
          const labels: Record<Tab, string> = {
            current: "当前页面",
            leads: `线索库 (${stats.total})`,
            optimize: "流量优化",
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "current" && (
          <CurrentTab
            data={pageData}
            onAddLead={handleAddLead}
            addedAsin={addedAsin}
          />
        )}
        {activeTab === "leads" && (
          <LeadsTab
            leads={leads}
            onRefresh={refreshLeads}
            onExport={handleExport}
            onUpdateStatus={async (id, status) => {
              await updateLeadStatus(id, status);
              await refreshLeads();
            }}
            onDelete={async (id) => {
              await deleteLead(id);
              await refreshLeads();
            }}
          />
        )}
        {activeTab === "optimize" && (
          <OptimizeTab isOnSellerCentral={isOnSellerCentral} />
        )}
      </div>
    </div>
  );
}

// ─── Tab 1：当前页面 ────────────────────────────────────────────────────────

function CurrentTab({
  data,
  onAddLead,
  addedAsin,
}: {
  data: PageAnalysis | null;
  onAddLead: () => void;
  addedAsin: string | null;
}) {
  const [showTemplate, setShowTemplate] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
        <span className="text-4xl">🔍</span>
        <p className="text-sm text-center">
          请打开亚马逊商品页<br />插件将自动分析卖家信息
        </p>
      </div>
    );
  }

  const { label, color } = getOpportunityLabel(data.analysis.opportunityScore);
  const messages = generateOutreachMessages({
    productTitle: data.title,
    sellerName: data.sellerName,
    marketplace: data.marketplace,
    gaps: data.analysis.gaps,
    opportunityScore: data.analysis.opportunityScore,
  });
  const isAdded = addedAsin === data.asin;

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="p-3 space-y-3">
      {/* 卖家基本信息 */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="flex items-start gap-2">
          {data.imageUrl && (
            <img src={data.imageUrl} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">{data.title}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">{data.asin}</span>
              <span className="bg-indigo-50 text-indigo-600 text-xs px-1.5 py-0.5 rounded">{data.marketplace}站</span>
              {data.detection.isChinese && (
                <span className="bg-red-50 text-red-500 text-xs px-1.5 py-0.5 rounded">🇨🇳 中国卖家</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">卖家：{data.sellerName || "未知"}</p>
          </div>
        </div>
      </div>

      {/* 机会评分 */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">机会评分</span>
          <span className={`text-sm font-bold ${color}`}>{data.analysis.opportunityScore}分 · {label}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full score-bar rounded-full ${
              data.analysis.opportunityScore >= 80
                ? "bg-red-400"
                : data.analysis.opportunityScore >= 60
                ? "bg-orange-400"
                : data.analysis.opportunityScore >= 40
                ? "bg-yellow-400"
                : "bg-gray-300"
            }`}
            style={{ width: `${data.analysis.opportunityScore}%` }}
          />
        </div>

        {/* 缺口标签 */}
        <div className="flex flex-wrap gap-1 mt-2">
          {data.analysis.gaps.map((gap, i) => (
            <span key={i} className="bg-orange-50 text-orange-600 text-xs px-2 py-0.5 rounded-full border border-orange-100">
              {gap}
            </span>
          ))}
        </div>

        {/* 各维度评分 */}
        <div className="mt-3 space-y-1.5">
          {data.analysis.details.map((d) => (
            <div key={d.dimension} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-20 flex-shrink-0">{d.dimension}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full"
                  style={{ width: `${(d.score / d.maxScore) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-12 text-right">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={onAddLead}
          disabled={isAdded}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            isAdded
              ? "bg-green-100 text-green-600"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isAdded ? "✓ 已添加" : "添加到线索库"}
        </button>
        <button
          onClick={() => setShowTemplate(!showTemplate)}
          className="flex-1 py-2 rounded-lg text-sm font-medium border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          {showTemplate ? "收起话术" : "生成触达话术"}
        </button>
      </div>

      {/* 触达话术展开区 */}
      {showTemplate && (
        <div className="space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">{msg.title}</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{msg.channel}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{msg.message}</p>
              <button
                onClick={() => copyText(msg.message, i)}
                className="mt-2 w-full text-xs py-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                {copiedIdx === i ? "✓ 已复制" : "一键复制"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab 2：线索库 ──────────────────────────────────────────────────────────

const STATUS_LABELS: Record<LeadStatus, string> = {
  pending: "待触达",
  contacted: "已联系",
  following: "跟进中",
  converted: "已转化",
  invalid: "无效",
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  pending: "bg-yellow-50 text-yellow-600",
  contacted: "bg-blue-50 text-blue-600",
  following: "bg-purple-50 text-purple-600",
  converted: "bg-green-50 text-green-600",
  invalid: "bg-gray-100 text-gray-400",
};

function LeadsTab({
  leads,
  onRefresh,
  onExport,
  onUpdateStatus,
  onDelete,
}: {
  leads: Lead[];
  onRefresh: () => void;
  onExport: () => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [filter, setFilter] = useState<LeadStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = leads.filter((l) => {
    const matchStatus = filter === "all" || l.status === filter;
    const matchSearch =
      !search ||
      l.sellerName.toLowerCase().includes(search.toLowerCase()) ||
      l.productTitle.toLowerCase().includes(search.toLowerCase()) ||
      l.asin.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
        <span className="text-4xl">📋</span>
        <p className="text-sm text-center">暂无线索<br />浏览亚马逊商品页后点击「添加到线索库」</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="p-3 space-y-2 bg-white border-b border-gray-100">
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索卖家、商品、ASIN..."
            className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-400"
          />
          <button
            onClick={onExport}
            className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            导出CSV
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {(["all", "pending", "contacted", "following", "converted"] as LeadStatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full transition-colors ${
                filter === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? `全部 (${leads.length})` : STATUS_LABELS[s as LeadStatus]}
            </button>
          ))}
        </div>
      </div>

      {/* 线索列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">没有匹配的线索</p>
        )}
        {filtered.map((lead) => {
          const isExpanded = expandedId === lead.id;
          const messages = generateOutreachMessages({
            productTitle: lead.productTitle,
            sellerName: lead.sellerName,
            marketplace: lead.marketplace,
            gaps: lead.gaps,
            opportunityScore: lead.opportunityScore,
          });

          return (
            <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* 线索卡片头部 */}
              <div
                className="p-3 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : lead.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-gray-800 truncate max-w-[140px]">
                        {lead.sellerName || lead.productTitle.slice(0, 20)}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[lead.status]}`}>
                        {STATUS_LABELS[lead.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{lead.productTitle}</p>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{lead.asin}</span>
                      <span className="text-xs bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded">{lead.marketplace}站</span>
                      {lead.isChinese && (
                        <span className="text-xs bg-red-50 text-red-400 px-1.5 py-0.5 rounded">中国卖家</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${getOpportunityLabel(lead.opportunityScore).color}`}>
                      {lead.opportunityScore}分
                    </div>
                    <div className="text-xs text-gray-400">{lead.addedAt.slice(0, 10)}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {lead.gaps.map((gap, i) => (
                    <span key={i} className="text-xs bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded-full">
                      {gap}
                    </span>
                  ))}
                </div>
              </div>

              {/* 展开详情 */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-3 space-y-3 bg-gray-50">
                  {/* 状态更新 */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5 font-medium">更新状态</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(["pending", "contacted", "following", "converted", "invalid"] as LeadStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => onUpdateStatus(lead.id, s)}
                          className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                            lead.status === s
                              ? "bg-indigo-600 text-white"
                              : "bg-white border border-gray-200 text-gray-500 hover:border-indigo-300"
                          }`}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 触达话术 */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5 font-medium">触达话术</p>
                    {messages.slice(0, 1).map((msg, i) => (
                      <div key={i} className="bg-white rounded-lg p-2.5 border border-gray-100">
                        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{msg.message}</p>
                        <button
                          onClick={() => navigator.clipboard.writeText(msg.message)}
                          className="mt-1.5 text-xs text-indigo-500 hover:text-indigo-700"
                        >
                          复制话术
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 跳转 + 删除 */}
                  <div className="flex gap-2">
                    <a
                      href={lead.productUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center text-xs py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white"
                    >
                      查看商品
                    </a>
                    <button
                      onClick={() => onDelete(lead.id)}
                      className="flex-1 text-xs py-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50"
                    >
                      删除线索
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab 3：流量优化（Seller Central 模式）────────────────────────────────

function OptimizeTab({ isOnSellerCentral }: { isOnSellerCentral: boolean }) {
  const [listing, setListing] = useState<{
    title: string;
    bulletPoints: string[];
    description: string;
    searchTerms: string;
  } | null>(null);
  const [marketplace, setMarketplace] = useState("US");
  const [language, setLanguage] = useState("English");
  const [streamText, setStreamText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<"rewrite" | "keywords">("rewrite");

  const marketplaces = ["US", "JP", "DE", "FR", "ES", "UK"];
  const languages = ["English", "Japanese", "German", "French", "Spanish"];

  const readListing = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "READ_SELLER_LISTING" },
        (resp) => {
          if (resp?.payload) setListing(resp.payload);
        }
      );
    });
  };

  const fillBack = () => {
    if (!listing) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "FILL_SELLER_LISTING",
        payload: listing,
      });
    });
  };

  const runAI = async () => {
    if (!listing) return;
    setStreamText("");
    setIsStreaming(true);
    try {
      if (mode === "rewrite") {
        await rewriteListing(listing, marketplace, language, (chunk) => {
          setStreamText((prev) => prev + chunk);
        });
      } else {
        await suggestKeywords(
          listing.title,
          "",
          marketplace,
          (chunk) => {
            setStreamText((prev) => prev + chunk);
          }
        );
      }
    } catch (e) {
      setStreamText("⚠️ API 连接失败，请确认后端服务已启动（localhost:8787）");
    } finally {
      setIsStreaming(false);
    }
  };

  if (!isOnSellerCentral) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400 p-6">
        <span className="text-4xl">🏪</span>
        <p className="text-sm text-center">
          请打开 Amazon Seller Central<br />Listing 编辑页以启用流量优化功能
        </p>
        <p className="text-xs text-gray-300 text-center">
          支持：美国/日本/德国/法国/西班牙/英国站
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      {/* 读取 Listing */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">当前 Listing</span>
          <button
            onClick={readListing}
            className="text-xs px-2.5 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            读取表单
          </button>
        </div>
        {listing ? (
          <div className="space-y-1">
            <p className="text-xs text-gray-600 line-clamp-2">{listing.title}</p>
            <p className="text-xs text-gray-400">{listing.bulletPoints.length} 条卖点 · {listing.description.length} 字描述</p>
          </div>
        ) : (
          <p className="text-xs text-gray-400">点击「读取表单」从当前 Listing 编辑页读取内容</p>
        )}
      </div>

      {/* 模式 + 参数 */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("rewrite")}
            className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${
              mode === "rewrite" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            AI 改写 Listing
          </button>
          <button
            onClick={() => setMode("keywords")}
            className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${
              mode === "keywords" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            关键词建议
          </button>
        </div>

        {mode === "rewrite" && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">目标市场</label>
              <select
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
              >
                {marketplaces.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">目标语言</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
              >
                {languages.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button
          onClick={runAI}
          disabled={!listing || isStreaming}
          className="w-full py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isStreaming ? "AI 分析中..." : mode === "rewrite" ? "一键 AI 优化" : "生成关键词建议"}
        </button>
      </div>

      {/* 流式输出区 */}
      {(streamText || isStreaming) && (
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">AI 优化结果</span>
            {!isStreaming && streamText && (
              <button
                onClick={fillBack}
                className="text-xs px-2.5 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                一键回填
              </button>
            )}
          </div>
          <div className="stream-box max-h-48 overflow-y-auto text-gray-600 bg-gray-50 rounded-lg p-2">
            {streamText}
            {isStreaming && <span className="animate-pulse">▌</span>}
          </div>
        </div>
      )}
    </div>
  );
}
