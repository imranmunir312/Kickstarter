// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <=0.9.0;

contract Campaign {
    struct Request {
        uint256 value;
        string description;
        address recipient;
        bool completed;
        mapping(address => bool) approvals;
        uint256 approvalsCount;
    }

    address public manager;
    uint256 public minimumValue;
    mapping(uint256 => Request) public requests;
    uint256 public requestCount;
    mapping(address => bool) public approvers;
    uint256 public totalApprovers;

    modifier restricted() {
        require(
            msg.sender == manager,
            "Only the manager can perform this action."
        );
        _;
    }

    constructor(uint256 _minimumValue, address sender) {
        manager = sender;
        minimumValue = _minimumValue;
    }

    function contribute() public payable {
        require(msg.value >= minimumValue, "The contribution is not enough.");
        require(msg.sender != manager, "The manager cannot contribute.");
        require(!approvers[msg.sender], "You have already contributed.");
        approvers[msg.sender] = true;
        totalApprovers++;
    }

    function createRequest(
        string memory _description,
        uint256 _value,
        address _recipient
    ) public restricted {
        require(
            address(this).balance > _value,
            "The contract does not have enough funds."
        );
        require(_value >= minimumValue, "The request value is not enough.");
        require(totalApprovers > 0, "There are no approvers.");
        Request storage request = requests[requestCount++];

        request.value = _value;
        request.description = _description;
        request.recipient = _recipient;
        request.completed = false;
        request.approvalsCount++;
    }

    function requestApproval(uint256 _requestId) public {
        require(approvers[msg.sender], "You have not contributed.");
        require(_requestId < requestCount, "The request does not exist.");
        Request storage request = requests[_requestId];
        require(!request.completed, "The request has already been completed.");
        require(
            !request.approvals[msg.sender],
            "You have already approved this request."
        );

        request.approvals[msg.sender] = true;
        request.approvalsCount++;
    }

    function finalizeRequest(uint256 _requestId) public restricted {
        require(_requestId < requestCount, "The request does not exist.");
        Request storage request = requests[_requestId];
        require(!request.completed, "The request has already been completed.");
        require(
            request.approvalsCount >= totalApprovers / 2,
            "Not enough approvals."
        );

        request.completed = true;
        payable(request.recipient).transfer(request.value);
    }
}
