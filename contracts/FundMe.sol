// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();
error FundMe__NotEnough();
error FundMe__WithdrawFailed();

/** @title A contract for crowd funding
 * @author Adam Sobieski
 * @notice This contract is to demo a sample funding contract
 * @dev This uses PriceConverter library to perform ETH => USD conversion
 */
contract FundMe {
    using PriceConverter for uint256;

    struct Funder {
        address funderAddress;
        uint256 value;
    }

    uint256 public constant MIN_USD = 50 * 1e18;
    Funder[] private s_funders;
    address private immutable i_owner;
    AggregatorV3Interface private immutable i_priceFeed;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address _priceFeedAddress) {
        i_owner = msg.sender;
        i_priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice This function funds this contract
     */
    function fund() public payable {
        if (msg.value.convertEthToUsd(i_priceFeed) < MIN_USD) {
            revert FundMe__NotEnough();
        }
        s_funders.push(Funder(msg.sender, msg.value));
    }

    /**
     * @notice This function withdraws funds, transferring them to the owner's account
     */
    function withdraw() public onlyOwner {
        clearFunders();
        (bool callSuccess /*, bytes memory dataReturned*/, ) = payable(
            msg.sender
        ).call{value: address(this).balance}(""); //if fails - returns false
        if (!callSuccess) {
            revert FundMe__WithdrawFailed();
        }
    }

    /**
     * @notice This function clears the array of founders when the withdrawal is performed
     */
    function clearFunders() private {
        delete s_funders;
    }

    /**
     * @notice This function retrieves a funder at a given index
     * @param _index Index of a funder
     * @return Funder
     */
    function getFunder(uint256 _index) public view returns (Funder memory) {
        return s_funders[_index];
    }

    /**
     * @notice This function retrieves a price feed
     * @return AggregatorV3Interface price feed
     */
    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }
}
