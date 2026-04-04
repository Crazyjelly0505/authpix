"use client";

import { RainbowKitCustomConnectButton } from "./scaffold-eth";
import Image from "next/image";
import { useAccount } from "wagmi";

export const Header = () => {
  const { isConnected } = useAccount();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-transparent">

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md p-2 rounded-xl border border-white/10">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-bold text-xl text-white tracking-tight">AuthPix</span>
        </div>

        {isConnected && (
          <div className="hidden md:block px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs text-black-200 uppercase tracking-widest">
            Protocol Active
          </div>
        )}
      </div>

      <div className="flex items-center">
        <RainbowKitCustomConnectButton />
      </div>
    </header>
  );
};