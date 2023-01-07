// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/** @title A library that provides the ETH => USD conversion feature
 * @author Adam Sobieski
 * @notice This is to facilitate FundMe contract
 * @dev This implements a price feed as a library
 */
library PriceConverter {
    /**
     * @notice This function returns the latest ETH/USD price
     * @param _priceFeed Price feed interface
     * @return Latest ETH/USD price
     */
    function getPrice(
        AggregatorV3Interface _priceFeed
    ) internal view returns (uint256) {
        (, int256 price, , , ) = _priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    /**
     * @notice This function performs the price conversion from ETH to USD
     * @param _ethAmount Value in ETH
     * @param _priceFeed Price feed interface
     * @return Value in USD
     */
    function convertEthToUsd(
        uint256 _ethAmount,
        AggregatorV3Interface _priceFeed
    ) internal view returns (uint256) {
        return (_ethAmount * getPrice(_priceFeed)) / 1e18;
    }
}
