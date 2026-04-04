"use client";

import { useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const Model = () => {
  const [tokenId, setTokenId] = useState("");
  const [merchantAddress, setMerchantAddress] = useState("");
  const [ipfs, setIpfs] = useState("");
  const [searchAddress, setSearchAddress] = useState("");

  const { writeContractAsync: writeAuthPix } = useScaffoldWriteContract({ contractName: "AuthPix" });

  const handleIdAction = async (name: "burn" | "agreeBurn") => {
    if (!tokenId) return alert("请输入 Token ID");
    try {
      await writeAuthPix({
        functionName: name,
        args: [BigInt(tokenId)],
      });
    } catch (e) { console.error(e); }
  };

  const mintOnclick = async () => {
    try {
      await writeAuthPix({
        functionName: "mint",
        args: [ipfs, merchantAddress],
      });
    } catch (e) { console.error(e); }
  };

  const registerModel = async () => {
    try {
      await writeAuthPix({
        functionName: "registerModel",
      });
    } catch (e) { console.error(e); }
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

  return (
    <div className="relative min-h-screen pt-24 pb-6 px-4 bg-[url('/in.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-white/70 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Model Dashboard (Total: {total?.toString()})</h2>

        {/* Register & Mint */}
        <div className="w-full max-w-md p-3 bg-white/80 backdrop-blur rounded-xl shadow">
          <div className="flex gap-2 mb-2">
            <input
              className="input input-bordered flex-1"
              type="text"
              placeholder="IPFS URI"
              value={ipfs}
              onChange={e => setIpfs(e.target.value)}
            />
            <input
              className="input input-bordered flex-1"
              type="text"
              placeholder="Merchant Address"
              value={merchantAddress}
              onChange={e => setMerchantAddress(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm flex-1" onClick={registerModel}>Register</button>
            <button className="btn btn-primary btn-sm flex-1" onClick={mintOnclick}>Mint NFT</button>
          </div>
        </div>

        {/* Query */}
        <div className="w-full max-w-md p-3 bg-white/80 backdrop-blur rounded-xl shadow">
          <div className="flex gap-2 mb-2">
            <input
              className="input input-bordered flex-1"
              type="number"
              placeholder="Token ID"
              value={tokenId}
              onChange={e => setTokenId(e.target.value)}
            />
            <input
              className="input input-bordered flex-1"
              type="text"
              placeholder="Search Address"
              value={searchAddress}
              onChange={e => setSearchAddress(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-center">
            <button className="btn btn-secondary btn-sm" onClick={() => getInfo()}>Info</button>
            <button className="btn btn-secondary btn-sm" onClick={() => getAll()}>All</button>
            <button className="btn btn-secondary btn-sm" onClick={() => getByMerchant()}>By Merchant</button>
            <button className="btn btn-warning btn-sm" onClick={() => handleIdAction("agreeBurn")}>Agree</button>
            <button className="btn btn-error btn-sm" onClick={() => handleIdAction("burn")}>Burn</button>
          </div>
        </div>

        {/* Result */}
        <div className="w-full max-w-md p-3 bg-white/80 backdrop-blur rounded-xl shadow">
          <h3 className="font-bold text-sm mb-1 text-gray-700">Result:</h3>
          {photoInfo && (
            <div className="text-xs space-y-0.5">
              <p>Model: {photoInfo[0]}</p>
              <p>Merchant: {photoInfo[1]}</p>
              <p>URI: <a href={photoInfo[2]} target="_blank" className="link link-primary">View</a></p>
            </div>
          )}
          {allTokens && allTokens.length > 0 && (
            <p className="text-xs">All IDs: {allTokens.map(id => id.toString()).join(", ")}</p>
          )}
          {merchantTokens && merchantTokens.length > 0 && (
            <p className="text-xs">Merchant Tokens: {merchantTokens.map(id => id.toString()).join(", ")}</p>
          )}
        </div>
      </div>
    </div>
  );
};
