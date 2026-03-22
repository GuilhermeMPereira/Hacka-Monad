import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {
  const meritCoin = m.contract("MeritCoin");

  const meetupManager = m.contract("MeetupManager", [meritCoin]);

  m.call(meritCoin, "setMeetupManager", [meetupManager]);

  return { meritCoin, meetupManager };
});

export default DeployModule;
