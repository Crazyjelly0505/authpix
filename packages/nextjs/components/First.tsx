"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { UserInfoWithTooltip } from "~~/components/UserInfoWithTooltip";
import { ghostBtn, inputStyle, primaryBtn, secondaryBtn } from "~~/components/ui/styles";
import { colors, emptyStateStyle, pageContainerStyle, productCardStyle, statusColors } from "~~/components/ui/styles";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

interface RequestState {
  merchant: string;
  model: string;
  detail: string;
  tokenURI: string;
}

interface Product {
  merchant: string;
  model: string;
  tokenid: bigint;
  requestAt: bigint;
  approveAt: bigint;
  mintAt: bigint;
  tokenURI: string;
  detail: string;
  report: boolean;
  burned: boolean;
}

// 格式化时间戳
const formatTimestamp = (timestamp: bigint) => {
  if (!timestamp || timestamp === 0n) return "-";
  return new Date(Number(timestamp) * 1000).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const First = () => {
  const [product, setProduct] = useState<Product[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [request, setRequest] = useState<RequestState>({
    merchant: "",
    model: "",
    detail: "",
    tokenURI: "",
  });
  const [hoveredId, setHoveredId] = useState<bigint | null>(null);
  const [reportingId, setReportingId] = useState<bigint | null>(null);
  const [registering, setRegistering] = useState(false);
  const [sending, setSending] = useState(false);

  const publicClient = usePublicClient();
  const { targetNetwork } = useTargetNetwork();
  const contractData = (deployedContracts as any)[targetNetwork.id]?.AuthPix;

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "AuthPix" });

  // ===================== 数据加载 =====================
  useEffect(() => {
    async function loadAll() {
      if (!publicClient || !contractData) return;

      const len = await publicClient.readContract({
        address: contractData.address,
        abi: contractData.abi,
        functionName: "nextTokenId",
        args: [],
      });

      const temp: Product[] = [];

      for (let i = 1n; i <= (len as bigint); i++) {
        try {
          const data = await publicClient.readContract({
            address: contractData.address,
            abi: contractData.abi,
            functionName: "getPhotoInfo",
            args: [i],
          });
          temp.push(data as Product);
        } catch (error) {
          console.error(`Failed to load product ${i}:`, error);
        }
      }
      setProduct(temp);
    }

    loadAll();
  }, [publicClient, contractData]);

  // ===================== Mint监听 =====================
  useEffect(() => {
    if (!publicClient || !contractData) return;

    const unwatch = publicClient.watchContractEvent({
      address: contractData.address,
      abi: contractData.abi,
      eventName: "Mint",
      onLogs: async logs => {
        for (const log of logs) {
          const { tokenId } = (log as any).args;
          if (!tokenId) continue;

          const data = await publicClient.readContract({
            address: contractData.address,
            abi: contractData.abi,
            functionName: "getPhotoInfo",
            args: [tokenId],
          });

          setProduct(prev => {
            const exist = prev.find(p => p.tokenid === tokenId);
            return exist ? prev : [...prev, data as Product];
          });
        }
      },
    });

    return () => unwatch?.();
  }, [publicClient, contractData]);

  // ===================== 合约操作 =====================
  const handleReport = async (tokenId: bigint) => {
    try {
      setReportingId(tokenId);
      await writeContractAsync({
        functionName: "report",
        args: [tokenId],
      });
      // 更新本地状态
      setProduct(prev => prev.map(p => (p.tokenid === tokenId ? { ...p, report: true } : p)));
    } catch (error) {
      console.error("举报失败:", error);
    } finally {
      setReportingId(null);
    }
  };

  const registerClick = async () => {
    try {
      setRegistering(true);
      await writeContractAsync({
        functionName: "registerModel",
      });
    } catch (e) {
      console.error("注册失败:", e);
    } finally {
      setRegistering(false);
    }
  };

  const requestClick = async () => {
    if (!request.model || !request.detail || !request.tokenURI) {
      alert("请填写完整信息");
      return;
    }
    try {
      setSending(true);
      await writeContractAsync({
        functionName: "createRequest",
        args: [request.model, request.detail, request.tokenURI],
      });
      setRequest({ merchant: "", model: "", detail: "", tokenURI: "" });
      setShowPanel(false);
    } catch (e) {
      console.error("发送请求失败:", e);
    } finally {
      setSending(false);
    }
  };

  if (!publicClient || !contractData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          color: colors.textMuted,
        }}
      >
        加载中...
      </div>
    );
  }

  // ===================== UI =====================
  return (
    <div style={pageContainerStyle}>
      {/* 空状态 */}
      {product.length === 0 && (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🖼️</div>
          <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>暂无商品</p>
          <p style={{ fontSize: 14 }}>当有授权商品发布时，将在这里显示</p>
        </div>
      )}

      {/* 商品网格 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 24,
        }}
      >
        {product.map(p => (
          <div
            key={p.tokenid.toString()}
            style={productCardStyle}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
            }}
          >
            {/* 图片区域 */}
            <div
              style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}
              onMouseEnter={() => setHoveredId(p.tokenid)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.tokenURI}
                alt="商品图片"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image";
                }}
              />

              {/* 悬停时显示时间信息 */}
              {hoveredId === p.tokenid && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ color: "#fff", textAlign: "center", fontSize: 13 }}>
                    <div style={{ marginBottom: 6 }}>申请: {formatTimestamp(p.requestAt)}</div>
                    <div style={{ marginBottom: 6 }}>批准: {formatTimestamp(p.approveAt)}</div>
                    <div>发布: {formatTimestamp(p.mintAt)}</div>
                  </div>
                </div>
              )}

              {/* 状态标签 */}
              <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                {p.report && (
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 500,
                      background: statusColors.reported.bg,
                      color: statusColors.reported.color,
                    }}
                  >
                    {statusColors.reported.text}
                  </span>
                )}
                {p.burned && (
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 500,
                      background: statusColors.burned.bg,
                      color: statusColors.burned.color,
                    }}
                  >
                    {statusColors.burned.text}
                  </span>
                )}
              </div>
            </div>

            {/* 信息区域 */}
            <div style={{ padding: 16 }}>
              <p
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  lineHeight: 1.5,
                  marginBottom: 12,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {p.detail}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <UserInfoWithTooltip address={p.merchant} type="merchant" />
                <UserInfoWithTooltip address={p.model} type="model" />
              </div>

              {/* 底部：ID 和 举报按钮 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <span style={{ fontSize: 12, color: colors.textMuted }}>#{p.tokenid.toString()}</span>
                {!p.burned && (
                  <button
                    onClick={() => handleReport(p.tokenid)}
                    disabled={p.report || reportingId === p.tokenid}
                    style={{
                      fontSize: 12,
                      color: p.report ? colors.textMuted : colors.textSecondary,
                      background: "transparent",
                      border: "none",
                      cursor: p.report ? "not-allowed" : "pointer",
                      padding: "4px 8px",
                      borderRadius: 4,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={e => {
                      if (!p.report) (e.target as HTMLButtonElement).style.color = colors.danger;
                    }}
                    onMouseLeave={e => {
                      if (!p.report) (e.target as HTMLButtonElement).style.color = colors.textSecondary;
                    }}
                  >
                    {p.report ? "已举报" : reportingId === p.tokenid ? "处理中..." : "举报"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 操作按钮 */}
      <button
        onClick={() => setShowPanel(true)}
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: colors.primary,
          color: "#fff",
          border: "none",
          fontSize: 20,
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => {
          (e.target as HTMLButtonElement).style.transform = "scale(1.05)";
        }}
        onMouseLeave={e => {
          (e.target as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        +
      </button>

      {/* 操作面板 */}
      {showPanel && (
        <div
          onClick={() => setShowPanel(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 16,
              width: 340,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 600 }}>操作面板</h3>

            {/* 注册 */}
            <button
              onClick={registerClick}
              disabled={registering}
              style={{ ...secondaryBtn, opacity: registering ? 0.6 : 1 }}
            >
              {registering ? "注册中..." : "注册成为模特"}
            </button>

            <div style={{ height: 1, background: "#e5e7eb", margin: "8px 0" }} />

            {/* 发送请求 */}
            <input
              value={request.model}
              onChange={e => setRequest(v => ({ ...v, model: e.target.value }))}
              placeholder="模特地址"
              style={inputStyle}
            />

            <input
              value={request.detail}
              onChange={e => setRequest(v => ({ ...v, detail: e.target.value }))}
              placeholder="商品详情描述"
              style={inputStyle}
            />

            <input
              value={request.tokenURI}
              onChange={e => setRequest(v => ({ ...v, tokenURI: e.target.value }))}
              placeholder="图片URL"
              style={inputStyle}
            />

            <button onClick={requestClick} disabled={sending} style={{ ...primaryBtn, opacity: sending ? 0.6 : 1 }}>
              {sending ? "发送中..." : "发送授权请求"}
            </button>

            <button onClick={() => setShowPanel(false)} style={ghostBtn}>
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
