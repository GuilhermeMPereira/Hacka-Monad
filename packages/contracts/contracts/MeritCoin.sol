// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MeritCoin is ERC20 {
    address public owner;
    address public meetupManager;

    mapping(address => bool) public hasClaimed;
    mapping(address => uint256) public paymentsMade;
    mapping(address => uint256) public paymentsReceived;

    uint256 public constant FAUCET_AMOUNT = 100 * 10 ** 18;

    event FaucetClaim(address indexed user, uint256 amount);
    event SettlementRecorded(
        address indexed payer,
        address indexed receiver,
        uint256 amount
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "MeritCoin: caller is not the owner");
        _;
    }

    modifier onlyMeetupManager() {
        require(
            msg.sender == meetupManager,
            "MeritCoin: caller is not the MeetupManager"
        );
        _;
    }

    constructor() ERC20("MeritCoin", "MERIT") {
        owner = msg.sender;
    }

    function setMeetupManager(address _meetupManager) external onlyOwner {
        require(
            _meetupManager != address(0),
            "MeritCoin: invalid manager address"
        );
        meetupManager = _meetupManager;
    }

    function faucet() external {
        require(!hasClaimed[msg.sender], "MeritCoin: already claimed");
        hasClaimed[msg.sender] = true;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaim(msg.sender, FAUCET_AMOUNT);
    }

    function hasClaimedFaucet(address user) external view returns (bool) {
        return hasClaimed[user];
    }

    function recordSettlement(
        address payer,
        address receiver,
        uint256 amount
    ) external onlyMeetupManager {
        paymentsMade[payer]++;
        paymentsReceived[receiver]++;
        emit SettlementRecorded(payer, receiver, amount);
    }

    function getReputation(
        address user
    ) external view returns (uint256 paid, uint256 received) {
        return (paymentsMade[user], paymentsReceived[user]);
    }
}
