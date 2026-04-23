"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
//引用样式
import { ghostBtn, inputStyle, primaryBtn, secondaryBtn } from "~~/components/ui/styles";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

interface RequestState {
  merchant: string;
  model: string;
  detail: string;
  tokenURI: string;
}

export const First = () => {
  const [product, setProduct] = useState<any[]>([]);
  const [reportId, setReportId] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [request, setRequest] = useState<RequestState>({
    merchant: "",
    model: "",
    detail: "",
    tokenURI: "",
  });

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

      const temp: any[] = [];

      for (let i = 1n; i <= (len as bigint); i++) {
        try {
          const data = await publicClient.readContract({
            address: contractData.address,
            abi: contractData.abi,
            functionName: "getPhotoInfo",
            args: [i],
          });
          temp.push(data);
        } catch {}
      }
      setProduct(temp);
    }

    loadAll();
  }, [publicClient, contractData]);

  // ===================== Mint监听 =====================
  useEffect(() => {
    if (!publicClient || !contractData) return;

    console.log("network id:", targetNetwork.id);
    console.log("contractData:", contractData);
    console.log("abi:", contractData?.abi);

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
            const exist = prev.find(p => String(p.tokenid) === String(tokenId));
            return exist ? prev : [...prev, data];
          });
        }
      },
    });

    return () => unwatch?.();
  }, [publicClient, contractData]);

  // ===================== 合约操作 =====================
  const reportClick = async () => {
    if (!reportId) return;

    await (writeContractAsync as any)({
      functionName: "report",
      args: [BigInt(reportId)],
    });
  };

  const registerClick = async () => {
    await writeContractAsync({
      functionName: "registerModel",
    });
  };

  const requestClick = async () => {
    await (writeContractAsync as any)({
      functionName: "createRequest",
      args: [request.model, request.detail, request.tokenURI],
    });
  };

  if (!publicClient || !contractData) {
    return <div>Loading...</div>;
  }

  // ===================== UI =====================
  return (
    <div style={{ padding: 30, background: "#f5f7fb", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: 20 }}>🖼️ AuthPix 市场</h2>

      {/* 商品 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
        {product.map((p, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            <img src={p.tokenURI} style={{ width: "100%", height: 200, objectFit: "cover" }} />

            <div style={{ padding: 12 }}>
              <p>
                <b>ID:</b> {p.tokenid?.toString()}
              </p>
              <p>
                <b>商家:</b> {p.merchant}
              </p>
              <p style={{ color: "#666", fontSize: 14 }}>{p.detail}</p>

              <div style={{ marginTop: 8 }}>
                {p.report && <span style={{ color: "#f59e0b" }}>⚠ 举报</span>}
                {p.burned && <span style={{ color: "#ef4444", marginLeft: 8 }}>🚫 下架</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ⚙ 按钮 */}
      <button
        onClick={() => setShowPanel(true)}
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#4f46e5",
          color: "#fff",
          border: "none",
          fontSize: 24,
          cursor: "pointer",
        }}
      >
        ⚙
      </button>

      {/* ===================== 面板 ===================== */}
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
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 16,
              width: 320,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <h3>操作面板</h3>

            {/* 举报 */}
            <input
              value={reportId}
              onChange={e => setReportId(e.target.value)}
              placeholder="输入ID举报"
              style={inputStyle}
            />
            <button onClick={reportClick} style={primaryBtn}>
              举报
            </button>

            {/* 注册 */}
            <button onClick={registerClick} style={secondaryBtn}>
              注册成为模特
            </button>

            {/* 请求 */}
            <input
              value={request.model}
              onChange={e => setRequest(v => ({ ...v, model: e.target.value }))}
              placeholder="模特地址"
              style={inputStyle}
            />

            <input
              value={request.detail}
              onChange={e => setRequest(v => ({ ...v, detail: e.target.value }))}
              placeholder="详情"
              style={inputStyle}
            />

            <input
              value={request.tokenURI}
              onChange={e => setRequest(v => ({ ...v, tokenURI: e.target.value }))}
              placeholder="TokenURI"
              style={inputStyle}
            />

            <button onClick={requestClick} style={primaryBtn}>
              发送请求
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
