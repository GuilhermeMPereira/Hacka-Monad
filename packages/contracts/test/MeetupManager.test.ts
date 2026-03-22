import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("MeetupManager", function () {
  async function deployFixture() {
    const [owner, creator, invitee1, invitee2, outsider] =
      await hre.ethers.getSigners();

    const MeritCoin = await hre.ethers.getContractFactory("MeritCoin");
    const meritCoin = await MeritCoin.deploy();

    const MeetupManager = await hre.ethers.getContractFactory("MeetupManager");
    const meetupManager = await MeetupManager.deploy(
      await meritCoin.getAddress()
    );

    // Set the MeetupManager on MeritCoin so recordSettlement works
    await meritCoin.setMeetupManager(await meetupManager.getAddress());

    // Give creator, invitee1, invitee2 tokens via faucet
    await meritCoin.connect(creator).faucet();
    await meritCoin.connect(invitee1).faucet();
    await meritCoin.connect(invitee2).faucet();

    // Approve MeetupManager to spend tokens on behalf of all participants
    const managerAddress = await meetupManager.getAddress();
    const maxApproval = hre.ethers.MaxUint256;
    await meritCoin.connect(creator).approve(managerAddress, maxApproval);
    await meritCoin.connect(invitee1).approve(managerAddress, maxApproval);
    await meritCoin.connect(invitee2).approve(managerAddress, maxApproval);

    return {
      meritCoin,
      meetupManager,
      owner,
      creator,
      invitee1,
      invitee2,
      outsider,
    };
  }

  describe("createMeetup", function () {
    it("should create a meetup with a single invitee (backward compatible)", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.id).to.equal(1n);
      expect(meetup.creator).to.equal(creator.address);
      expect(meetup.invitees).to.deep.equal([invitee1.address]);
      expect(meetup.restaurantId).to.equal("restaurant-1");
      expect(meetup.status).to.equal(0n); // Pending
      expect(meetup.billAmount).to.equal(0n);
      expect(meetup.createdAt).to.be.greaterThan(0n);
      expect(meetup.stakeAmount).to.equal(0n);
    });

    it("should create a meetup with multiple invitees", async function () {
      const { meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-multi",
          0
        );

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.id).to.equal(1n);
      expect(meetup.creator).to.equal(creator.address);
      expect(meetup.invitees).to.deep.equal([
        invitee1.address,
        invitee2.address,
      ]);
      expect(meetup.restaurantId).to.equal("restaurant-multi");
      expect(meetup.status).to.equal(0n); // Pending
    });

    it("should revert if invitees array is empty", async function () {
      const { meetupManager, creator } = await loadFixture(deployFixture);

      await expect(
        meetupManager.connect(creator).createMeetup([], "restaurant-1", 0)
      ).to.be.revertedWith("Need at least one invitee");
    });

    it("should revert if invitee is creator", async function () {
      const { meetupManager, creator } = await loadFixture(deployFixture);

      await expect(
        meetupManager
          .connect(creator)
          .createMeetup([creator.address], "restaurant-1", 0)
      ).to.be.revertedWith("Cannot invite yourself");
    });

    it("should revert if duplicate invitees", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await expect(
        meetupManager
          .connect(creator)
          .createMeetup(
            [invitee1.address, invitee1.address],
            "restaurant-1",
            0
          )
      ).to.be.revertedWith("Duplicate invitee");
    });

    it("should revert if invitee is address(0)", async function () {
      const { meetupManager, creator } = await loadFixture(deployFixture);

      await expect(
        meetupManager
          .connect(creator)
          .createMeetup([hre.ethers.ZeroAddress], "restaurant-1", 0)
      ).to.be.revertedWith("Invalid invitee");
    });

    it("should add meetup to all participants' userMeetups", async function () {
      const { meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          0
        );

      const creatorMeetups = await meetupManager.getUserMeetups(
        creator.address
      );
      expect(creatorMeetups).to.deep.equal([1n]);

      const invitee1Meetups = await meetupManager.getUserMeetups(
        invitee1.address
      );
      expect(invitee1Meetups).to.deep.equal([1n]);

      const invitee2Meetups = await meetupManager.getUserMeetups(
        invitee2.address
      );
      expect(invitee2Meetups).to.deep.equal([1n]);
    });

    it("should emit MeetupCreated event with invitees array", async function () {
      const { meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await expect(
        meetupManager
          .connect(creator)
          .createMeetup(
            [invitee1.address, invitee2.address],
            "restaurant-1",
            0
          )
      )
        .to.emit(meetupManager, "MeetupCreated")
        .withArgs(
          1n,
          creator.address,
          [invitee1.address, invitee2.address],
          "restaurant-1"
        );
    });

    it("should increment meetup count", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);
      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-2", 0);

      expect(await meetupManager.meetupCount()).to.equal(2n);
    });
  });

  describe("confirmMeetup", function () {
    it("should confirm and transition to Confirmed with single invitee", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);
      await meetupManager.connect(invitee1).confirmMeetup(1);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.status).to.equal(1n); // Confirmed
    });

    it("should stay Pending after first invitee confirms (2 invitees)", async function () {
      const { meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          0
        );
      await meetupManager.connect(invitee1).confirmMeetup(1);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.status).to.equal(0n); // Still Pending
    });

    it("should transition to Confirmed after all invitees confirm (2 invitees)", async function () {
      const { meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          0
        );
      await meetupManager.connect(invitee1).confirmMeetup(1);
      await meetupManager.connect(invitee2).confirmMeetup(1);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.status).to.equal(1n); // Confirmed
    });

    it("should emit MeetupConfirmed event with invitee address", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);

      await expect(meetupManager.connect(invitee1).confirmMeetup(1))
        .to.emit(meetupManager, "MeetupConfirmed")
        .withArgs(1n, invitee1.address);
    });

    it("should revert if caller is not an invitee (creator tries)", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);

      await expect(
        meetupManager.connect(creator).confirmMeetup(1)
      ).to.be.revertedWith("Not an invitee");
    });

    it("should revert if already confirmed", async function () {
      const { meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          0
        );
      await meetupManager.connect(invitee1).confirmMeetup(1);

      await expect(
        meetupManager.connect(invitee1).confirmMeetup(1)
      ).to.be.revertedWith("Already confirmed");
    });

    it("should revert if meetup is not pending", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);
      await meetupManager.connect(invitee1).confirmMeetup(1);

      // Meetup is now Confirmed, not Pending
      await expect(
        meetupManager.connect(invitee1).confirmMeetup(1)
      ).to.be.revertedWith("Not pending");
    });
  });

  describe("registerBill", function () {
    it("should register bill by creator when confirmed", async function () {
      const { meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          0
        );
      await meetupManager.connect(invitee1).confirmMeetup(1);
      await meetupManager.connect(invitee2).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("90");
      await meetupManager.connect(creator).registerBill(1, billAmount);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.billAmount).to.equal(billAmount);
      expect(meetup.billPayer).to.equal(creator.address);
      expect(meetup.status).to.equal(2n); // BillRegistered
    });

    it("should register bill by invitee when confirmed", async function () {
      const { meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          0
        );
      await meetupManager.connect(invitee1).confirmMeetup(1);
      await meetupManager.connect(invitee2).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("90");
      await meetupManager.connect(invitee1).registerBill(1, billAmount);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.billAmount).to.equal(billAmount);
      expect(meetup.billPayer).to.equal(invitee1.address);
      expect(meetup.status).to.equal(2n); // BillRegistered
    });

    it("should emit BillRegistered event", async function () {
      const { meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          0
        );
      await meetupManager.connect(invitee1).confirmMeetup(1);
      await meetupManager.connect(invitee2).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("90");
      await expect(
        meetupManager.connect(creator).registerBill(1, billAmount)
      )
        .to.emit(meetupManager, "BillRegistered")
        .withArgs(1n, creator.address, billAmount);
    });

    it("should revert if caller is not a participant", async function () {
      const { meetupManager, creator, invitee1, invitee2, outsider } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          0
        );
      await meetupManager.connect(invitee1).confirmMeetup(1);
      await meetupManager.connect(invitee2).confirmMeetup(1);

      await expect(
        meetupManager
          .connect(outsider)
          .registerBill(1, hre.ethers.parseEther("90"))
      ).to.be.revertedWith("Not a participant");
    });

    it("should revert if meetup is not confirmed", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);

      await expect(
        meetupManager
          .connect(creator)
          .registerBill(1, hre.ethers.parseEther("50"))
      ).to.be.revertedWith("Not confirmed");
    });
  });

  describe("settleBill", function () {
    it("should split bill among 3 participants (creator + 2 invitees)", async function () {
      const { meritCoin, meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          0
        );
      await meetupManager.connect(invitee1).confirmMeetup(1);
      await meetupManager.connect(invitee2).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("90");
      await meetupManager.connect(creator).registerBill(1, billAmount);

      const creatorBefore = await meritCoin.balanceOf(creator.address);
      const invitee1Before = await meritCoin.balanceOf(invitee1.address);
      const invitee2Before = await meritCoin.balanceOf(invitee2.address);

      await meetupManager.connect(invitee1).settleBill(1);

      const splitAmount = billAmount / 3n;
      const creatorAfter = await meritCoin.balanceOf(creator.address);
      const invitee1After = await meritCoin.balanceOf(invitee1.address);
      const invitee2After = await meritCoin.balanceOf(invitee2.address);

      // Creator paid the bill: invitee1 and invitee2 pay creator
      expect(invitee1After).to.equal(invitee1Before - splitAmount);
      expect(invitee2After).to.equal(invitee2Before - splitAmount);
      expect(creatorAfter).to.equal(creatorBefore + splitAmount * 2n);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.status).to.equal(3n); // Settled
    });

    it("should work with single invitee (backward compatible, split by 2)", async function () {
      const { meritCoin, meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);
      await meetupManager.connect(invitee1).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("50");
      await meetupManager.connect(creator).registerBill(1, billAmount);

      const creatorBefore = await meritCoin.balanceOf(creator.address);
      const inviteeBefore = await meritCoin.balanceOf(invitee1.address);

      await meetupManager.connect(invitee1).settleBill(1);

      const splitAmount = billAmount / 2n;
      const creatorAfter = await meritCoin.balanceOf(creator.address);
      const inviteeAfter = await meritCoin.balanceOf(invitee1.address);

      // Invitee pays creator
      expect(creatorAfter).to.equal(creatorBefore + splitAmount);
      expect(inviteeAfter).to.equal(inviteeBefore - splitAmount);
    });

    it("should work when invitee is the billPayer (creator + other invitees pay)", async function () {
      const { meritCoin, meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          0
        );
      await meetupManager.connect(invitee1).confirmMeetup(1);
      await meetupManager.connect(invitee2).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("90");
      // invitee1 registers the bill (is the payer)
      await meetupManager.connect(invitee1).registerBill(1, billAmount);

      const creatorBefore = await meritCoin.balanceOf(creator.address);
      const invitee1Before = await meritCoin.balanceOf(invitee1.address);
      const invitee2Before = await meritCoin.balanceOf(invitee2.address);

      await meetupManager.connect(creator).settleBill(1);

      const splitAmount = billAmount / 3n;
      const creatorAfter = await meritCoin.balanceOf(creator.address);
      const invitee1After = await meritCoin.balanceOf(invitee1.address);
      const invitee2After = await meritCoin.balanceOf(invitee2.address);

      // invitee1 is the payer: creator and invitee2 pay invitee1
      expect(creatorAfter).to.equal(creatorBefore - splitAmount);
      expect(invitee2After).to.equal(invitee2Before - splitAmount);
      expect(invitee1After).to.equal(invitee1Before + splitAmount * 2n);
    });

    it("should record settlement for each non-payer", async function () {
      const { meritCoin, meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          0
        );
      await meetupManager.connect(invitee1).confirmMeetup(1);
      await meetupManager.connect(invitee2).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("90");
      await meetupManager.connect(creator).registerBill(1, billAmount);
      await meetupManager.connect(creator).settleBill(1);

      // Creator paid the bill -> invitee1 and invitee2 are debtors
      const [invitee1Paid, invitee1Received] = await meritCoin.getReputation(
        invitee1.address
      );
      expect(invitee1Paid).to.equal(1n);
      expect(invitee1Received).to.equal(0n);

      const [invitee2Paid, invitee2Received] = await meritCoin.getReputation(
        invitee2.address
      );
      expect(invitee2Paid).to.equal(1n);
      expect(invitee2Received).to.equal(0n);

      const [creatorPaid, creatorReceived] = await meritCoin.getReputation(
        creator.address
      );
      expect(creatorPaid).to.equal(0n);
      expect(creatorReceived).to.equal(2n); // received from 2 debtors
    });

    it("should emit BillSettled with correct splitAmount and participants", async function () {
      const { meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          0
        );
      await meetupManager.connect(invitee1).confirmMeetup(1);
      await meetupManager.connect(invitee2).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("90");
      await meetupManager.connect(creator).registerBill(1, billAmount);

      const splitAmount = billAmount / 3n;
      await expect(meetupManager.connect(creator).settleBill(1))
        .to.emit(meetupManager, "BillSettled")
        .withArgs(1n, splitAmount, 3n);
    });

    it("should revert if bill is not registered", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);
      await meetupManager.connect(invitee1).confirmMeetup(1);

      await expect(
        meetupManager.connect(creator).settleBill(1)
      ).to.be.revertedWith("Bill not registered");
    });
  });

  describe("cancelMeetup", function () {
    it("should cancel a pending meetup by creator", async function () {
      const { meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          0
        );
      await meetupManager.connect(creator).cancelMeetup(1);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.status).to.equal(4n); // Cancelled
    });

    it("should emit MeetupCancelled event", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);

      await expect(meetupManager.connect(creator).cancelMeetup(1))
        .to.emit(meetupManager, "MeetupCancelled")
        .withArgs(1n);
    });

    it("should revert if caller is not creator", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);

      await expect(
        meetupManager.connect(invitee1).cancelMeetup(1)
      ).to.be.revertedWith("Only creator");
    });

    it("should revert if meetup is already settled", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);
      await meetupManager.connect(invitee1).confirmMeetup(1);
      await meetupManager.connect(creator).registerBill(1, hre.ethers.parseEther("50"));
      await meetupManager.connect(creator).settleBill(1);

      await expect(
        meetupManager.connect(creator).cancelMeetup(1)
      ).to.be.revertedWith("Cannot cancel");
    });
  });

  describe("getConfirmationStatus", function () {
    it("should return false before confirming", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);

      expect(
        await meetupManager.getConfirmationStatus(1, invitee1.address)
      ).to.equal(false);
    });

    it("should return true after confirming", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);
      await meetupManager.connect(invitee1).confirmMeetup(1);

      expect(
        await meetupManager.getConfirmationStatus(1, invitee1.address)
      ).to.equal(true);
    });
  });

  describe("getUserMeetups", function () {
    it("should return correct meetup IDs for user", async function () {
      const { meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);
      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-2",
          0
        );

      const creatorMeetups = await meetupManager.getUserMeetups(
        creator.address
      );
      expect(creatorMeetups).to.deep.equal([1n, 2n]);

      const invitee1Meetups = await meetupManager.getUserMeetups(
        invitee1.address
      );
      expect(invitee1Meetups).to.deep.equal([1n, 2n]);

      const invitee2Meetups = await meetupManager.getUserMeetups(
        invitee2.address
      );
      expect(invitee2Meetups).to.deep.equal([2n]);
    });

    it("should return empty array for user with no meetups", async function () {
      const { meetupManager, outsider } = await loadFixture(deployFixture);
      const meetups = await meetupManager.getUserMeetups(outsider.address);
      expect(meetups).to.deep.equal([]);
    });
  });

  describe("meetupCount", function () {
    it("should start at zero", async function () {
      const { meetupManager } = await loadFixture(deployFixture);
      expect(await meetupManager.meetupCount()).to.equal(0n);
    });
  });

  describe("Stake/Escrow", function () {
    const STAKE_AMOUNT = hre.ethers.parseEther("5");
    const FAUCET_AMOUNT = hre.ethers.parseEther("100");

    it("should create meetup with stake and transfer creator's stake", async function () {
      const { meritCoin, meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      const creatorBefore = await meritCoin.balanceOf(creator.address);
      const managerAddress = await meetupManager.getAddress();
      const contractBefore = await meritCoin.balanceOf(managerAddress);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", STAKE_AMOUNT);

      const creatorAfter = await meritCoin.balanceOf(creator.address);
      const contractAfter = await meritCoin.balanceOf(managerAddress);

      expect(creatorAfter).to.equal(creatorBefore - STAKE_AMOUNT);
      expect(contractAfter).to.equal(contractBefore + STAKE_AMOUNT);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.stakeAmount).to.equal(STAKE_AMOUNT);

      expect(await meetupManager.getStakeStatus(1, creator.address)).to.equal(true);
    });

    it("should transfer invitee's stake on confirm", async function () {
      const { meritCoin, meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", STAKE_AMOUNT);

      const inviteeBefore = await meritCoin.balanceOf(invitee1.address);
      const managerAddress = await meetupManager.getAddress();
      const contractBefore = await meritCoin.balanceOf(managerAddress);

      await meetupManager.connect(invitee1).confirmMeetup(1);

      const inviteeAfter = await meritCoin.balanceOf(invitee1.address);
      const contractAfter = await meritCoin.balanceOf(managerAddress);

      expect(inviteeAfter).to.equal(inviteeBefore - STAKE_AMOUNT);
      expect(contractAfter).to.equal(contractBefore + STAKE_AMOUNT);

      expect(await meetupManager.getStakeStatus(1, invitee1.address)).to.equal(true);
    });

    it("should return all stakes on successful settlement", async function () {
      const { meritCoin, meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          STAKE_AMOUNT
        );
      await meetupManager.connect(invitee1).confirmMeetup(1);
      await meetupManager.connect(invitee2).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("30");
      await meetupManager.connect(creator).registerBill(1, billAmount);

      // All participants have approved and have balances, so all stakes should be returned
      const creatorBefore = await meritCoin.balanceOf(creator.address);
      const invitee1Before = await meritCoin.balanceOf(invitee1.address);
      const invitee2Before = await meritCoin.balanceOf(invitee2.address);

      await meetupManager.connect(creator).settleBill(1);

      const splitAmount = billAmount / 3n;
      const creatorAfter = await meritCoin.balanceOf(creator.address);
      const invitee1After = await meritCoin.balanceOf(invitee1.address);
      const invitee2After = await meritCoin.balanceOf(invitee2.address);

      // Creator is billPayer: receives splitAmount from each non-payer + gets stake back
      // invitee1 and invitee2: pay splitAmount + get stake back
      expect(invitee1After).to.equal(invitee1Before - splitAmount + STAKE_AMOUNT);
      expect(invitee2After).to.equal(invitee2Before - splitAmount + STAKE_AMOUNT);
      // Creator: gets 2 * splitAmount + stake back
      expect(creatorAfter).to.equal(creatorBefore + splitAmount * 2n + STAKE_AMOUNT);

      // Contract should have zero balance
      const managerAddress = await meetupManager.getAddress();
      expect(await meritCoin.balanceOf(managerAddress)).to.equal(0n);
    });

    it("should forfeit stake of non-payer on settlement", async function () {
      const { meritCoin, meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", STAKE_AMOUNT);
      await meetupManager.connect(invitee1).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("50");
      await meetupManager.connect(creator).registerBill(1, billAmount);

      // Revoke invitee1's approval so they cannot pay the split
      const managerAddress = await meetupManager.getAddress();
      await meritCoin.connect(invitee1).approve(managerAddress, 0);

      const creatorBefore = await meritCoin.balanceOf(creator.address);
      const invitee1Before = await meritCoin.balanceOf(invitee1.address);

      await meetupManager.connect(creator).settleBill(1);

      const creatorAfter = await meritCoin.balanceOf(creator.address);
      const invitee1After = await meritCoin.balanceOf(invitee1.address);

      // invitee1 cannot pay split -> their stake is forfeited to creator (billPayer)
      // invitee1 balance unchanged (no transfer out, no stake back)
      expect(invitee1After).to.equal(invitee1Before);
      // Creator gets their own stake back + invitee1's forfeited stake (no split payment from invitee1)
      expect(creatorAfter).to.equal(creatorBefore + STAKE_AMOUNT + STAKE_AMOUNT);
    });

    it("should return all stakes on cancel (Pending)", async function () {
      const { meritCoin, meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", STAKE_AMOUNT);

      // Only creator has deposited stake at this point
      const creatorBefore = await meritCoin.balanceOf(creator.address);

      await meetupManager.connect(creator).cancelMeetup(1);

      const creatorAfter = await meritCoin.balanceOf(creator.address);
      expect(creatorAfter).to.equal(creatorBefore + STAKE_AMOUNT);

      const managerAddress = await meetupManager.getAddress();
      expect(await meritCoin.balanceOf(managerAddress)).to.equal(0n);
    });

    it("should return all stakes on cancel (Confirmed)", async function () {
      const { meritCoin, meetupManager, creator, invitee1, invitee2 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(
          [invitee1.address, invitee2.address],
          "restaurant-1",
          STAKE_AMOUNT
        );
      await meetupManager.connect(invitee1).confirmMeetup(1);
      await meetupManager.connect(invitee2).confirmMeetup(1);

      // All 3 have deposited stakes, meetup is Confirmed
      const creatorBefore = await meritCoin.balanceOf(creator.address);
      const invitee1Before = await meritCoin.balanceOf(invitee1.address);
      const invitee2Before = await meritCoin.balanceOf(invitee2.address);

      await meetupManager.connect(creator).cancelMeetup(1);

      const creatorAfter = await meritCoin.balanceOf(creator.address);
      const invitee1After = await meritCoin.balanceOf(invitee1.address);
      const invitee2After = await meritCoin.balanceOf(invitee2.address);

      expect(creatorAfter).to.equal(creatorBefore + STAKE_AMOUNT);
      expect(invitee1After).to.equal(invitee1Before + STAKE_AMOUNT);
      expect(invitee2After).to.equal(invitee2Before + STAKE_AMOUNT);

      const managerAddress = await meetupManager.getAddress();
      expect(await meritCoin.balanceOf(managerAddress)).to.equal(0n);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.status).to.equal(4n); // Cancelled
    });

    it("should work with stakeAmount = 0 (backward compatible)", async function () {
      const { meritCoin, meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", 0);
      await meetupManager.connect(invitee1).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("50");
      await meetupManager.connect(creator).registerBill(1, billAmount);

      const creatorBefore = await meritCoin.balanceOf(creator.address);
      const inviteeBefore = await meritCoin.balanceOf(invitee1.address);

      await meetupManager.connect(invitee1).settleBill(1);

      const splitAmount = billAmount / 2n;
      const creatorAfter = await meritCoin.balanceOf(creator.address);
      const inviteeAfter = await meritCoin.balanceOf(invitee1.address);

      expect(creatorAfter).to.equal(creatorBefore + splitAmount);
      expect(inviteeAfter).to.equal(inviteeBefore - splitAmount);

      // No stakes involved
      expect(await meetupManager.getStakeStatus(1, creator.address)).to.equal(false);
      expect(await meetupManager.getStakeStatus(1, invitee1.address)).to.equal(false);
    });

    it("should emit StakeDeposited events", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      // Creator creates meetup with stake
      await expect(
        meetupManager
          .connect(creator)
          .createMeetup([invitee1.address], "restaurant-1", STAKE_AMOUNT)
      )
        .to.emit(meetupManager, "StakeDeposited")
        .withArgs(1n, creator.address, STAKE_AMOUNT);

      // Invitee confirms and deposits stake
      await expect(meetupManager.connect(invitee1).confirmMeetup(1))
        .to.emit(meetupManager, "StakeDeposited")
        .withArgs(1n, invitee1.address, STAKE_AMOUNT);
    });

    it("should emit StakeReturned events on settlement", async function () {
      const { meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", STAKE_AMOUNT);
      await meetupManager.connect(invitee1).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("20");
      await meetupManager.connect(creator).registerBill(1, billAmount);

      // Both participants can pay, so both stakes returned
      const tx = meetupManager.connect(creator).settleBill(1);

      await expect(tx)
        .to.emit(meetupManager, "StakeReturned")
        .withArgs(1n, invitee1.address, STAKE_AMOUNT);

      await expect(tx)
        .to.emit(meetupManager, "StakeReturned")
        .withArgs(1n, creator.address, STAKE_AMOUNT);
    });

    it("should emit StakeForfeited events for defaulters", async function () {
      const { meritCoin, meetupManager, creator, invitee1 } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup([invitee1.address], "restaurant-1", STAKE_AMOUNT);
      await meetupManager.connect(invitee1).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("50");
      await meetupManager.connect(creator).registerBill(1, billAmount);

      // Revoke invitee1's approval
      const managerAddress = await meetupManager.getAddress();
      await meritCoin.connect(invitee1).approve(managerAddress, 0);

      await expect(meetupManager.connect(creator).settleBill(1))
        .to.emit(meetupManager, "StakeForfeited")
        .withArgs(1n, invitee1.address, creator.address, STAKE_AMOUNT);
    });
  });
});
