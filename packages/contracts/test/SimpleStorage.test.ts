import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("SimpleStorage", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();
    return { simpleStorage, owner, otherAccount };
  }

  it("should start with value 0", async function () {
    const { simpleStorage } = await loadFixture(deployFixture);
    expect(await simpleStorage.getValue()).to.equal(0n);
  });

  it("should store a value", async function () {
    const { simpleStorage, owner } = await loadFixture(deployFixture);
    await simpleStorage.setValue(42);
    expect(await simpleStorage.getValue()).to.equal(42n);
    expect(await simpleStorage.lastSetter()).to.equal(owner.address);
    expect(await simpleStorage.setCount()).to.equal(1n);
  });

  it("should emit ValueChanged event", async function () {
    const { simpleStorage, owner } = await loadFixture(deployFixture);
    await expect(simpleStorage.setValue(100))
      .to.emit(simpleStorage, "ValueChanged")
      .withArgs(owner.address, 0n, 100n, (v: bigint) => v > 0n);
  });

  it("should return full state via getState", async function () {
    const { simpleStorage, otherAccount } = await loadFixture(deployFixture);
    await simpleStorage.connect(otherAccount).setValue(999);
    const [value, setter, count] = await simpleStorage.getState();
    expect(value).to.equal(999n);
    expect(setter).to.equal(otherAccount.address);
    expect(count).to.equal(1n);
  });
});
