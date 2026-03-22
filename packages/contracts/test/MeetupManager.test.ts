import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("MeetupManager", function () {
  async function deployFixture() {
    const [owner, creator, invitee, outsider] = await hre.ethers.getSigners();

    const MeritCoin = await hre.ethers.getContractFactory("MeritCoin");
    const meritCoin = await MeritCoin.deploy();

    const MeetupManager = await hre.ethers.getContractFactory("MeetupManager");
    const meetupManager = await MeetupManager.deploy(
      await meritCoin.getAddress()
    );

    // Set the MeetupManager on MeritCoin so recordSettlement works
    await meritCoin.setMeetupManager(await meetupManager.getAddress());

    // Give creator and invitee tokens via faucet
    await meritCoin.connect(creator).faucet();
    await meritCoin.connect(invitee).faucet();

    // Approve MeetupManager to spend tokens on behalf of creator and invitee
    const managerAddress = await meetupManager.getAddress();
    const maxApproval = hre.ethers.MaxUint256;
    await meritCoin.connect(creator).approve(managerAddress, maxApproval);
    await meritCoin.connect(invitee).approve(managerAddress, maxApproval);

    return { meritCoin, meetupManager, owner, creator, invitee, outsider };
  }

  describe("createMeetup", function () {
    it("should create a meetup correctly", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.id).to.equal(1n);
      expect(meetup.creator).to.equal(creator.address);
      expect(meetup.invitee).to.equal(invitee.address);
      expect(meetup.restaurantId).to.equal("restaurant-1");
      expect(meetup.status).to.equal(0n); // Pending
      expect(meetup.billAmount).to.equal(0n);
      expect(meetup.createdAt).to.be.greaterThan(0n);
    });

    it("should emit MeetupCreated event", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await expect(
        meetupManager
          .connect(creator)
          .createMeetup(invitee.address, "restaurant-1")
      )
        .to.emit(meetupManager, "MeetupCreated")
        .withArgs(1n, creator.address, invitee.address, "restaurant-1");
    });

    it("should revert if invitee is creator", async function () {
      const { meetupManager, creator } = await loadFixture(deployFixture);

      await expect(
        meetupManager
          .connect(creator)
          .createMeetup(creator.address, "restaurant-1")
      ).to.be.revertedWith("MeetupManager: cannot invite yourself");
    });

    it("should revert if invitee is zero address", async function () {
      const { meetupManager, creator } = await loadFixture(deployFixture);

      await expect(
        meetupManager
          .connect(creator)
          .createMeetup(hre.ethers.ZeroAddress, "restaurant-1")
      ).to.be.revertedWith("MeetupManager: invalid invitee address");
    });

    it("should increment meetup count", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");
      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-2");

      expect(await meetupManager.meetupCount()).to.equal(2n);
    });
  });

  describe("confirmMeetup", function () {
    it("should confirm meetup by invitee", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");
      await meetupManager.connect(invitee).confirmMeetup(1);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.status).to.equal(1n); // Confirmed
    });

    it("should emit MeetupConfirmed event", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");

      await expect(meetupManager.connect(invitee).confirmMeetup(1))
        .to.emit(meetupManager, "MeetupConfirmed")
        .withArgs(1n);
    });

    it("should revert if caller is not invitee", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");

      await expect(
        meetupManager.connect(creator).confirmMeetup(1)
      ).to.be.revertedWith("MeetupManager: only invitee can confirm");
    });

    it("should revert if meetup is not pending", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");
      await meetupManager.connect(invitee).confirmMeetup(1);

      await expect(
        meetupManager.connect(invitee).confirmMeetup(1)
      ).to.be.revertedWith("MeetupManager: meetup is not pending");
    });
  });

  describe("registerBill", function () {
    it("should register bill when confirmed", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");
      await meetupManager.connect(invitee).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("50");
      await meetupManager.connect(creator).registerBill(1, billAmount);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.billAmount).to.equal(billAmount);
      expect(meetup.billPayer).to.equal(creator.address);
      expect(meetup.status).to.equal(2n); // BillRegistered
    });

    it("should emit BillRegistered event", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");
      await meetupManager.connect(invitee).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("50");
      await expect(
        meetupManager.connect(creator).registerBill(1, billAmount)
      )
        .to.emit(meetupManager, "BillRegistered")
        .withArgs(1n, creator.address, billAmount);
    });

    it("should revert if caller is not a participant", async function () {
      const { meetupManager, creator, invitee, outsider } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");
      await meetupManager.connect(invitee).confirmMeetup(1);

      await expect(
        meetupManager
          .connect(outsider)
          .registerBill(1, hre.ethers.parseEther("50"))
      ).to.be.revertedWith("MeetupManager: only participants can register bill");
    });

    it("should revert if meetup is not confirmed", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");

      await expect(
        meetupManager
          .connect(creator)
          .registerBill(1, hre.ethers.parseEther("50"))
      ).to.be.revertedWith("MeetupManager: meetup is not confirmed");
    });
  });

  describe("settleBill", function () {
    it("should transfer MeritCoin correctly (debtor -> billPayer)", async function () {
      const { meritCoin, meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");
      await meetupManager.connect(invitee).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("50");
      await meetupManager.connect(creator).registerBill(1, billAmount);

      const creatorBefore = await meritCoin.balanceOf(creator.address);
      const inviteeBefore = await meritCoin.balanceOf(invitee.address);

      await meetupManager.connect(invitee).settleBill(1);

      const splitAmount = billAmount / 2n;
      const creatorAfter = await meritCoin.balanceOf(creator.address);
      const inviteeAfter = await meritCoin.balanceOf(invitee.address);

      // Invitee is the debtor (creator paid the bill), so invitee pays creator
      expect(creatorAfter).to.equal(creatorBefore + splitAmount);
      expect(inviteeAfter).to.equal(inviteeBefore - splitAmount);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.status).to.equal(3n); // Settled
    });

    it("should emit BillSettled event", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");
      await meetupManager.connect(invitee).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("50");
      await meetupManager.connect(creator).registerBill(1, billAmount);

      const splitAmount = billAmount / 2n;
      await expect(meetupManager.connect(creator).settleBill(1))
        .to.emit(meetupManager, "BillSettled")
        .withArgs(1n, splitAmount);
    });

    it("should update reputation via recordSettlement", async function () {
      const { meritCoin, meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");
      await meetupManager.connect(invitee).confirmMeetup(1);

      const billAmount = hre.ethers.parseEther("50");
      await meetupManager.connect(creator).registerBill(1, billAmount);
      await meetupManager.connect(creator).settleBill(1);

      // Creator paid the bill, invitee is the debtor
      const [inviteePaid, inviteeReceived] = await meritCoin.getReputation(
        invitee.address
      );
      expect(inviteePaid).to.equal(1n); // invitee made a payment (debtor)
      expect(inviteeReceived).to.equal(0n);

      const [creatorPaid, creatorReceived] = await meritCoin.getReputation(
        creator.address
      );
      expect(creatorPaid).to.equal(0n);
      expect(creatorReceived).to.equal(1n); // creator received a payment (billPayer)
    });

    it("should revert if bill is not registered", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");
      await meetupManager.connect(invitee).confirmMeetup(1);

      await expect(
        meetupManager.connect(creator).settleBill(1)
      ).to.be.revertedWith("MeetupManager: bill not registered");
    });
  });

  describe("cancelMeetup", function () {
    it("should cancel a pending meetup by creator", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");
      await meetupManager.connect(creator).cancelMeetup(1);

      const meetup = await meetupManager.getMeetup(1);
      expect(meetup.status).to.equal(4n); // Cancelled
    });

    it("should emit MeetupCancelled event", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");

      await expect(meetupManager.connect(creator).cancelMeetup(1))
        .to.emit(meetupManager, "MeetupCancelled")
        .withArgs(1n);
    });

    it("should revert if caller is not creator", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");

      await expect(
        meetupManager.connect(invitee).cancelMeetup(1)
      ).to.be.revertedWith("MeetupManager: only creator can cancel");
    });

    it("should revert if meetup is not pending", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");
      await meetupManager.connect(invitee).confirmMeetup(1);

      await expect(
        meetupManager.connect(creator).cancelMeetup(1)
      ).to.be.revertedWith("MeetupManager: meetup is not pending");
    });
  });

  describe("getUserMeetups", function () {
    it("should return correct meetup IDs for user", async function () {
      const { meetupManager, creator, invitee } =
        await loadFixture(deployFixture);

      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-1");
      await meetupManager
        .connect(creator)
        .createMeetup(invitee.address, "restaurant-2");

      const creatorMeetups = await meetupManager.getUserMeetups(
        creator.address
      );
      expect(creatorMeetups).to.deep.equal([1n, 2n]);

      const inviteeMeetups = await meetupManager.getUserMeetups(
        invitee.address
      );
      expect(inviteeMeetups).to.deep.equal([1n, 2n]);
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
});
