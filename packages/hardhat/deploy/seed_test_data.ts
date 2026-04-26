import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

// hardhat 本地节点默认 gas cap 为 16777216，设置合理的 gasLimit 避免超限
const GAS_LIMIT = 1_000_000;

// IPFS 基础路径
const IPFS_BASE =
  "https://jade-rational-blackbird-347.mypinata.cloud/ipfs/bafybeidtrsdgktammv2q27tjsae66zat7i42xblm4odmz2hfkdz23dtjbm";

/**
 * 初始化测试数据脚本
 * 仅在本地网络运行，创建一些测试商品数据
 */
const SeedTestData: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { get } = hre.deployments;

  // 只在本地网络运行（Sepolia 等测试网只有一个账户）
  const network = await hre.ethers.provider.getNetwork();
  if (network.chainId !== 31337n) {
    console.log("⏭️ 跳过测试数据初始化（非本地网络）");
    console.log("💡 提示: 在测试网上，你需要手动操作来创建测试数据");
    return;
  }

  console.log("🌱 开始初始化测试数据...");

  const AuthPixDeployment = await get("AuthPix");
  const AuthPix = await hre.ethers.getContractAt("AuthPix", AuthPixDeployment.address);

  // 获取一些测试账户（本地网络有 20 个预设账户）
  const signers = await hre.ethers.getSigners();
  const [, merchant1, merchant2, model1, model2] = signers;

  console.log("📋 测试账户:");
  console.log(`  - Deployer: ${deployer}`);
  console.log(`  - Merchant1: ${merchant1.address}`);
  console.log(`  - Merchant2: ${merchant2.address}`);
  console.log(`  - Model1: ${model1.address}`);
  console.log(`  - Model2: ${model2.address}`);

  // ========== 1. 注册模特 ==========
  console.log("\n📝 注册模特...");

  const model1Contract = AuthPix.connect(model1);
  const model2Contract = AuthPix.connect(model2);

  let tx = await model1Contract.registerModel({ gasLimit: GAS_LIMIT });
  await tx.wait();
  console.log(`  ✅ Model1 已注册: ${model1.address}`);

  tx = await model2Contract.registerModel({ gasLimit: GAS_LIMIT });
  await tx.wait();
  console.log(`  ✅ Model2 已注册: ${model2.address}`);

  // ========== 2. 商家发送授权请求 ==========
  console.log("\n📨 商家发送授权请求...");

  const merchant1Contract = AuthPix.connect(merchant1);
  const merchant2Contract = AuthPix.connect(merchant2);

  // 服装图片 URL 和描述
  const clothingItems = [
    {
      image: `${IPFS_BASE}/女1.png`,
      detail: "超适合通勤和日常穿搭的裙子，简约而不失优雅，身材包容度高",
    },
    {
      image: `${IPFS_BASE}/女2.png`,
      detail: "温柔风针织外套，春秋季必备，针脚细密不易脱线，手感柔软不扎人",
    },
    {
      image: `${IPFS_BASE}/女3.png`,
      detail: "雪纺面料连衣裙，柔软贴敷不易皱，高级感松弛感随风而来",
    },
    {
      image: `${IPFS_BASE}/男1.png`,
      detail: "百搭牛仔套装，像是从 90 年代电影里走出的旧时光，深浅适度的水洗蓝，揉碎街头的随性与少年的清爽",
    },
    {
      image: `${IPFS_BASE}/男2.png`,
      detail: "成熟格子西装套装，越是经典的色彩，越经得起时间的审视",
    },
    {
      image: `${IPFS_BASE}/女4.png`,
      detail: "基础女款灰色西服套装，适合面试，职场等多种环境，简约而不失气场",
    },
    {
      image: `${IPFS_BASE}/男3.png`,
      detail: "基础男款黑色西服套装，摒弃一切冗余的装饰，专注于版型和质感，让每个人都能穿出高级感",
    },
    {
      image: `${IPFS_BASE}/女5.png`,
      detail:
        "超适合派对的裙子！全身亮片点缀，即使在黑暗的环境也十分引人注目！同时裙身设计能够很好地收副乳，在腿上最细的部分开叉设计，整体更加显瘦",
    },
    {
      image: `${IPFS_BASE}/男4.png`,
      detail: "灰绿色柔软西装，颠覆传统的西装色彩和束缚，让糯而不塌的质感化作身体的第二层肌肤，打造不费力的高级感",
    },
  ];

  // Merchant1 发送请求
  tx = await merchant1Contract.createRequest(model1.address, clothingItems[0].detail, clothingItems[0].image, {
    gasLimit: GAS_LIMIT,
  });
  await tx.wait();
  console.log(`  ✅ Merchant1 -> Model1: ${clothingItems[0].detail.substring(0, 20)}...`);

  tx = await merchant1Contract.createRequest(model1.address, clothingItems[1].detail, clothingItems[1].image, {
    gasLimit: GAS_LIMIT,
  });
  await tx.wait();
  console.log(`  ✅ Merchant1 -> Model1: ${clothingItems[1].detail.substring(0, 20)}...`);

  tx = await merchant1Contract.createRequest(model2.address, clothingItems[2].detail, clothingItems[2].image, {
    gasLimit: GAS_LIMIT,
  });
  await tx.wait();
  console.log(`  ✅ Merchant1 -> Model2: ${clothingItems[2].detail.substring(0, 20)}...`);

  // Merchant2 发送请求
  tx = await merchant2Contract.createRequest(model1.address, clothingItems[3].detail, clothingItems[3].image, {
    gasLimit: GAS_LIMIT,
  });
  await tx.wait();
  console.log(`  ✅ Merchant2 -> Model1: ${clothingItems[3].detail.substring(0, 20)}...`);

  tx = await merchant2Contract.createRequest(model2.address, clothingItems[4].detail, clothingItems[4].image, {
    gasLimit: GAS_LIMIT,
  });
  await tx.wait();
  console.log(`  ✅ Merchant2 -> Model2: ${clothingItems[4].detail.substring(0, 20)}...`);

  tx = await merchant2Contract.createRequest(model2.address, clothingItems[5].detail, clothingItems[5].image, {
    gasLimit: GAS_LIMIT,
  });
  await tx.wait();
  console.log(`  ✅ Merchant2 -> Model2: ${clothingItems[5].detail.substring(0, 20)}...`);

  // ========== 3. 模特批准请求 ==========
  console.log("\n✅ 模特批准请求...");

  // Model1 批准请求 0, 1
  tx = await model1Contract.approveRequest(0, true, { gasLimit: GAS_LIMIT });
  await tx.wait();
  console.log(`  ✅ Model1 批准了请求 #0`);

  tx = await model1Contract.approveRequest(1, true, { gasLimit: GAS_LIMIT });
  await tx.wait();
  console.log(`  ✅ Model1 批准了请求 #1`);

  // Model1 拒绝请求 3
  tx = await model1Contract.approveRequest(3, false, { gasLimit: GAS_LIMIT });
  await tx.wait();
  console.log(`  ❌ Model1 拒绝了请求 #3`);

  // Model2 批准请求 2, 4, 5
  tx = await model2Contract.approveRequest(2, true, { gasLimit: GAS_LIMIT });
  await tx.wait();
  console.log(`  ✅ Model2 批准了请求 #2`);

  tx = await model2Contract.approveRequest(4, true, { gasLimit: GAS_LIMIT });
  await tx.wait();
  console.log(`  ✅ Model2 批准了请求 #4`);

  tx = await model2Contract.approveRequest(5, true, { gasLimit: GAS_LIMIT });
  await tx.wait();
  console.log(`  ✅ Model2 批准了请求 #5`);

  // ========== 4. 商家铸造NFT ==========
  console.log("\n🎨 商家铸造NFT商品...");

  // Merchant1 mint 已批准的请求
  tx = await merchant1Contract.mint(0, { gasLimit: GAS_LIMIT });
  await tx.wait();
  console.log(`  ✅ Merchant1 铸造了 NFT #1: ${clothingItems[0].detail.substring(0, 15)}...`);

  tx = await merchant1Contract.mint(1, { gasLimit: GAS_LIMIT });
  await tx.wait();
  console.log(`  ✅ Merchant1 铸造了 NFT #2: ${clothingItems[1].detail.substring(0, 15)}...`);

  tx = await merchant1Contract.mint(2, { gasLimit: GAS_LIMIT });
  await tx.wait();
  console.log(`  ✅ Merchant1 铸造了 NFT #3: ${clothingItems[2].detail.substring(0, 15)}...`);

  // Merchant2 mint 已批准的请求
  tx = await merchant2Contract.mint(4, { gasLimit: GAS_LIMIT });
  await tx.wait();
  console.log(`  ✅ Merchant2 铸造了 NFT #4: ${clothingItems[4].detail.substring(0, 15)}...`);

  tx = await merchant2Contract.mint(5, { gasLimit: GAS_LIMIT });
  await tx.wait();
  console.log(`  ✅ Merchant2 铸造了 NFT #5: ${clothingItems[5].detail.substring(0, 15)}...`);

  // ========== 完成 ==========
  const totalSupply = await AuthPix.nextTokenId();
  console.log("\n🎉 测试数据初始化完成!");
  console.log(`  - 已注册模特: 2 位`);
  console.log(`  - 已创建请求: 6 个`);
  console.log(`  - 已铸造商品: ${totalSupply} 个`);
  console.log(`  - 已拒绝请求: 1 个 (请求 #3)`);
};

export default SeedTestData;

SeedTestData.tags = ["SeedTestData"];
SeedTestData.dependencies = ["AuthPix"];
