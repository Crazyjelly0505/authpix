# AuthPix

<div align="center">
  <img src="packages/nextjs/public/logo.png" alt="AuthPix Logo" width="200" />

  **去中心化服装图片授权协议**

  为模特提供版权保护 · 为商家提供授权凭证 · 为买家提供真实验证

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Network: Sepolia](https://img.shields.io/badge/Network-Sepolia-blue)](https://sepolia.etherscan.io/)
</div>

---

## 📖 项目背景

在服装电商蓬勃发展的今天，商品图片的真实性和授权问题日益突出：

- **模特困扰**：照片被商家盗用，肖像权无法得到保障
- **商家困境**：使用未经授权的图片面临法律风险
- **买家担忧**：商品图片与实物不符，消费体验差

**AuthPix** 应运而生 —— 一个专注于服装行业的去中心化图片授权协议。

---

## 🎯 解决方案

### 对于模特/创作者
- 🎨 **版权确权**：作品上链存证，版权归属清晰可查
- ✅ **授权管理**：自主决定是否授权商家使用图片
- 💰 **权益保障**：与商家建立透明授权关系

### 对于商家
- 📸 **合规使用**：获得模特授权后合法使用图片
- ⭐ **信誉积累**：展示授权凭证，赢得消费者信任
- 🛡️ **风险规避**：避免侵权纠纷

### 对于买家
- 🔍 **真实验证**：查看图片授权状态，确认商品真实性
- 📜 **溯源追踪**：了解图片来源和授权历史

---

## ✨ 核心功能

### 智能合约功能

| 功能 | 描述 | 角色 |
|------|------|------|
| `registerModel` | 注册成为模特 | 模特 |
| `createRequest` | 发送授权请求 | 商家 |
| `approveRequest` | 批准/拒绝请求 | 模特 |
| `mint` | 铸造NFT商品 | 商家 |
| `burn` | 下架商品 | 商家 |
| `report` | 举报违规商品 | 任何用户 |

### 工作流程

```
模特/创作者                      商家
    │                            │
    │  1. 注册成为模特            │
    │────────────────────────────>
    │                            │
    │         2. 发送授权请求      │
    │<────────────────────────────
    │     (图片URL + 商品详情)     │
    │                            │
    │  3. 审批请求 (同意/拒绝)      │
    │────────────────────────────>
    │                            │
    │         4. 铸造NFT商品        │
    │<────────────────────────────
    │                            │
    │       ✅ 授权完成            │
    │<───────────────────────────>│
```

### 前端特性

- 🖼️ **商品展示**：网格布局展示授权商品，悬停查看时间线
- 👤 **用户信息**：悬停显示商家/模特详细信息和发布数量
- 🔔 **通知中心**：双角色视图切换（收到的请求/发出的请求）
- ⚠️ **举报功能**：一键举报违规商品
- 📱 **响应式设计**：适配桌面和移动端

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 智能合约 | Solidity + Hardhat + OpenZeppelin ERC721 |
| 前端框架 | Next.js 15 + TypeScript |
| Web3 基础设施 | Scaffold-ETH 2 + Wagmi + Viem |
| 钱包连接 | RainbowKit |
| UI 组件 | DaisyUI + Tailwind CSS |
| 存储 | IPFS (Pinata) |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 20
- Yarn 3.x
- MetaMask 或其他 Web3 钱包

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/authpix.git
cd authpix

# 安装依赖
yarn install

# 终端 1: 启动本地区块链
yarn chain

# 终端 2: 部署合约 (自动生成测试数据)
yarn deploy

# 终端 3: 启动前端
yarn start
```

访问 http://localhost:3000 查看应用。

### 部署到测试网

```bash
# 1. 配置部署账户
yarn account:import  # 导入私钥
# 或
yarn account:generate  # 生成新账户

# 2. 获取 Sepolia 测试 ETH
# https://sepoliafaucet.com
# https://faucets.chain.link/sepolia

# 3. 部署合约
yarn deploy --network sepolia

# 4. 部署前端到 Vercel
yarn vercel
```

---

## 📁 项目结构

```
authpix/
├── packages/
│   ├── hardhat/                    # 智能合约
│   │   ├── contracts/
│   │   │   └── AuthPix.sol         # 核心合约
│   │   ├── deploy/
│   │   │   ├── deploy_contract.ts  # 合约部署
│   │   │   └── seed_test_data.ts   # 测试数据
│   │   └── test/
│   │       └── AuthPix.ts          # 合约测试
│   │
│   └── nextjs/                     # 前端应用
│       ├── app/
│       │   └── page.tsx            # 主页面
│       ├── components/
│       │   ├── First.tsx           # 商品展示页
│       │   ├── Notice.tsx          # 通知中心
│       │   ├── Header.tsx          # 导航栏
│       │   └── UserInfoWithTooltip.tsx  # 用户信息组件
│       ├── contracts/
│       │   └── deployedContracts.ts # 合约 ABI
│       └── hooks/scaffold-eth/     # Web3 Hooks
│
├── scaffold.config.ts              # 网络配置
└── README.md
```

---

## 🔗 合约信息

### Sepolia 测试网

- **合约地址**: `0x67d5137bbEF00f8562958fEC536aA1D067C41Cb2`
- **浏览器**: [Etherscan](https://sepolia.etherscan.io/address/0x67d5137bbEF00f8562958fEC536aA1D067C41Cb2)

---

## 🔐 安全说明

- 所有图片信息存储在 IPFS，确保不可篡改
- 授权关系记录在区块链上，公开透明
- 商家只能在模特批准后铸造 NFT
- 举报功能帮助社区监督违规内容
- 请妥善保管钱包私钥，切勿泄露

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

<div align="center">

**让每一次授权都有据可查，让每一位创作者都得到尊重。**

Made with ❤️ by AuthPix Team

</div>
