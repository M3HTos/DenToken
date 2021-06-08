// SPDX-License-Identifier: Unlicensed

pragma solidity ^0.7.3;

contract DenToken {
    string public name;
    string public symbol;

    uint public maxSupply;
    uint public initialSupply;
    uint public totalTokenSupply;
    uint8 public decimals;

    address public owner;

    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowed;

    constructor() {
        name = "DENTOKEN";
        symbol = "DNT";
        decimals = 18;
        initialSupply = 20000000;
        maxSupply = 100000000 * 10 ** decimals;
        totalTokenSupply = initialSupply * 10 ** decimals;
        balances[msg.sender] = totalTokenSupply;
        owner = msg.sender;
    }

    event Transfer(address indexed _from, address indexed _to, uint _amount);
    event Approval(address indexed _owner, address indexed _spender, uint _amount);

    // Объявляем модификатор для контроля вызова функции только владельцем
    modifier onlyOwner() {
        require(msg.sender == owner, "OnlyOwner function");
        _;
    }

    function totalSupply() public view returns (uint) {
        return totalTokenSupply;
    }

    function balanceOf(address _address) public view returns (uint) {
        return balances[_address];
    }

    function _transfer(address _from, address _to, uint _amount) internal {
        require(_from != address(0), "Transfer from the zero address");
        require(_to != address(0), "Transfer to the zero address");
        require(balances[_from] >= _amount, "Not enough tokens");
        
        balances[_from] -= _amount;
        balances[_to] += _amount;
        
        emit Transfer(_from, _to, _amount);
    }

    function _approve(address _owner, address _spender, uint256 _amount) internal {
        require(_owner != address(0), "Approve from zero address");
        require(_spender != address(0), "Approve to zero address");
        allowed[_owner][_spender] = _amount;
        emit Approval(_owner, _spender, _amount);
    }

    function transfer(address _to, uint _amount) public onlyOwner {
        _transfer(owner, _to, _amount);
        emit Transfer(msg.sender, _to, _amount);
    }

    function transferFrom(address _from, address _to, uint _amount) public {
        _transfer(_from, _to, _amount);
        
        require(allowed[_from][msg.sender] >= _amount, "Exceeds allowance");
        _approve(_from, msg.sender, allowed[_from][msg.sender] - _amount);
        
        emit Transfer(_from, _to, _amount);
    }

    function approve(address _spender, uint _amount) public {
        _approve(msg.sender, _spender, _amount);
    }

    function increaseAllowance(address _spender, uint256 _addedValue) public {
        _approve(msg.sender, _spender, allowed[msg.sender][_spender] + _addedValue);
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    }

    function decreaseAllowance(address _spender, uint256 _subValue) public {
        require(allowed[msg.sender][_spender] >= _subValue, "Decreased allowance below zero");
        _approve(msg.sender, _spender, allowed[msg.sender][_spender] - _subValue);
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    }

    function mint(address _to, uint _amount) public onlyOwner {
        require(_to != address(0), "Mint to zero address");
        uint newTotalSupply = totalTokenSupply + _amount;
        require(newTotalSupply <= maxSupply, "Mint exceeds max supply");

        balances[_to] += _amount;
        totalTokenSupply = newTotalSupply;
        
        emit Transfer(address(0), _to, _amount);
    }

    function burn(address _from, uint _amount) public onlyOwner {
        require(balances[_from] >= _amount, "Burn exceeds account balance");
        require(_from != address(0), "Burn from zero address");
        
        balances[_from] -= _amount;
        totalTokenSupply -= _amount;

        emit Transfer(_from, address(0), _amount);
    }

    function getAllowance(address _owner, address _spender) public view returns(uint) {
        return allowed[_owner][_spender];
    }
}