"use client";

import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

export const Notice = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [requestList, setRequestList] = useState<any[]>([]);

  const { targetNetwork } = useTargetNetwork();
  const contractData = (deployedContracts as any)[targetNetwork.id]?.AuthPix;

  const { data: historyRequests, refetch } = useScaffoldReadContract({
    contractName: "AuthPix",
    functionName: "getRequestsForModel" as any,
    account: address,
  });

  const { writeContractAsync: respond } = useScaffoldWriteContract({
    contractName: "AuthPix",
  });

  useEffect(() => {
    if (!historyRequests) return;
    setRequestList([...historyRequests]);
  }, [historyRequests]);

  //监听事件
  useEffect(() => {
    if (!address || !publicClient || !contractData) return;

    const unwatch = publicClient.watchContractEvent({
      address: contractData.address,
      abi: contractData.abi,
      eventName: "CreateRequest",
      args: { model: address } as any,
      onLogs: () => {
        refetch();
      },
    });

    return () => unwatch?.();
  }, [address, publicClient, contractData, refetch]);

  const handleAction = async (id: number, agree: boolean) => {
    try {
      await (respond as any)({
        functionName: "approveRequest",
        args: [BigInt(id), agree],
      });
      refetch();
    } catch (e) {
      console.error(e);
    }
  };

  //防 undefined
  if (!publicClient || !contractData) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>🔔 通知中心</h2>

      {requestList.length === 0 ? (
        <p>暂无请求</p>
      ) : (
        requestList.map((req, index) => (
          <div key={index} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <p>商家: {req.merchant}</p>
            <p>详情: {req.detail}</p>
            <p>图片: {req.tokenURI}</p>

            <p>时间: {req.createAt ? new Date(Number(req.createAt) * 1000).toLocaleString() : "-"}</p>

            {!req.isApproved && !req.isReject ? (
              <>
                <button onClick={() => handleAction(index, true)}>同意</button>
                <button onClick={() => handleAction(index, false)}>拒绝</button>
              </>
            ) : (
              <p>{req.isApproved ? "已同意" : "已拒绝"}</p>
            )}

            {req.isMinted && <p>✅ 已铸造</p>}
          </div>
        ))
      )}
    </div>
  );
};
