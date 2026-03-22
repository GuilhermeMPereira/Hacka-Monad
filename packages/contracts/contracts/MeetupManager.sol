// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./MeritCoin.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MeetupManager {
    MeritCoin public meritCoin;

    enum MeetupStatus { Pending, Confirmed, BillRegistered, Disputed, Settled, Cancelled }

    struct Meetup {
        uint256 id;
        address creator;
        address[] invitees;
        string restaurantId;
        MeetupStatus status;
        uint256 billAmount;
        address billPayer;
        uint256 createdAt;
        uint256 stakeAmount;
    }

    mapping(uint256 => Meetup) private meetups;
    mapping(uint256 => mapping(address => bool)) public hasConfirmed;
    mapping(uint256 => uint256) public confirmCount;
    mapping(address => uint256[]) private userMeetups;
    mapping(uint256 => mapping(address => bool)) public stakeDeposited;
    mapping(uint256 => mapping(address => uint256)) public individualAmounts;
    mapping(uint256 => mapping(address => bool)) public hasAcceptedBill;
    mapping(uint256 => uint256) public acceptedCount;
    mapping(uint256 => uint256) public totalParticipantsCount;
    uint256 private _meetupCount;

    event MeetupCreated(uint256 indexed meetupId, address indexed creator, address[] invitees, string restaurantId);
    event MeetupConfirmed(uint256 indexed meetupId, address indexed invitee);
    event BillRegistered(uint256 indexed meetupId, address indexed payer, uint256 amount);
    event BillSettled(uint256 indexed meetupId, uint256 splitAmount, uint256 participants);
    event MeetupCancelled(uint256 indexed meetupId);
    event StakeDeposited(uint256 indexed meetupId, address indexed participant, uint256 amount);
    event StakeReturned(uint256 indexed meetupId, address indexed participant, uint256 amount);
    event StakeForfeited(uint256 indexed meetupId, address indexed participant, address indexed billPayer, uint256 amount);
    event BillAccepted(uint256 indexed meetupId, address indexed participant);
    event BillDisputed(uint256 indexed meetupId, address indexed participant);

    constructor(address _meritCoin) {
        meritCoin = MeritCoin(_meritCoin);
    }

    function createMeetup(address[] calldata invitees, string calldata restaurantId, uint256 stakeAmount) external returns (uint256) {
        require(invitees.length > 0, "Need at least one invitee");
        require(invitees.length <= 10, "Max 10 invitees");
        for (uint256 i = 0; i < invitees.length; i++) {
            require(invitees[i] != msg.sender, "Cannot invite yourself");
            require(invitees[i] != address(0), "Invalid invitee");
            // Check for duplicates
            for (uint256 j = i + 1; j < invitees.length; j++) {
                require(invitees[i] != invitees[j], "Duplicate invitee");
            }
        }

        _meetupCount++;
        uint256 meetupId = _meetupCount;

        Meetup storage m = meetups[meetupId];
        m.id = meetupId;
        m.creator = msg.sender;
        m.invitees = invitees;
        m.restaurantId = restaurantId;
        m.status = MeetupStatus.Pending;
        m.createdAt = block.timestamp;
        m.stakeAmount = stakeAmount;

        // Transfer creator's stake if stakeAmount > 0
        if (stakeAmount > 0) {
            IERC20(address(meritCoin)).transferFrom(msg.sender, address(this), stakeAmount);
            stakeDeposited[meetupId][msg.sender] = true;
            emit StakeDeposited(meetupId, msg.sender, stakeAmount);
        }

        userMeetups[msg.sender].push(meetupId);
        for (uint256 i = 0; i < invitees.length; i++) {
            userMeetups[invitees[i]].push(meetupId);
        }

        emit MeetupCreated(meetupId, msg.sender, invitees, restaurantId);
        return meetupId;
    }

    function confirmMeetup(uint256 meetupId) external {
        Meetup storage m = meetups[meetupId];
        require(m.status == MeetupStatus.Pending, "Not pending");
        require(_isInvitee(m, msg.sender), "Not an invitee");
        require(!hasConfirmed[meetupId][msg.sender], "Already confirmed");

        // Transfer invitee's stake if stakeAmount > 0
        if (m.stakeAmount > 0) {
            IERC20(address(meritCoin)).transferFrom(msg.sender, address(this), m.stakeAmount);
            stakeDeposited[meetupId][msg.sender] = true;
            emit StakeDeposited(meetupId, msg.sender, m.stakeAmount);
        }

        hasConfirmed[meetupId][msg.sender] = true;
        confirmCount[meetupId]++;

        emit MeetupConfirmed(meetupId, msg.sender);

        // Auto-transition to Confirmed when ALL invitees confirm
        if (confirmCount[meetupId] == m.invitees.length) {
            m.status = MeetupStatus.Confirmed;
        }
    }

    function registerBill(uint256 meetupId, uint256 totalAmount, uint256[] calldata amounts) external {
        Meetup storage m = meetups[meetupId];
        require(
            m.status == MeetupStatus.Confirmed || m.status == MeetupStatus.Disputed,
            "Not confirmed or disputed"
        );
        require(totalAmount > 0, "Amount must be > 0");
        require(_isParticipant(m, msg.sender), "Not a participant");
        require(amounts.length == m.invitees.length + 1, "Amounts length mismatch");

        uint256 sum = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            sum += amounts[i];
        }
        require(sum == totalAmount, "Amounts sum mismatch");

        // If re-registering after dispute, reset all acceptances
        if (m.status == MeetupStatus.Disputed) {
            hasAcceptedBill[meetupId][m.creator] = false;
            for (uint256 i = 0; i < m.invitees.length; i++) {
                hasAcceptedBill[meetupId][m.invitees[i]] = false;
            }
        }

        m.billAmount = totalAmount;
        m.billPayer = msg.sender;
        m.status = MeetupStatus.BillRegistered;

        // Store individual amounts: amounts[0] = creator, amounts[i+1] = invitees[i]
        individualAmounts[meetupId][m.creator] = amounts[0];
        for (uint256 i = 0; i < m.invitees.length; i++) {
            individualAmounts[meetupId][m.invitees[i]] = amounts[i + 1];
        }

        // Auto-accept for the bill registerer
        hasAcceptedBill[meetupId][msg.sender] = true;
        acceptedCount[meetupId] = 1;
        totalParticipantsCount[meetupId] = amounts.length;

        emit BillRegistered(meetupId, msg.sender, totalAmount);
    }

    function acceptBill(uint256 meetupId) external {
        Meetup storage m = meetups[meetupId];
        require(m.status == MeetupStatus.BillRegistered, "Bill not registered");
        require(_isParticipant(m, msg.sender), "Not a participant");
        require(!hasAcceptedBill[meetupId][msg.sender], "Already accepted");

        hasAcceptedBill[meetupId][msg.sender] = true;
        acceptedCount[meetupId]++;

        emit BillAccepted(meetupId, msg.sender);
    }

    function disputeBill(uint256 meetupId) external {
        Meetup storage m = meetups[meetupId];
        require(m.status == MeetupStatus.BillRegistered, "Bill not registered");
        require(_isParticipant(m, msg.sender), "Not a participant");
        require(msg.sender != m.billPayer, "Bill registerer cannot dispute");

        m.status = MeetupStatus.Disputed;

        emit BillDisputed(meetupId, msg.sender);
    }

    function settleBill(uint256 meetupId) external {
        Meetup storage m = meetups[meetupId];
        require(m.status == MeetupStatus.BillRegistered, "Bill not registered");
        require(_isParticipant(m, msg.sender), "Not a participant");
        require(
            acceptedCount[meetupId] == totalParticipantsCount[meetupId],
            "Not all participants accepted"
        );

        uint256 totalParticipants = m.invitees.length + 1; // invitees + creator

        // Checks-effects-interactions: set status BEFORE transfers
        m.status = MeetupStatus.Settled;

        // Process each non-payer participant using individual amounts
        // Creator
        if (m.creator != m.billPayer) {
            uint256 creatorAmount = individualAmounts[meetupId][m.creator];
            _processParticipantSettlement(meetupId, m, m.creator, m.billPayer, creatorAmount);
        }
        // Each invitee
        for (uint256 i = 0; i < m.invitees.length; i++) {
            if (m.invitees[i] != m.billPayer) {
                uint256 inviteeAmount = individualAmounts[meetupId][m.invitees[i]];
                _processParticipantSettlement(meetupId, m, m.invitees[i], m.billPayer, inviteeAmount);
            }
        }

        // Return billPayer's stake
        if (m.stakeAmount > 0 && stakeDeposited[meetupId][m.billPayer]) {
            IERC20(address(meritCoin)).transfer(m.billPayer, m.stakeAmount);
            emit StakeReturned(meetupId, m.billPayer, m.stakeAmount);
        }

        emit BillSettled(meetupId, m.billAmount, totalParticipants);
    }

    function _processParticipantSettlement(
        uint256 meetupId, Meetup storage m, address participant, address payer, uint256 splitAmount
    ) internal {
        IERC20 token = IERC20(address(meritCoin));
        bool canPay = token.allowance(participant, address(this)) >= splitAmount
                      && token.balanceOf(participant) >= splitAmount;

        if (canPay) {
            token.transferFrom(participant, payer, splitAmount);
            meritCoin.recordSettlement(participant, payer, splitAmount);
            // Return stake
            if (m.stakeAmount > 0 && stakeDeposited[meetupId][participant]) {
                token.transfer(participant, m.stakeAmount);
                emit StakeReturned(meetupId, participant, m.stakeAmount);
            }
        } else {
            // Forfeit stake to bill payer
            if (m.stakeAmount > 0 && stakeDeposited[meetupId][participant]) {
                token.transfer(payer, m.stakeAmount);
                emit StakeForfeited(meetupId, participant, payer, m.stakeAmount);
            }
        }
    }

    function cancelMeetup(uint256 meetupId) external {
        Meetup storage m = meetups[meetupId];
        require(m.creator == msg.sender, "Only creator");
        require(m.status == MeetupStatus.Pending || m.status == MeetupStatus.Confirmed, "Cannot cancel");

        // Set status BEFORE transfers (checks-effects-interactions)
        m.status = MeetupStatus.Cancelled;

        // Return all deposited stakes
        if (m.stakeAmount > 0) {
            IERC20 token = IERC20(address(meritCoin));
            // Return creator's stake
            if (stakeDeposited[meetupId][m.creator]) {
                token.transfer(m.creator, m.stakeAmount);
                emit StakeReturned(meetupId, m.creator, m.stakeAmount);
            }
            // Return invitees' stakes
            for (uint256 i = 0; i < m.invitees.length; i++) {
                if (stakeDeposited[meetupId][m.invitees[i]]) {
                    token.transfer(m.invitees[i], m.stakeAmount);
                    emit StakeReturned(meetupId, m.invitees[i], m.stakeAmount);
                }
            }
        }

        emit MeetupCancelled(meetupId);
    }

    function getMeetup(uint256 meetupId) external view returns (
        uint256 id,
        address creator,
        address[] memory invitees,
        string memory restaurantId,
        MeetupStatus status,
        uint256 billAmount,
        address billPayer,
        uint256 createdAt,
        uint256 stakeAmount
    ) {
        Meetup storage m = meetups[meetupId];
        return (m.id, m.creator, m.invitees, m.restaurantId, m.status, m.billAmount, m.billPayer, m.createdAt, m.stakeAmount);
    }

    function getUserMeetups(address user) external view returns (uint256[] memory) {
        return userMeetups[user];
    }

    function meetupCount() external view returns (uint256) {
        return _meetupCount;
    }

    function getConfirmationStatus(uint256 meetupId, address invitee) external view returns (bool) {
        return hasConfirmed[meetupId][invitee];
    }

    function getStakeStatus(uint256 meetupId, address participant) external view returns (bool) {
        return stakeDeposited[meetupId][participant];
    }

    function getIndividualAmount(uint256 meetupId, address participant) external view returns (uint256) {
        return individualAmounts[meetupId][participant];
    }

    function hasAccepted(uint256 meetupId, address participant) external view returns (bool) {
        return hasAcceptedBill[meetupId][participant];
    }

    function getAcceptedCount(uint256 meetupId) external view returns (uint256) {
        return acceptedCount[meetupId];
    }

    // Internal helpers
    function _isInvitee(Meetup storage m, address user) internal view returns (bool) {
        for (uint256 i = 0; i < m.invitees.length; i++) {
            if (m.invitees[i] == user) return true;
        }
        return false;
    }

    function _isParticipant(Meetup storage m, address user) internal view returns (bool) {
        if (m.creator == user) return true;
        return _isInvitee(m, user);
    }
}
