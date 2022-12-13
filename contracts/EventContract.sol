// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.17;

contract EventContract {
    
    struct Event {
        address admin;
        string name;
        uint date;
        uint price;
        uint ticketCount;
        uint ticketRemaining;
    }

    mapping (uint => Event) public events;
    //person => event => qtd tickets
    mapping (address => mapping (uint => uint)) public tickets;
    uint public nextEventId;
    
    constructor() {
        
    }

    function createEvent(string memory name, uint date, uint price, uint ticketCount) external {
        require( date > block.timestamp, "Wrong event date");
        require( ticketCount > 0, "Wrong ticket count");
        events[nextEventId] = Event(
            msg.sender,
            name,
            date, 
            price, 
            ticketCount,
            ticketCount
        );
        nextEventId++;
    }

    function buyTicket(uint id, uint quantity) eventExists(id) eventActive(id) payable external{
        Event storage _event = events[id];
        require(msg.value == (_event.price * quantity), "Not enough ether sent");
        require(_event.ticketRemaining >= quantity, "Not enough ticket left");
        _event.ticketRemaining -= quantity;
        tickets[msg.sender][id] += quantity;
    }

    function transferTicket(uint eventId, uint quantity, address to) eventExists(eventId) eventActive(eventId) external  {
        require(tickets[msg.sender][eventId] >= quantity, "not enough tickets");
        tickets[msg.sender][eventId] -= quantity;
        tickets[to][eventId] += quantity;
    }

    function getEvent(uint eventId) view external returns(Event memory){
        return events[eventId];
    }

    modifier eventExists(uint eventId) {
        require(events[eventId].date != 0, "This event does not exist");
        _;
    }

    modifier eventActive(uint eventId) {
        require(block.timestamp < events[eventId].date  , "This event is not active anymore");
        _;
    }

}