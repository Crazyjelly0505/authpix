export const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  outline: "none",
  fontSize: "14px",
  transition: "all 0.2s",
  width: "100%",
};

export const primaryBtn: React.CSSProperties = {
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: "#4f46e5",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  width: "100%",
};

export const secondaryBtn: React.CSSProperties = {
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  background: "#f9fafb",
  cursor: "pointer",
  width: "100%",
};

export const ghostBtn: React.CSSProperties = {
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: "transparent",
  color: "#666",
  cursor: "pointer",
  width: "100%",
};

export const headerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 20px",
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid #eee",
};

export const navStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
};

export const navBtn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "14px",
  color: "#666",
  transition: "0.2s",
};

export const activeNavBtn: React.CSSProperties = {
  background: "#4f46e5",
  color: "#fff",
  fontWeight: 600,
};

export const rightStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

// ========== 新增样式 ==========

// 专业卡片样式
export const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  transition: "all 0.2s ease",
};

// Tooltip 容器样式
export const tooltipContainerStyle: React.CSSProperties = {
  position: "relative",
  display: "inline-block",
};

// Tooltip 内容样式
export const tooltipContentStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "100%",
  left: "50%",
  transform: "translateX(-50%)",
  marginBottom: 8,
  background: "#1f2937",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 8,
  fontSize: 12,
  minWidth: 160,
  zIndex: 50,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

// 状态标签样式
export const statusBadgeStyle: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 500,
  display: "inline-flex",
  alignItems: "center",
};

// 空状态样式
export const emptyStateStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "80px 20px",
  color: "#9ca3af",
};

// 视图切换按钮样式
export const viewTabStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

export const viewTabActiveStyle: React.CSSProperties = {
  ...viewTabStyle,
  background: "#4f46e5",
  color: "#fff",
};

export const viewTabInactiveStyle: React.CSSProperties = {
  ...viewTabStyle,
  background: "#f3f4f6",
  color: "#6b7280",
};

// ========== 色彩主题 ==========

// 主色调
export const colors = {
  primary: "#4f46e5",
  primaryHover: "#4338ca",
  success: "#047857",
  warning: "#b45309",
  danger: "#dc2626",
  textPrimary: "#374151",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  background: "#f8fafc",
  cardBackground: "#ffffff",
  border: "#e5e7eb",
};

// 状态标签颜色
export const statusColors = {
  pending: { bg: "#fef3c7", color: "#b45309", text: "待处理" },
  approved: { bg: "#d1fae5", color: "#047857", text: "已同意" },
  rejected: { bg: "#fee2e2", color: "#dc2626", text: "已拒绝" },
  minted: { bg: "#dbeafe", color: "#1d4ed8", text: "已铸造" },
  reported: { bg: "#fef3c7", color: "#b45309", text: "已举报" },
  burned: { bg: "#fee2e2", color: "#dc2626", text: "已下架" },
};

// ========== 商品卡片样式 ==========

export const productCardStyle: React.CSSProperties = {
  background: colors.cardBackground,
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  transition: "all 0.2s ease",
};

export const productImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

// ========== 请求卡片样式 ==========

export const requestCardStyle: React.CSSProperties = {
  background: colors.cardBackground,
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  display: "flex",
  gap: 20,
};

// ========== 按钮样式 ==========

export const smallPrimaryBtn: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "none",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  background: colors.primary,
  color: "#fff",
};

export const smallSecondaryBtn: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  background: colors.cardBackground,
  color: colors.textSecondary,
};

export const smallSuccessBtn: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "none",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  background: colors.success,
  color: "#fff",
};

// ========== 页面容器样式 ==========

export const pageContainerStyle: React.CSSProperties = {
  padding: "20px 30px",
  background: colors.background,
  minHeight: "100vh",
};
