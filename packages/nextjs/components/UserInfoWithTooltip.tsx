"use client";

import { useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface UserInfoWithTooltipProps {
  address: string;
  type: "merchant" | "model";
}

export const UserInfoWithTooltip = ({ address, type }: UserInfoWithTooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // 获取发布商品数量 - Hooks 必须在顶层调用
  const { data: count } = useScaffoldReadContract({
    contractName: "AuthPix",
    functionName: type === "merchant" ? "getMerchantCount" : "getModelCount",
    args: [address],
  });

  // 检查是否注册为模特
  const { data: isModel } = useScaffoldReadContract({
    contractName: "AuthPix",
    functionName: "isModel",
    args: [address],
  });

  // 地址无效时显示简单标签
  const isValidAddress = address && address.length >= 10;
  const truncatedAddress = isValidAddress ? `${address.slice(0, 6)}...${address.slice(-4)}` : "-";

  if (!isValidAddress) {
    return (
      <span style={{ fontSize: 13, color: "#9ca3af", padding: "2px 8px", background: "#f3f4f6", borderRadius: 4 }}>
        {type === "merchant" ? "商家" : "模特"}
      </span>
    );
  }

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        style={{
          fontSize: 13,
          color: "#6b7280",
          cursor: "pointer",
          transition: "color 0.2s",
          padding: "2px 8px",
          borderRadius: 4,
          background: "#f3f4f6",
        }}
      >
        {type === "merchant" ? "商家" : "模特"}
      </span>

      {showTooltip && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: 8,
            background: "#1f2937",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 10,
            fontSize: 12,
            minWidth: 180,
            zIndex: 50,
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>
            {type === "merchant" ? "商家信息" : "模特信息"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, color: "#d1d5db" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>地址:</span>
              <span style={{ fontFamily: "monospace", fontSize: 11 }}>{truncatedAddress}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>发布商品:</span>
              <span style={{ fontWeight: 500 }}>{count?.toString() || 0} 件</span>
            </div>
            {type === "model" && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>注册状态:</span>
                <span style={{ color: isModel ? "#34d399" : "#f87171" }}>{isModel ? "已注册" : "未注册"}</span>
              </div>
            )}
          </div>
          {/* 小三角 */}
          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 12,
              height: 12,
              background: "#1f2937",
            }}
          />
        </div>
      )}
    </div>
  );
};
