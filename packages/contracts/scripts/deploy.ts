import hre from "hardhat";

async function main() {
  // Deploy SimpleStorage
  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
  console.log("Deploying SimpleStorage to", hre.network.name, "...");
  const simpleStorage = await SimpleStorage.deploy();
  await simpleStorage.waitForDeployment();
  const simpleStorageAddress = await simpleStorage.getAddress();
  console.log("SimpleStorage deployed to:", simpleStorageAddress);

  // Deploy MeritCoin
  const MeritCoin = await hre.ethers.getContractFactory("MeritCoin");
  console.log("Deploying MeritCoin...");
  const meritCoin = await MeritCoin.deploy();
  await meritCoin.waitForDeployment();
  const meritCoinAddress = await meritCoin.getAddress();
  console.log("MeritCoin deployed to:", meritCoinAddress);

  // Deploy MeetupManager
  const MeetupManager = await hre.ethers.getContractFactory("MeetupManager");
  console.log("Deploying MeetupManager...");
  const meetupManager = await MeetupManager.deploy(meritCoinAddress);
  await meetupManager.waitForDeployment();
  const meetupManagerAddress = await meetupManager.getAddress();
  console.log("MeetupManager deployed to:", meetupManagerAddress);

  // Link MeetupManager in MeritCoin
  console.log("Setting MeetupManager in MeritCoin...");
  await meritCoin.setMeetupManager(meetupManagerAddress);
  console.log("MeetupManager set successfully.");

  console.log("\nUpdate your .env files with:");
  console.log(`NEXT_PUBLIC_SIMPLE_STORAGE_ADDRESS=${simpleStorageAddress}`);
  console.log(`NEXT_PUBLIC_MERITCOIN_ADDRESS=${meritCoinAddress}`);
  console.log(`NEXT_PUBLIC_MEETUP_MANAGER_ADDRESS=${meetupManagerAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
