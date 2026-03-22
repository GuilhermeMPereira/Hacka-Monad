import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("MeritCoin", function () {
  async function deployFixture() {
    const [owner, user1, user2, meetupManager] = await hre.ethers.getSigners();
    const MeritCoin = await hre.ethers.getContractFactory("MeritCoin");
    const meritCoin = await MeritCoin.deploy();
    return { meritCoin, owner, user1, user2, meetupManager };
  }

  async function deployWithManagerFixture() {
    const { meritCoin, owner, user1, user2, meetupManager } =
      await loadFixture(deployFixture);
    await meritCoin.setMeetupManager(meetupManager.address);
    return { meritCoin, owner, user1, user2, meetupManager };
  }

  it("should deploy with correct name and symbol", async function () {
    const { meritCoin } = await loadFixture(deployFixture);
    expect(await meritCoin.name()).to.equal("MeritCoin");
    expect(await meritCoin.symbol()).to.equal("MERIT");
  });

  it("should set deployer as owner", async function () {
    const { meritCoin, owner } = await loadFixture(deployFixture);
    expect(await meritCoin.owner()).to.equal(owner.address);
  });

  describe("faucet", function () {
    it("should give 500 MERIT to caller", async function () {
      const { meritCoin, user1 } = await loadFixture(deployFixture);
      await meritCoin.connect(user1).faucet();
      const expected = hre.ethers.parseEther("500");
      expect(await meritCoin.balanceOf(user1.address)).to.equal(expected);
    });

    it("should emit FaucetClaim event", async function () {
      const { meritCoin, user1 } = await loadFixture(deployFixture);
      const expected = hre.ethers.parseEther("500");
      await expect(meritCoin.connect(user1).faucet())
        .to.emit(meritCoin, "FaucetClaim")
        .withArgs(user1.address, expected);
    });

    it("should revert on second claim", async function () {
      const { meritCoin, user1 } = await loadFixture(deployFixture);
      await meritCoin.connect(user1).faucet();
      await expect(
        meritCoin.connect(user1).faucet()
      ).to.be.revertedWith("MeritCoin: already claimed");
    });
  });

  describe("hasClaimedFaucet", function () {
    it("should return false before claiming", async function () {
      const { meritCoin, user1 } = await loadFixture(deployFixture);
      expect(await meritCoin.hasClaimedFaucet(user1.address)).to.equal(false);
    });

    it("should return true after claiming", async function () {
      const { meritCoin, user1 } = await loadFixture(deployFixture);
      await meritCoin.connect(user1).faucet();
      expect(await meritCoin.hasClaimedFaucet(user1.address)).to.equal(true);
    });
  });

  describe("setMeetupManager", function () {
    it("should only be callable by owner", async function () {
      const { meritCoin, user1, meetupManager } =
        await loadFixture(deployFixture);
      await expect(
        meritCoin.connect(user1).setMeetupManager(meetupManager.address)
      ).to.be.revertedWith("MeritCoin: caller is not the owner");
    });

    it("should set meetupManager address", async function () {
      const { meritCoin, meetupManager } = await loadFixture(deployFixture);
      await meritCoin.setMeetupManager(meetupManager.address);
      expect(await meritCoin.meetupManager()).to.equal(meetupManager.address);
    });
  });

  describe("recordSettlement", function () {
    it("should only be callable by meetupManager", async function () {
      const { meritCoin, user1, user2 } = await loadFixture(deployFixture);
      await expect(
        meritCoin
          .connect(user1)
          .recordSettlement(user1.address, user2.address, 1000n)
      ).to.be.revertedWith("MeritCoin: caller is not the MeetupManager");
    });

    it("should update reputation correctly", async function () {
      const { meritCoin, user1, user2, meetupManager } =
        await loadFixture(deployWithManagerFixture);
      await meritCoin
        .connect(meetupManager)
        .recordSettlement(user1.address, user2.address, 1000n);

      const [paid1, received1] = await meritCoin.getReputation(user1.address);
      expect(paid1).to.equal(1n);
      expect(received1).to.equal(0n);

      const [paid2, received2] = await meritCoin.getReputation(user2.address);
      expect(paid2).to.equal(0n);
      expect(received2).to.equal(1n);
    });

    it("should emit SettlementRecorded event", async function () {
      const { meritCoin, user1, user2, meetupManager } =
        await loadFixture(deployWithManagerFixture);
      await expect(
        meritCoin
          .connect(meetupManager)
          .recordSettlement(user1.address, user2.address, 1000n)
      )
        .to.emit(meritCoin, "SettlementRecorded")
        .withArgs(user1.address, user2.address, 1000n);
    });
  });

  describe("getReputation", function () {
    it("should return zeros for new user", async function () {
      const { meritCoin, user1 } = await loadFixture(deployFixture);
      const [paid, received] = await meritCoin.getReputation(user1.address);
      expect(paid).to.equal(0n);
      expect(received).to.equal(0n);
    });

    it("should accumulate across multiple settlements", async function () {
      const { meritCoin, user1, user2, meetupManager } =
        await loadFixture(deployWithManagerFixture);

      await meritCoin
        .connect(meetupManager)
        .recordSettlement(user1.address, user2.address, 500n);
      await meritCoin
        .connect(meetupManager)
        .recordSettlement(user1.address, user2.address, 700n);

      const [paid, received] = await meritCoin.getReputation(user1.address);
      expect(paid).to.equal(2n);
      expect(received).to.equal(0n);

      const [paid2, received2] = await meritCoin.getReputation(user2.address);
      expect(paid2).to.equal(0n);
      expect(received2).to.equal(2n);
    });
  });
});
