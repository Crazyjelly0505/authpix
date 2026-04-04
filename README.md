# AuthPix

<div align="center">
  <img src="packages/nextjs/public/logo.png" alt="AuthPix Logo" width="200" />

  **Decentralized Image Authentication Protocol**

  为买家提供实拍保障 · 保护创作者合法权益

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

---

## 📖 项目背景

在电商蓬勃发展的今天，商品图片的真实性问题日益突出：

- **买家困扰**：商家盗用精美图片，实物与图片严重不符，消费者权益受损
- **创作者困境**：摄影师、模特的原创作品被随意盗用，劳动成果得不到尊重
- **信任危机**：买卖双方缺乏有效的信任机制，平台公信力不足

**AuthPix** 应运而生 —— 一个基于区块链的去中心化图片认证协议。

---

## 🎯 创作意图

### 对于买家
- 🔍 **真实验证**：通过 NFT 确权，验证商品图片的真实来源
- 🛡️ **权益保障**：购买的商品图片经过认证，避免"货不对板"
- 📜 **溯源追踪**：清晰记录图片从拍摄到销售的全过程

### 对于商家
- 📸 **原创保护**：上传实拍图铸造 NFT，确立图片所有权
- ⭐ **信誉积累**：真实商品图片建立商家信誉，赢得消费者信任
- 💼 **商业价值**：认证图片成为商家的数字资产

### 对于模特/创作者
- 🎨 **版权确权**：作品上链存证，版权归属清晰可查
- 💰 **收益保障**：与商家建立授权关系，权益受到保护
- 🤝 **合作透明**：双方确认机制，确保创作得到认可

---

## ✨ 核心功能

| 功能 | Model / Creator | Merchant / User |
|------|-----------------|-----------------|
| 注册身份 | ✅ | - |
| 铸造 NFT | ✅ | - |
| 查询图片信息 | ✅ | ✅ |
| 按地址筛选 | ✅ | ✅ |
| 同意销毁 | ✅ | ✅ (相关方) |
| 确认销毁 | ✅ | ✅ (双方同意后) |

### 工作流程

```
模特/创作者                      商家
    │                            │
    │  1. 注册成为 Model          │
    │───────────────────────────>│
    │                            │
    │  2. 铸造 NFT (IPFS + 商家地址)
    │───────────────────────────>│
    │                            │
    │       NFT 记录图片信息       │
    │<──────────────────────────>│
    │                            │
    │  3. 双方确认后可销毁 NFT      │
    │<──────────────────────────>│
```

---

## 🛠️ 技术栈

- **智能合约**: Solidity + Hardhat + OpenZeppelin
- **前端框架**: Next.js + TypeScript
- **Web3 基础设施**: Scaffold-ETH 2 + Wagmi + Viem
- **钱包连接**: RainbowKit
- **UI 组件**: DaisyUI + Tailwind CSS
- **存储**: IPFS (去中心化存储)

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- Yarn 或 npm
- MetaMask 或其他 Web3 钱包

### 安装依赖

```bash
git clone https://github.com/your-username/authpix.git
cd authpix
yarn install
```

### 本地开发

```bash
# 终端 1: 启动本地区块链
cd packages/hardhat
yarn chain

# 终端 2: 部署合约
cd packages/hardhat
yarn deploy

# 终端 3: 启动前端
cd packages/nextjs
yarn dev
```

访问 http://localhost:3000 查看应用。

### 部署到测试网

```bash
# 1. 配置环境变量
cd packages/hardhat
cp .env.example .env
# 编辑 .env 填入你的配置

# 2. 导入钱包
yarn account:import

# 3. 获取 Sepolia 测试 ETH
# https://sepoliafaucet.com

# 4. 部署合约
yarn deploy --network sepolia
```

---

## 📁 项目结构

```
authpix/
├── packages/
│   ├── hardhat/                 # 智能合约
│   │   ├── contracts/
│   │   │   └── AuthPix.sol      # 核心合约
│   │   ├── deploy/              # 部署脚本
│   │   └── test/                # 合约测试
│   │
│   └── nextjs/                  # 前端应用
│       ├── app/                 # Next.js 页面
│       ├── components/          # React 组件
│       │   ├── Welcome.tsx      # 身份选择
│       │   ├── Model.tsx        # 模特面板
│       │   └── User.tsx         # 用户面板
│       └── public/              # 静态资源
│
└── README.md
```

---

## 🔐 安全说明

- 所有图片信息存储在 IPFS，确保不可篡改
- NFT 权益关系记录在区块链上，公开透明
- 销毁操作需双方确认，防止单方面恶意操作
- 请妥善保管钱包私钥，切勿泄露

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">

**让每一张商品图都有迹可循，让每一位创作者都得到尊重。**

Made with ❤️ by AuthPix Team

</div>
