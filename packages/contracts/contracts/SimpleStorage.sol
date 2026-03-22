// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract SimpleStorage {
    uint256 private _value;
    address public lastSetter;
    uint256 public setCount;

    event ValueChanged(address indexed setter, uint256 oldValue, uint256 newValue, uint256 timestamp);

    function setValue(uint256 newValue) external {
        uint256 oldValue = _value;
        _value = newValue;
        lastSetter = msg.sender;
        setCount++;
        emit ValueChanged(msg.sender, oldValue, newValue, block.timestamp);
    }

    function getValue() external view returns (uint256) {
        return _value;
    }

    function getState() external view returns (uint256 value, address setter, uint256 count) {
        return (_value, lastSetter, setCount);
    }
}
