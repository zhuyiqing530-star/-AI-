// 线索数据库 —— 使用 chrome.storage.local 持久化

export interface Lead {
  id: string;
  asin: string;
  productTitle: string;      // 商品名（截断）
  sellerName: string;
  brand: string;
  marketplace: string;       // US / JP / DE / FR / ES / UK
  opportunityScore: number;  // 0-100
  qualityScore: number;
  gaps: string[];            // ['缺视频', '仅英语']
  isChinese: boolean;
  chineseSignals: string[];
  imageUrl: string;
  productUrl: string;
  status: LeadStatus;
  notes: string;
  addedAt: string;           // ISO 8601
  contactedAt?: string;
  updatedAt: string;
}

export type LeadStatus = "pending" | "contacted" | "following" | "converted" | "invalid";

const STORAGE_KEY = "videolingo_leads";

// 读取所有线索
export async function getAllLeads(): Promise<Lead[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as Lead[]) || [];
}

// 添加线索（若 ASIN 已存在则更新评分）
export async function addLead(lead: Omit<Lead, "id" | "addedAt" | "updatedAt" | "status" | "notes">): Promise<Lead> {
  const leads = await getAllLeads();
  const existing = leads.find((l) => l.asin === lead.asin && l.marketplace === lead.marketplace);

  const now = new Date().toISOString();

  if (existing) {
    // 更新已有线索的评分
    const updated = {
      ...existing,
      opportunityScore: lead.opportunityScore,
      qualityScore: lead.qualityScore,
      gaps: lead.gaps,
      updatedAt: now,
    };
    const newList = leads.map((l) => (l.id === existing.id ? updated : l));
    await chrome.storage.local.set({ [STORAGE_KEY]: newList });
    return updated;
  }

  const newLead: Lead = {
    ...lead,
    id: crypto.randomUUID(),
    status: "pending",
    notes: "",
    addedAt: now,
    updatedAt: now,
  };
  await chrome.storage.local.set({ [STORAGE_KEY]: [...leads, newLead] });
  return newLead;
}

// 更新线索状态
export async function updateLeadStatus(id: string, status: LeadStatus, notes?: string): Promise<void> {
  const leads = await getAllLeads();
  const updated = leads.map((l) =>
    l.id === id
      ? {
          ...l,
          status,
          notes: notes ?? l.notes,
          updatedAt: new Date().toISOString(),
          contactedAt: status === "contacted" ? new Date().toISOString() : l.contactedAt,
        }
      : l
  );
  await chrome.storage.local.set({ [STORAGE_KEY]: updated });
}

// 删除线索
export async function deleteLead(id: string): Promise<void> {
  const leads = await getAllLeads();
  await chrome.storage.local.set({
    [STORAGE_KEY]: leads.filter((l) => l.id !== id),
  });
}

// 导出为 CSV 字符串
export async function exportLeadsCSV(): Promise<string> {
  const leads = await getAllLeads();
  const headers = [
    "ASIN", "商品名", "卖家名", "品牌", "站点",
    "机会分", "缺口", "是否中国卖家", "状态", "备注", "添加时间",
  ];
  const rows = leads.map((l) => [
    l.asin,
    `"${l.productTitle.replace(/"/g, '""')}"`,
    `"${l.sellerName}"`,
    `"${l.brand}"`,
    l.marketplace,
    l.opportunityScore,
    `"${l.gaps.join("; ")}"`,
    l.isChinese ? "是" : "否",
    l.status,
    `"${l.notes}"`,
    l.addedAt,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// 获取统计摘要
export async function getStats(): Promise<{ total: number; pending: number; contacted: number; converted: number }> {
  const leads = await getAllLeads();
  return {
    total: leads.length,
    pending: leads.filter((l) => l.status === "pending").length,
    contacted: leads.filter((l) => l.status === "contacted" || l.status === "following").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };
}
