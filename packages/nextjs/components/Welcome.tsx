"use client";

interface WelcomeProps {
  setIdentity: (value: string) => void;
}

export const Welcome = ({ setIdentity }: WelcomeProps) => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[url('/shop.png')] bg-cover bg-center overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <h1 className="text-[20vw] font-black text-white/5 uppercase tracking-tighter">AuthPix</h1>
      </div>

      <div className="relative z-10 flex flex-col items-center p-12 bg-black/30 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl">
        <h2 className="text-6xl font-black text-white mb-4 tracking-tight">
          Auth<span className="text-indigo-400">Pix</span>
        </h2>

        <p className="text-gray-200 text-lg mb-10 font-medium tracking-wide">
          Choose an identity to enter the protocol
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full">
          <button
            onClick={() => setIdentity("user")}
            className="group relative px-10 py-4 bg-white text-black font-bold rounded-2xl transition-all hover:bg-indigo-500 hover:text-white hover:scale-105 active:scale-95 shadow-lg"
          >
            <span className="text-xl">Merchant / User</span>
            <p className="text-[10px] uppercase opacity-50 font-normal">Purchase & Verify</p>
          </button>

          <button
            onClick={() => setIdentity("model")}
            className="group relative px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl transition-all hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95"
          >
            <span className="text-xl">Model / Creator</span>
            <p className="text-[10px] uppercase opacity-70 font-normal">Mint & Protect</p>
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 text-white/40 text-xs tracking-[0.2em] uppercase">
        Decentralized Image Authentication Protocol
      </div>
    </div>
  );
};
