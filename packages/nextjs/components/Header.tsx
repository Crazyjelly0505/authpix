"use client";

import { RainbowKitCustomConnectButton } from "./scaffold-eth";
import { activeNavBtn, headerStyle, navBtn, navStyle, rightStyle } from "~~/components/ui/styles";

export const Header = ({ setTab, tab }: { setTab: (tab: string) => void; tab: string }) => {
  return (
    <div style={headerStyle}>
      {/* 左侧导航 */}
      <div style={navStyle}>
        <button
          onClick={() => setTab("home")}
          style={{
            ...navBtn,
            ...(tab === "home" ? activeNavBtn : {}),
          }}
        >
          首页
        </button>

        <button
          onClick={() => setTab("notice")}
          style={{
            ...navBtn,
            ...(tab === "notice" ? activeNavBtn : {}),
          }}
        >
          通知
        </button>
      </div>

      {/* 中间标题 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          fontWeight: 700,
          fontSize: "16px",
          color: "#111",
          letterSpacing: "0.5px",
        }}
      >
        AuthPix
      </div>

      {/* 右侧钱包 */}
      <div style={rightStyle}>
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
