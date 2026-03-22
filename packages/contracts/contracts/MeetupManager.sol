// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MeritCoin.sol";

contract MeetupManager {
    enum MeetupStatus {
        Pending,
        Confirmed,
        BillRegistered,
        Settled,
        Cancelled
    }

    struct Meetup {
        uint256 id;
        address creator;
        address invitee;
        string restaurantId;
        MeetupStatus status;
        uint256 billAmount;
        address billPayer;
        uint256 createdAt;
    }

    address public meritCoin;
    uint256 private _meetupCount;

    mapping(uint256 => Meetup) public meetups;
    mapping(address => uint256[]) public userMeetups;

    event MeetupCreated(
        uint256 indexed id,
        address indexed creator,
        address indexed invitee,
        string restaurantId
    );
    event MeetupConfirmed(uint256 indexed id);
    event BillRegistered(
        uint256 indexed id,
        address indexed payer,
        uint256 amount
    );
    event BillSettled(uint256 indexed id, uint256 splitAmount);
    event MeetupCancelled(uint256 indexed id);

    constructor(address _meritCoin) {
        require(_meritCoin != address(0), "MeetupManager: invalid MeritCoin address");
        meritCoin = _meritCoin;
    }

    function createMeetup(
        address invitee,
        string calldata restaurantId
    ) external returns (uint256) {
        require(invitee != msg.sender, "MeetupManager: cannot invite yourself");
        require(invitee != address(0), "MeetupManager: invalid invitee address");

        _meetupCount++;
        uint256 meetupId = _meetupCount;

        meetups[meetupId] = Meetup({
            id: meetupId,
            creator: msg.sender,
            invitee: invitee,
            restaurantId: restaurantId,
            status: MeetupStatus.Pending,
            billAmount: 0,
            billPayer: address(0),
            createdAt: block.timestamp
        });

        userMeetups[msg.sender].push(meetupId);
        userMeetups[invitee].push(meetupId);

        emit MeetupCreated(meetupId, msg.sender, invitee, restaurantId);
        return meetupId;
    }

    function confirmMeetup(uint256 meetupId) external {
        Meetup storage meetup = meetups[meetupId];
        require(
            msg.sender == meetup.invitee,
            "MeetupManager: only invitee can confirm"
        );
        require(
            meetup.status == MeetupStatus.Pending,
            "MeetupManager: meetup is not pending"
        );

        meetup.status = MeetupStatus.Confirmed;
        emit MeetupConfirmed(meetupId);
    }

    function registerBill(uint256 meetupId, uint256 amount) external {
        Meetup storage meetup = meetups[meetupId];
        require(
            msg.sender == meetup.creator || msg.sender == meetup.invitee,
            "MeetupManager: only participants can register bill"
        );
        require(
            meetup.status == MeetupStatus.Confirmed,
            "MeetupManager: meetup is not confirmed"
        );
        require(amount > 0, "MeetupManager: amount must be greater than zero");

        meetup.billAmount = amount;
        meetup.billPayer = msg.sender;
        meetup.status = MeetupStatus.BillRegistered;

        emit BillRegistered(meetupId, msg.sender, amount);
    }

    function settleBill(uint256 meetupId) external {
        Meetup storage meetup = meetups[meetupId];
        require(
            msg.sender == meetup.creator || msg.sender == meetup.invitee,
            "MeetupManager: only participants can settle"
        );
        require(
            meetup.status == MeetupStatus.BillRegistered,
            "MeetupManager: bill not registered"
        );

        address debtor = meetup.billPayer == meetup.creator
            ? meetup.invitee
            : meetup.creator;
        uint256 splitAmount = meetup.billAmount / 2;

        meetup.status = MeetupStatus.Settled;

        IERC20(meritCoin).transferFrom(debtor, meetup.billPayer, splitAmount);
        MeritCoin(meritCoin).recordSettlement(
            debtor,
            meetup.billPayer,
            splitAmount
        );

        emit BillSettled(meetupId, splitAmount);
    }

    function cancelMeetup(uint256 meetupId) external {
        Meetup storage meetup = meetups[meetupId];
        require(
            msg.sender == meetup.creator,
            "MeetupManager: only creator can cancel"
        );
        require(
            meetup.status == MeetupStatus.Pending,
            "MeetupManager: meetup is not pending"
        );

        meetup.status = MeetupStatus.Cancelled;
        emit MeetupCancelled(meetupId);
    }

    function getMeetup(
        uint256 meetupId
    ) external view returns (Meetup memory) {
        return meetups[meetupId];
    }

    function getUserMeetups(
        address user
    ) external view returns (uint256[] memory) {
        return userMeetups[user];
    }

    function meetupCount() external view returns (uint256) {
        return _meetupCount;
    }
}
