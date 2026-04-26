import { ethers } from "hardhat";
import { expect } from "chai";

describe("AuthPix", function () {
  async function deployNFT() {
    const [merchant, model, user] = await ethers.getSigners();
    const APIX = await ethers.getContractFactory("AuthPix");
    const apix = await APIX.deploy();
    return { apix, merchant, model, user };
  }

  // 部署 + 注册模特 + 创建请求
  async function deployWithRequest() {
    const { apix, merchant, model, user } = await deployNFT();
    await apix.connect(model).registerModel();
    await apix.connect(merchant).createRequest(model.address, "detail", "ipfs://test");
    const requestId = 0n; // 第一个请求
    return { apix, merchant, model, user, requestId };
  }

  // 部署 + 注册模特 + 创建请求 + 批准 + mint
  async function deployAndMint() {
    const { apix, merchant, model, user, requestId } = await deployWithRequest();
    await apix.connect(model).approveRequest(requestId, true);
    await apix.connect(merchant).mint(requestId);
    const tokenId = await apix.nextTokenId();
    return { apix, merchant, model, user, requestId, tokenId };
  }

  describe("registerModel", function () {
    it("should register correctly", async function () {
      const { apix, model } = await deployNFT();
      expect(await apix.isModel(model.address)).to.equal(false);
      await apix.connect(model).registerModel();
      expect(await apix.isModel(model.address)).to.equal(true);
    });

    it("should emit ModelRegistered event", async function () {
      const { apix, model } = await deployNFT();
      await expect(apix.connect(model).registerModel()).to.emit(apix, "ModelRegistered").withArgs(model.address);
    });
  });

  describe("createRequest", function () {
    it("should create request correctly", async function () {
      const { apix, merchant, model, requestId } = await deployWithRequest();
      const req = await apix.allRequests(requestId);
      expect(req.merchant).to.equal(merchant.address);
      expect(req.model).to.equal(model.address);
      expect(req.tokenURI).to.equal("ipfs://test");
      expect(req.detail).to.equal("detail");
      expect(req.isApproved).to.equal(false);
    });

    it("should emit CreateRequest event", async function () {
      const { apix, merchant, model } = await deployNFT();
      await apix.connect(model).registerModel();
      await expect(apix.connect(merchant).createRequest(model.address, "detail", "ipfs://test"))
        .to.emit(apix, "CreateRequest")
        .withArgs(merchant.address, model.address, "ipfs://test");
    });

    it("should revert if model not registered", async function () {
      const { apix, merchant, model } = await deployNFT();
      await expect(apix.connect(merchant).createRequest(model.address, "detail", "ipfs://test")).to.be.revertedWith(
        "Invalid model",
      );
    });
  });

  describe("approveRequest", function () {
    it("should approve correctly", async function () {
      const { apix, model, requestId } = await deployWithRequest();
      await apix.connect(model).approveRequest(requestId, true);
      const req = await apix.allRequests(requestId);
      expect(req.isApproved).to.equal(true);
      expect(req.isReject).to.equal(false);
    });

    it("should reject correctly", async function () {
      const { apix, model, requestId } = await deployWithRequest();
      await apix.connect(model).approveRequest(requestId, false);
      const req = await apix.allRequests(requestId);
      expect(req.isApproved).to.equal(false);
      expect(req.isReject).to.equal(true);
    });

    it("should emit ApproveRequest event with approved=true", async function () {
      const { apix, merchant, model, requestId } = await deployWithRequest();
      await expect(apix.connect(model).approveRequest(requestId, true))
        .to.emit(apix, "ApproveRequest")
        .withArgs(requestId, merchant.address, model.address, true);
    });

    it("should emit ApproveRequest event with approved=false", async function () {
      const { apix, merchant, model, requestId } = await deployWithRequest();
      await expect(apix.connect(model).approveRequest(requestId, false))
        .to.emit(apix, "ApproveRequest")
        .withArgs(requestId, merchant.address, model.address, false);
    });

    it("should revert if not model", async function () {
      const { apix, user, requestId } = await deployWithRequest();
      await expect(apix.connect(user).approveRequest(requestId, true)).to.be.revertedWith("Only Model");
    });

    it("should revert if not your request", async function () {
      const { apix, user, requestId } = await deployWithRequest();
      await apix.connect(user).registerModel();
      await expect(apix.connect(user).approveRequest(requestId, true)).to.be.revertedWith("Not your request");
    });

    it("should revert if already decided", async function () {
      const { apix, model, requestId } = await deployWithRequest();
      await apix.connect(model).approveRequest(requestId, true);
      await expect(apix.connect(model).approveRequest(requestId, false)).to.be.revertedWith("Already decided");
    });
  });

  describe("mint", function () {
    it("should mint correctly", async function () {
      const { apix, merchant, model, tokenId } = await deployAndMint();
      const token = await apix.allTokens(tokenId);
      expect(token.merchant).to.equal(merchant.address);
      expect(token.model).to.equal(model.address);
      expect(token.tokenid).to.equal(tokenId);
      expect(token.tokenURI).to.equal("ipfs://test");
      expect(token.detail).to.equal("detail");
      expect(token.report).to.equal(false);
      expect(token.burned).to.equal(false);
    });

    it("should emit Mint event", async function () {
      const { apix, merchant, model, requestId } = await deployWithRequest();
      await apix.connect(model).approveRequest(requestId, true);
      // mint 前 nextTokenId 是 0，mint 后变成 1，所以 tokenId 是 1
      const expectedTokenId = 1n;
      await expect(apix.connect(merchant).mint(requestId))
        .to.emit(apix, "Mint")
        .withArgs(model.address, merchant.address, expectedTokenId, "ipfs://test");
    });

    it("should revert if not approved", async function () {
      const { apix, merchant, requestId } = await deployWithRequest();
      await expect(apix.connect(merchant).mint(requestId)).to.be.revertedWith("Need approve");
    });

    it("should revert if not your request", async function () {
      const { apix, model, user, requestId } = await deployWithRequest();
      await apix.connect(model).approveRequest(requestId, true);
      await expect(apix.connect(user).mint(requestId)).to.be.revertedWith("Not your request");
    });

    it("should revert if already minted", async function () {
      const { apix, merchant, requestId } = await deployAndMint();
      await expect(apix.connect(merchant).mint(requestId)).to.be.revertedWith("Already minted");
    });
  });

  describe("burn", function () {
    it("should burn correctly", async function () {
      const { apix, merchant, tokenId } = await deployAndMint();
      await apix.connect(merchant).burn(tokenId);
      const token = await apix.allTokens(tokenId);
      expect(token.burned).to.equal(true);
    });

    it("should emit Burn event", async function () {
      const { apix, merchant, model, tokenId } = await deployAndMint();
      await expect(apix.connect(merchant).burn(tokenId))
        .to.emit(apix, "Burn")
        .withArgs(model.address, merchant.address, tokenId);
    });

    it("should revert if token not exist", async function () {
      const { apix, merchant } = await deployAndMint();
      await expect(apix.connect(merchant).burn(999)).to.be.revertedWith("Token not exist");
    });

    it("should revert if not authorized", async function () {
      const { apix, user, tokenId } = await deployAndMint();
      await expect(apix.connect(user).burn(tokenId)).to.be.revertedWith("Not authorized");
    });

    it("should revert if already burned", async function () {
      const { apix, merchant, tokenId } = await deployAndMint();
      await apix.connect(merchant).burn(tokenId);
      await expect(apix.connect(merchant).burn(tokenId)).to.be.revertedWith("Token not exist");
    });
  });

  describe("report", function () {
    it("should report correctly", async function () {
      const { apix, tokenId } = await deployAndMint();
      await apix.report(tokenId);
      const token = await apix.allTokens(tokenId);
      expect(token.report).to.equal(true);
    });

    it("should emit Report event", async function () {
      const { apix, user, tokenId } = await deployAndMint();
      await expect(apix.connect(user).report(tokenId)).to.emit(apix, "Report").withArgs(user.address, tokenId);
    });

    it("should revert if token not exist", async function () {
      const { apix } = await deployAndMint();
      await expect(apix.report(999)).to.be.revertedWith("Token not exist");
    });

    it("should revert if token burned", async function () {
      const { apix, merchant, tokenId } = await deployAndMint();
      await apix.connect(merchant).burn(tokenId);
      await expect(apix.report(tokenId)).to.be.revertedWith("Token not exist");
    });
  });

  describe("getPhotoInfo", function () {
    it("should return info correctly", async function () {
      const { apix, merchant, model, tokenId } = await deployAndMint();
      const info = await apix.getPhotoInfo(tokenId);
      expect(info.merchant).to.equal(merchant.address);
      expect(info.model).to.equal(model.address);
      expect(info.tokenid).to.equal(tokenId);
      expect(info.tokenURI).to.equal("ipfs://test");
      expect(info.detail).to.equal("detail");
      expect(info.report).to.equal(false);
      expect(info.burned).to.equal(false);
    });
  });

  describe("getModelCount", function () {
    it("should return correct count", async function () {
      const { apix, model } = await deployAndMint();
      expect(await apix.getModelCount(model.address)).to.equal(1);
    });

    it("should return 0 if no tokens", async function () {
      const { apix, user } = await deployAndMint();
      expect(await apix.getModelCount(user.address)).to.equal(0);
    });
  });

  describe("getMerchantCount", function () {
    it("should return correct count", async function () {
      const { apix, merchant } = await deployAndMint();
      expect(await apix.getMerchantCount(merchant.address)).to.equal(1);
    });

    it("should return 0 if no tokens", async function () {
      const { apix, user } = await deployAndMint();
      expect(await apix.getMerchantCount(user.address)).to.equal(0);
    });
  });

  describe("getRequestsForModel", function () {
    it("should return requests correctly", async function () {
      const { apix, model } = await deployWithRequest();
      const reqs = await apix.getRequestsForModel(model.address);
      expect(reqs.length).to.equal(1);
      expect(reqs[0].model).to.equal(model.address);
    });

    it("should return empty if no requests", async function () {
      const { apix, user } = await deployWithRequest();
      const reqs = await apix.getRequestsForModel(user.address);
      expect(reqs.length).to.equal(0);
    });

    it("should reflect state changes", async function () {
      const { apix, model, requestId } = await deployWithRequest();
      let reqs = await apix.getRequestsForModel(model.address);
      expect(reqs[0].isApproved).to.equal(false);
      await apix.connect(model).approveRequest(requestId, true);
      reqs = await apix.getRequestsForModel(model.address);
      expect(reqs[0].isApproved).to.equal(true);
    });
  });

  describe("getRequestsForMerchant", function () {
    it("should return requests correctly", async function () {
      const { apix, merchant } = await deployWithRequest();
      const reqs = await apix.getRequestsForMerchant(merchant.address);
      expect(reqs.length).to.equal(1);
      expect(reqs[0].merchant).to.equal(merchant.address);
    });

    it("should return empty if no requests", async function () {
      const { apix, user } = await deployWithRequest();
      const reqs = await apix.getRequestsForMerchant(user.address);
      expect(reqs.length).to.equal(0);
    });

    it("should return multiple requests", async function () {
      const { apix, merchant, model } = await deployWithRequest();
      await apix.connect(merchant).createRequest(model.address, "detail2", "ipfs://test2");
      const reqs = await apix.getRequestsForMerchant(merchant.address);
      expect(reqs.length).to.equal(2);
    });
  });

  // 边界状态测试
  describe("boundary tests", function () {
    it("should not mint if request is rejected", async function () {
      const { apix, merchant, model, requestId } = await deployWithRequest();
      await apix.connect(model).approveRequest(requestId, false);
      await expect(apix.connect(merchant).mint(requestId)).to.be.revertedWith("Need approve");
    });

    it("should not allow duplicate report from same user", async function () {
      const { apix, tokenId } = await deployAndMint();
      await apix.report(tokenId);
      await expect(apix.report(tokenId)).to.be.revertedWith("Already reported");
    });

    it("should allow different users to report same token", async function () {
      const { apix, merchant, user, tokenId } = await deployAndMint();
      await apix.connect(merchant).report(tokenId);
      await apix.connect(user).report(tokenId);
      const hasReported1 = await apix.hasReported(tokenId, merchant.address);
      const hasReported2 = await apix.hasReported(tokenId, user.address);
      expect(hasReported1).to.equal(true);
      expect(hasReported2).to.equal(true);
    });

    it("should have correct timestamp order", async function () {
      const { apix, tokenId } = await deployAndMint();
      const token = await apix.allTokens(tokenId);
      // mintAt >= approveAt >= requestAt
      expect(token.mintAt).to.be.greaterThanOrEqual(token.approveAt);
      expect(token.approveAt).to.be.greaterThanOrEqual(token.requestAt);
    });

    it("should have agrOrRejAt = 0 before decision", async function () {
      const { apix, requestId } = await deployWithRequest();
      const req = await apix.allRequests(requestId);
      expect(req.agrOrRejAt).to.equal(0);
    });

    it("should have agrOrRejAt > 0 after approve", async function () {
      const { apix, model, requestId } = await deployWithRequest();
      await apix.connect(model).approveRequest(requestId, true);
      const req = await apix.allRequests(requestId);
      expect(req.agrOrRejAt).to.be.greaterThan(0);
    });

    it("should keep token info after burn", async function () {
      const { apix, merchant, model, tokenId } = await deployAndMint();
      await apix.connect(merchant).burn(tokenId);
      // burn 后 allTokens 数据仍然保留
      const token = await apix.allTokens(tokenId);
      expect(token.merchant).to.equal(merchant.address);
      expect(token.model).to.equal(model.address);
      expect(token.burned).to.equal(true);
    });
  });
});
