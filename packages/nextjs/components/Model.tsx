"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const Model = () => {
  const [tokenId, setTokenId] = useState("");
  const [merchantAddress, setMerchantAddress] = useState("");
  const [ipfs, setIpfs] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const { writeContractAsync: writeAuthPix } = useScaffoldWriteContract({ contractName: "AuthPix" });

  const handleIdAction = async (name: "burn" | "agreeBurn") => {
    if (!tokenId) {
      toast.error("Please enter Token ID");
      return;
    }
    setLoading(name);
    try {
      await writeAuthPix({
        functionName: name,
        args: [BigInt(tokenId)],
      });
      toast.success(`${name === "burn" ? "Burn" : "Agree"} transaction submitted!`);
    } catch (e) {
      console.error(e);
      toast.error("Transaction failed. Please try again.");
    }
    setLoading(null);
  };

  const mintOnclick = async () => {
    if (!ipfs) {
      toast.error("Please enter IPFS URI");
      return;
    }
    if (!merchantAddress) {
      toast.error("Please enter Merchant Address");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(merchantAddress)) {
      toast.error("Invalid merchant address format");
      return;
    }

    setLoading("mint");
    try {
      await writeAuthPix({
        functionName: "mint",
        args: [ipfs, merchantAddress],
      });
      toast.success("NFT minted successfully!");
      setIpfs("");
      setMerchantAddress("");
    } catch (e) {
      console.error(e);
      toast.error("Mint failed. Make sure you are registered as a model.");
    }
    setLoading(null);
  };

  const registerModel = async () => {
    setLoading("register");
    try {
      await writeAuthPix({
        functionName: "registerModel",
      });
      toast.success("Registered as Model successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Registration failed. You may already be registered.");
    }
    setLoading(null);
  };

  const { data: total } = useScaffoldReadContract({
    contractName: "AuthPix",
    functionName: "totalSupply",
  });

  const { data: photoInfo, refetch: getInfo } = useScaffoldReadContract({
    contractName: "AuthPix",
    functionName: "getPhotoInfo",
    args: [BigInt(tokenId || 0)],
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

  const handleQuery = async (action: () => Promise<unknown>, name: string) => {
    setLoading(name);
    try {
      await action();
      toast.success("Query completed!");
    } catch (e) {
      console.error(e);
      toast.error("Query failed.");
    }
    setLoading(null);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-6 px-4 bg-[url('/in.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-white/70 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Model Dashboard (Total: {total?.toString()})</h2>

        {/* Register & Mint */}
        <div className="w-full max-w-md p-3 bg-white/80 backdrop-blur rounded-xl shadow">
          <h3 className="font-semibold text-sm text-gray-600 mb-2">Register & Mint</h3>
          <div className="flex gap-2 mb-2">
            <input
              className="input input-bordered flex-1 text-sm"
              type="text"
              placeholder="IPFS URI (required)"
              value={ipfs}
              onChange={e => setIpfs(e.target.value)}
            />
            <input
              className="input input-bordered flex-1 text-sm"
              type="text"
              placeholder="Merchant Address (required)"
              value={merchantAddress}
              onChange={e => setMerchantAddress(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              className={`btn btn-outline btn-sm flex-1 ${loading === "register" ? "loading" : ""}`}
              onClick={registerModel}
              disabled={!!loading}
            >
              {loading === "register" ? "Registering..." : "Register as Model"}
            </button>
            <button
              className={`btn btn-primary btn-sm flex-1 ${loading === "mint" ? "loading" : ""}`}
              onClick={mintOnclick}
              disabled={!!loading}
            >
              {loading === "mint" ? "Minting..." : "Mint NFT"}
            </button>
          </div>
        </div>

        {/* Query */}
        <div className="w-full max-w-md p-3 bg-white/80 backdrop-blur rounded-xl shadow">
          <h3 className="font-semibold text-sm text-gray-600 mb-2">Query & Actions</h3>
          <div className="flex gap-2 mb-2">
            <input
              className="input input-bordered flex-1 text-sm"
              type="number"
              placeholder="Token ID"
              value={tokenId}
              onChange={e => setTokenId(e.target.value)}
            />
            <input
              className="input input-bordered flex-1 text-sm"
              type="text"
              placeholder="Search Address"
              value={searchAddress}
              onChange={e => setSearchAddress(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              className={`btn btn-secondary btn-sm ${loading === "info" ? "loading" : ""}`}
              onClick={() => handleQuery(getInfo, "info")}
              disabled={!!loading}
            >
              {loading === "info" ? "Loading..." : "Info"}
            </button>
            <button
              className={`btn btn-secondary btn-sm ${loading === "all" ? "loading" : ""}`}
              onClick={() => handleQuery(getAll, "all")}
              disabled={!!loading}
            >
              {loading === "all" ? "Loading..." : "All"}
            </button>
            <button
              className={`btn btn-secondary btn-sm ${loading === "merchant" ? "loading" : ""}`}
              onClick={() => handleQuery(getByMerchant, "merchant")}
              disabled={!!loading}
            >
              {loading === "merchant" ? "Loading..." : "By Merchant"}
            </button>
            <button
              className={`btn btn-warning btn-sm ${loading === "agreeBurn" ? "loading" : ""}`}
              onClick={() => handleIdAction("agreeBurn")}
              disabled={!!loading}
            >
              {loading === "agreeBurn" ? "Processing..." : "Agree Burn"}
            </button>
            <button
              className={`btn btn-error btn-sm ${loading === "burn" ? "loading" : ""}`}
              onClick={() => handleIdAction("burn")}
              disabled={!!loading}
            >
              {loading === "burn" ? "Processing..." : "Burn"}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="w-full max-w-md p-3 bg-white/80 backdrop-blur rounded-xl shadow">
          <h3 className="font-bold text-sm mb-1 text-gray-700">Result:</h3>
          {photoInfo && (
            <div className="text-xs space-y-0.5">
              <p>Model: {photoInfo[0]}</p>
              <p>Merchant: {photoInfo[1]}</p>
              <p>
                URI:{" "}
                <a href={photoInfo[2]} target="_blank" className="link link-primary">
                  View
                </a>
              </p>
            </div>
          )}
          {allTokens && allTokens.length > 0 && (
            <p className="text-xs">All IDs: {allTokens.map((id: bigint) => id.toString()).join(", ")}</p>
          )}
          {merchantTokens && merchantTokens.length > 0 && (
            <p className="text-xs">Merchant Tokens: {merchantTokens.map((id: bigint) => id.toString()).join(", ")}</p>
          )}
          {!photoInfo && !allTokens && !merchantTokens && (
            <p className="text-xs text-gray-400">No results yet. Try a query above.</p>
          )}
        </div>
      </div>
    </div>
  );
};
