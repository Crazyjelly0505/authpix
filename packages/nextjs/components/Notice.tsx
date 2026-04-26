"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { UserInfoWithTooltip } from "~~/components/UserInfoWithTooltip";
import {
  colors,
  emptyStateStyle,
  pageContainerStyle,
  requestCardStyle,
  smallPrimaryBtn,
  smallSecondaryBtn,
  smallSuccessBtn,
  statusColors,
  viewTabActiveStyle,
  viewTabInactiveStyle,
} from "~~/components/ui/styles";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

type ViewMode = "received" | "sent";

interface Request {
  id: bigint;
  merchant: string;
  model: string;
  tokenURI: string;
  detail: string;
  createAt: bigint;
  agrOrRejAt: bigint;
  isApproved: boolean;
  isReject: boolean;
  isMinted: boolean;
}

// 格式化时间
const formatTime = (timestamp: bigint) => {
  if (!timestamp || timestamp === 0n) return "-";
  return new Date(Number(timestamp) * 1000).toLocaleString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusStyle = (req: Request) => {
  if (req.isMinted) return statusColors.minted;
  if (req.isApproved) return statusColors.approved;
  if (req.isReject) return statusColors.rejected;
  return statusColors.pending;
};

export const Notice = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [viewMode, setViewMode] = useState<ViewMode>("received");
  const [processingId, setProcessingId] = useState<bigint | null>(null);

  const { targetNetwork } = useTargetNetwork();
  const contractData = (deployedContracts as any)[targetNetwork.id]?.AuthPix;

  // 获取模特收到的请求
  const { data: receivedRequests, refetch: refetchReceived } = useScaffoldReadContract({
    contractName: "AuthPix",
    functionName: "getRequestsForModel",
    args: [address],
    watch: true,
  });

  // 获取商家发出的请求
  const { data: sentRequests, refetch: refetchSent } = useScaffoldReadContract({
    contractName: "AuthPix",
    functionName: "getRequestsForMerchant",
    args: [address],
    watch: true,
  });

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "AuthPix",
  });

  // 监听事件
  useEffect(() => {
    if (!address || !publicClient || !contractData) return;

    const unwatch = publicClient.watchContractEvent({
      address: contractData.address,
      abi: contractData.abi,
      eventName: "CreateRequest",
      onLogs: () => {
        refetchReceived();
        refetchSent();
      },
    });

    return () => unwatch?.();
  }, [address, publicClient, contractData, refetchReceived, refetchSent]);

  const handleApprove = async (id: bigint, agree: boolean) => {
    try {
      setProcessingId(id);
      await writeContractAsync({
        functionName: "approveRequest",
        args: [id, agree],
      });
      refetchReceived();
    } catch (e) {
      console.error(e);
      alert(agree ? "同意请求失败" : "拒绝请求失败");
    } finally {
      setProcessingId(null);
    }
  };

  const handleMint = async (id: bigint) => {
    try {
      setProcessingId(id);
      await writeContractAsync({
        functionName: "mint",
        args: [id],
      });
      refetchSent();
    } catch (e) {
      console.error(e);
      alert("铸造失败");
    } finally {
      setProcessingId(null);
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

  const requests = viewMode === "received" ? receivedRequests : sentRequests;

  return (
    <div style={pageContainerStyle}>
      {/* 视图切换 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setViewMode("received")}
          style={viewMode === "received" ? viewTabActiveStyle : viewTabInactiveStyle}
        >
          收到的请求
        </button>
        <button
          onClick={() => setViewMode("sent")}
          style={viewMode === "sent" ? viewTabActiveStyle : viewTabInactiveStyle}
        >
          发出的请求
        </button>
      </div>

      {/* 空状态 */}
      {(!requests || requests.length === 0) && (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
          <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
            暂无{viewMode === "received" ? "收到的" : "发出的"}请求
          </p>
          <p style={{ fontSize: 14 }}>
            {viewMode === "received" ? "当有商家向您发送授权请求时，将在这里显示" : "您发送的授权请求将在这里显示"}
          </p>
        </div>
      )}

      {/* 请求列表 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {requests?.map((req: Request, index: number) => {
          const status = getStatusStyle(req);

          return (
            <div key={index} style={requestCardStyle}>
              {/* 图片 */}
              <div
                style={{
                  width: 120,
                  height: 90,
                  borderRadius: 8,
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "#f3f4f6",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={req.tokenURI}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={e => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/120x90?text=Image";
                  }}
                />
              </div>

              {/* 内容 */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 14, color: colors.textPrimary, lineHeight: 1.5, maxWidth: 400 }}>
                    {req.detail}
                  </div>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 500,
                      background: status.bg,
                      color: status.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {status.text}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 13, color: colors.textSecondary }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>申请时间:</span>
                    <span>{formatTime(req.createAt)}</span>
                  </div>
                  {req.agrOrRejAt > 0n && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>处理时间:</span>
                      <span>{formatTime(req.agrOrRejAt)}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    <UserInfoWithTooltip address={req.merchant} type="merchant" />
                    <UserInfoWithTooltip address={req.model} type="model" />
                  </div>

                  {/* 操作按钮 */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {/* 模特视图：同意/拒绝 */}
                    {viewMode === "received" && !req.isApproved && !req.isReject && (
                      <>
                        <button
                          onClick={() => handleApprove(req.id, true)}
                          disabled={processingId === req.id}
                          style={{ ...smallPrimaryBtn, opacity: processingId === req.id ? 0.6 : 1 }}
                        >
                          同意
                        </button>
                        <button
                          onClick={() => handleApprove(req.id, false)}
                          disabled={processingId === req.id}
                          style={smallSecondaryBtn}
                        >
                          拒绝
                        </button>
                      </>
                    )}

                    {/* 商家视图：铸造 */}
                    {viewMode === "sent" && req.isApproved && !req.isMinted && (
                      <button
                        onClick={() => handleMint(req.id)}
                        disabled={processingId === req.id}
                        style={{ ...smallSuccessBtn, opacity: processingId === req.id ? 0.6 : 1 }}
                      >
                        {processingId === req.id ? "铸造中..." : "铸造NFT"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
