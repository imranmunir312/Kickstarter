// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <=0.9.0;
import "./Campaign.sol";

contract FactoryCampaign {
    Campaign[] public campaigns;

    function createCampaign(uint256 _minContribution) public {
        Campaign newCampaign = new Campaign(_minContribution, msg.sender);
        campaigns.push(newCampaign);
    }

    function getCampaign(uint256 _index) public view returns (Campaign) {
        require(_index < campaigns.length, "Campaign Index out of range");
        return campaigns[_index];
    }

    function getCampaignCount() public view returns (uint256) {
        return campaigns.length;
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        return campaigns;
    }
}
