import { ethers } from "hardhat";
import { expect } from "chai";
import { ZeroAddress } from "ethers";

describe("AuthPix", function () {
  async function deployNFT() {
    const [merchant, model, user1, user2] = await ethers.getSigners();
    const APIX = await ethers.getContractFactory("AuthPix");
    const apix = await APIX.deploy();
    return { apix, merchant, model, user1, user2 };
  }

  describe("registerModel", function () {
    it("should be register correctly", async function () {
      const { apix, user1 } = await deployNFT();
      const before = await apix.isModel(user1.address);
      expect(before).to.equal(false);
      await apix.connect(user1).registerModel();
      const after = await apix.isModel(user1.address);
      expect(after).to.equal(true);
    });

    it("should mint correctly", async function () {
      const { apix, user1 } = await deployNFT();
      await expect(apix.connect(user1).registerModel()).to.emit(apix, "ModelRegistered").withArgs(user1.address);
    });
  });

  describe("mint", function () {
    async function mintInit() {
      const { apix, merchant, model, user1 } = await deployNFT();
      await apix.connect(model).registerModel();
      return { apix, merchant, model, user1 };
    }

    it("should be mint correctly", async function () {
      const { apix, merchant, model } = await mintInit();
      await apix.connect(model).mint("ipfs://test", merchant);

      const modeladdress = await apix.modelOf(1);
      const merchantaddress = await apix.merchantOf(1);

      expect(modeladdress).to.equal(model.address);
      expect(merchantaddress).to.equal(merchant.address);
    });

    it("should be emit correctly", async function () {
      const { apix, merchant, model } = await mintInit();
      await expect(apix.connect(model).mint("ipfs://test", merchant))
        .to.emit(apix, "Mint")
        .withArgs(model.address, merchant.address, 1, "ipfs://test");
    });

    it("should be revert if not model", async function () {
      const { apix, merchant, user1 } = await mintInit();
      await expect(apix.connect(user1).mint("ipfs://test", merchant)).to.be.revertedWith("Only models");
    });

    it("should be revert if merchant not exist", async function () {
      const { apix, model } = await mintInit();
      await expect(apix.connect(model).mint("ipfs://test", ZeroAddress)).to.be.revertedWith("Invalid merchant");
    });
  });

  describe("agreeBurn", function () {
    async function agreeInit() {
      const { apix, merchant, model, user1 } = await deployNFT();
      await apix.connect(model).registerModel();
      await apix.connect(model).mint("ipfs://test", merchant);
      return { apix, merchant, model, user1 };
    }

    it("should be set agree correctly", async function () {
      const { apix, merchant, model } = await agreeInit();

      await apix.connect(model).agreeBurn(1);
      const modelBefore = await apix.modelAgree(1);
      const merchantBefore = await apix.merchantAgree(1);
      expect(modelBefore).to.equal(true);
      expect(merchantBefore).to.equal(false);

      await apix.connect(merchant).agreeBurn(1);
      const modelAfter = await apix.modelAgree(1);
      const merchantAfter = await apix.merchantAgree(1);
      expect(modelAfter).to.equal(true);
      expect(merchantAfter).to.equal(true);
    });

    it("should be revert if not owner", async function () {
      const { apix, user1 } = await agreeInit();
      await expect(apix.connect(user1).agreeBurn(1)).to.be.revertedWith("You are not the owner");
    });

    it("should be revert if agree twice", async function () {
      const { apix, merchant, model } = await agreeInit();
      await apix.connect(model).agreeBurn(1);
      await apix.connect(merchant).agreeBurn(1);
      await expect(apix.connect(model).agreeBurn(1)).to.be.revertedWithoutReason;
      await expect(apix.connect(merchant).agreeBurn(1)).to.be.revertedWithoutReason;
    });
  });

  describe("burn", function () {
    async function burnInit() {
      const { apix, merchant, model, user1 } = await deployNFT();
      await apix.connect(model).registerModel();
      await apix.connect(model).mint("ipfs://test", merchant);
      await apix.connect(merchant).agreeBurn(1);
      await apix.connect(model).agreeBurn(1);
      return { apix, merchant, model, user1 };
    }

    it("should be burn correctly", async function () {
      const { apix, model } = await burnInit();
      await apix.connect(model).burn(1);

      const modelof = await apix.modelOf(1);
      const merchantof = await apix.merchantOf(1);
      const modelagree = await apix.modelAgree(1);
      const merchantagree = await apix.merchantAgree(1);

      expect(modelof).to.equal(ZeroAddress);
      expect(merchantof).to.equal(ZeroAddress);
      expect(modelagree).to.equal(false);
      expect(merchantagree).to.equal(false);
    });

    it("should be emit correctly", async function () {
      const { apix, merchant, model } = await burnInit();
      await expect(apix.connect(model).burn(1)).to.emit(apix, "Burn").withArgs(model.address, merchant.address, 1);
    });

    it("should be revert if not authorized", async function () {
      const { apix, user1 } = await burnInit();
      await expect(apix.connect(user1).burn(1)).to.be.revertedWith("Not authorized");
    });

    it("should be revert if someone disagree", async function () {
      const { apix, merchant, model } = await deployNFT();
      await apix.connect(model).registerModel();
      await apix.connect(model).mint("ipfs://test", merchant);
      await expect(apix.connect(model).burn(1)).to.be.revertedWith("Model disagree");

      await apix.connect(model).agreeBurn(1);
      await expect(apix.connect(model).burn(1)).to.be.revertedWith("Merchant disagree");
    });
  });

  describe("getPhotoInfo", function () {
    it("should return correctly", async function () {
      const { apix, merchant, model } = await deployNFT();
      await apix.connect(model).registerModel();
      await apix.connect(model).mint("ipfs://test", merchant);

      const [modeladdress, merchantaddress, tokenuri] = await apix.getPhotoInfo(1);

      expect(modeladdress).to.equal(model.address);
      expect(merchantaddress).to.equal(merchant.address);
      expect(tokenuri).to.equal("ipfs://test");
    });
  });
});
