"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const User = () => {
  const { address: connectedAddress } = useAccount();
  const [searchTokenId, setSearchTokenId] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const { data: photoInfo, refetch: fetchInfo } = useScaffoldReadContract({
    contractName: "AuthPix",
    functionName: "getPhotoInfo",
    args: [searchTokenId ? BigInt(searchTokenId) : 0n],
  });

  const { data: total } = useScaffoldReadContract({
    contractName: "AuthPix",
    functionName: "totalSupply",
  });

  const { data: allTokens, refetch: getAll } = useScaffoldReadContract({
    contractName: "AuthPix",
    functionName: "getAllTokens",
  });

  const { data: merchantTokens, refetch: getByMerchant } = useScaffoldReadContract({
    contractName: "AuthPix",
    functionName: "getTokensByMerchant",
    args: [searchAddress],
  });

  const { data: modelTokens, refetch: getByModel } = useScaffoldReadContract({
    contractName: "AuthPix",
    functionName: "getTokensByModel",
    args: [searchAddress],
  });

  const { writeContractAsync: writeAuthPix } = useScaffoldWriteContract({ contractName: "AuthPix" });

  const isMerchant = photoInfo && connectedAddress === photoInfo[1];
  const isModel = photoInfo && connectedAddress === photoInfo[0];
  const canOperate = isMerchant || isModel;

  const handleAction = async (name: "burn" | "agreeBurn") => {
    setLoading(name);
    try {
      await writeAuthPix({
        functionName: name,
        args: [BigInt(searchTokenId)],
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(null);
  };

  const handleQuery = async (action: () => Promise<unknown>, name: string) => {
    setLoading(name);
    await action();
    setLoading(null);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-6 px-4 bg-[url('/in.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-white/70 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">User Dashboard (Total: {total?.toString()})</h2>

        {/* Query by Token ID */}
        <div className="w-full max-w-md p-3 bg-white/80 backdrop-blur rounded-xl shadow">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Token ID"
              className="input input-bordered flex-1"
              value={searchTokenId}
              onChange={e => setSearchTokenId(e.target.value)}
            />
            <button
              className={`btn btn-primary ${loading === "search" ? "loading" : ""}`}
              onClick={() => handleQuery(fetchInfo, "search")}
              disabled={!!loading}
            >
              {loading === "search" ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Query by Address */}
        <div className="w-full max-w-md p-3 bg-white/80 backdrop-blur rounded-xl shadow">
          <input
            type="text"
            placeholder="Search by Address"
            className="input input-bordered w-full mb-2"
            value={searchAddress}
            onChange={e => setSearchAddress(e.target.value)}
          />
          <div className="flex gap-2 justify-center">
            <button
              className={`btn btn-secondary btn-sm ${loading === "all" ? "loading" : ""}`}
              onClick={() => handleQuery(getAll, "all")}
              disabled={!!loading}
            >
              {loading === "all" ? "Loading..." : "All Tokens"}
            </button>
            <button
              className={`btn btn-secondary btn-sm ${loading === "merchant" ? "loading" : ""}`}
              onClick={() => handleQuery(getByMerchant, "merchant")}
              disabled={!!loading}
            >
              {loading === "merchant" ? "Loading..." : "By Merchant"}
            </button>
            <button
              className={`btn btn-secondary btn-sm ${loading === "model" ? "loading" : ""}`}
              onClick={() => handleQuery(getByModel, "model")}
              disabled={!!loading}
            >
              {loading === "model" ? "Loading..." : "By Model"}
            </button>
          </div>
        </div>

        {/* Token Info & Actions */}
        {photoInfo && (
          <div className="w-full max-w-md p-3 bg-white/80 backdrop-blur rounded-xl shadow">
            <h3 className="font-bold mb-1">Token #{searchTokenId}</h3>
            <div className="text-xs space-y-0.5 mb-2">
              <p>Model: {photoInfo[0]}</p>
              <p>Merchant: {photoInfo[1]}</p>
              <p>
                Metadata:{" "}
                <a href={photoInfo[2]} target="_blank" className="link link-primary">
                  View
                </a>
              </p>
            </div>

            {canOperate && (
              <div className="flex gap-2 justify-center mt-2">
                <button
                  className={`btn btn-warning btn-sm ${loading === "agreeBurn" ? "loading" : ""}`}
                  onClick={() => handleAction("agreeBurn")}
                  disabled={!!loading}
                >
                  {loading === "agreeBurn" ? "Processing..." : "Agree Burn"}
                </button>
                <button
                  className={`btn btn-error btn-sm ${loading === "burn" ? "loading" : ""}`}
                  onClick={() => handleAction("burn")}
                  disabled={!!loading}
                >
                  {loading === "burn" ? "Processing..." : "Confirm Burn"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Query Results */}
        <div className="w-full max-w-md p-3 bg-white/80 backdrop-blur rounded-xl shadow">
          <h3 className="font-bold text-sm mb-1 text-gray-700">Results:</h3>
          {allTokens && allTokens.length > 0 && (
            <p className="text-xs">All: {allTokens.map((id: bigint) => id.toString()).join(", ")}</p>
          )}
          {merchantTokens && merchantTokens.length > 0 && (
            <p className="text-xs">Merchant: {merchantTokens.map((id: bigint) => id.toString()).join(", ")}</p>
          )}
          {modelTokens && modelTokens.length > 0 && (
            <p className="text-xs">Model: {modelTokens.map((id: bigint) => id.toString()).join(", ")}</p>
          )}
        </div>
      </div>
    </div>
  );
};
