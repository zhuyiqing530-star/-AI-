// Listing 质量评分与机会分析模块

export interface AnalysisResult {
  qualityScore: number;    // 0-100，Listing 质量分
  opportunityScore: number; // 0-100，越高越值得开发为客户
  gaps: string[];           // 具体缺口描述
  details: ScoreDetail[];   // 各维度详情
}

interface ScoreDetail {
  dimension: string;
  score: number;
  maxScore: number;
  label: string;
}

export function analyzeListing(data: {
  title: string;
  bullets: string[];
  description: string;
  hasVideo: boolean;
  hasMultiLanguage: boolean;
}): AnalysisResult {
  const details: ScoreDetail[] = [];
  const gaps: string[] = [];

  // 维度1：标题长度（满分 20）
  const titleLen = data.title.trim().length;
  let titleScore = 0;
  if (titleLen >= 150) {
    titleScore = 20;
  } else if (titleLen >= 80) {
    titleScore = 10;
    gaps.push("标题偏短（建议150字以上）");
  } else {
    titleScore = 0;
    gaps.push("标题过短");
  }
  details.push({ dimension: "标题完整性", score: titleScore, maxScore: 20, label: `${titleLen}字` });

  // 维度2：卖点数量（满分 20）
  const bulletCount = data.bullets.filter((b) => b.trim().length > 10).length;
  let bulletScore = 0;
  if (bulletCount >= 5) {
    bulletScore = 20;
  } else if (bulletCount >= 3) {
    bulletScore = 10;
    gaps.push(`卖点不足（当前${bulletCount}条，建议5条）`);
  } else {
    bulletScore = 0;
    gaps.push("卖点严重不足");
  }
  details.push({ dimension: "卖点数量", score: bulletScore, maxScore: 20, label: `${bulletCount}条` });

  // 维度3：是否有推广视频（满分 20）
  const videoScore = data.hasVideo ? 20 : 0;
  if (!data.hasVideo) {
    gaps.push("缺少商品视频");
  }
  details.push({ dimension: "视频内容", score: videoScore, maxScore: 20, label: data.hasVideo ? "已有视频" : "无视频" });

  // 维度4：多语言覆盖（满分 20）
  const langScore = data.hasMultiLanguage ? 20 : 0;
  if (!data.hasMultiLanguage) {
    gaps.push("仅英语版本，缺少日/德/法/西班牙语");
  }
  details.push({ dimension: "多语言覆盖", score: langScore, maxScore: 20, label: data.hasMultiLanguage ? "多语言" : "仅英语" });

  // 维度5：描述完整性（满分 20）
  const descLen = data.description.trim().length;
  let descScore = 0;
  if (descLen >= 500) {
    descScore = 20;
  } else if (descLen >= 100) {
    descScore = 10;
    gaps.push("产品描述偏短");
  } else {
    descScore = 0;
    gaps.push("缺少产品描述");
  }
  details.push({ dimension: "描述完整性", score: descScore, maxScore: 20, label: `${descLen}字` });

  const qualityScore = titleScore + bulletScore + videoScore + langScore + descScore;
  const opportunityScore = 100 - qualityScore;

  return { qualityScore, opportunityScore, gaps, details };
}

// 机会等级标签
export function getOpportunityLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "高价值线索", color: "text-red-500" };
  if (score >= 60) return { label: "中等价值", color: "text-orange-500" };
  if (score >= 40) return { label: "低价值", color: "text-yellow-500" };
  return { label: "已优化，价值低", color: "text-gray-400" };
}
