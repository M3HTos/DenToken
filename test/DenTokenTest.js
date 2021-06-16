const { expect } = require("chai");
const Decimal = require('decimal.js');

describe("Token contract", function() {
    let TokenFactory;
    let Token;
    let owner;
    let addr1;
    let addr2;
    let addr3;

    beforeEach(async function () {
        TokenFactory = await ethers.getContractFactory("DenToken");
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        Token = await TokenFactory.deploy();
    });

    // Тест развертки Токена в блокчейне
    describe("Deployment", function() {
        it("Owner", async function() {
            expect(await Token.owner()).to.equal(owner.address);
        });

        it("Total supply", async function() {
            const ownerBalance = await Token.balanceOf(owner.address);
            expect(await Token.totalSupply()).to.equal(ownerBalance);
        });
    });

    // Тест работы доверенности при переводе
    describe("Allowance", function() {
        // Тест предоставления доверенности
        it("Set allowance", async function() {
            await Token.connect(addr1).approve(addr2.address, 100);
            expect(await Token.getAllowance(addr1.address, addr2.address)).to.equal(100);
        })
        // Тест изменения доверенности
        it("Modify allowance", async function() {
            await Token.connect(addr1).increaseAllowance(addr2.address, 100);
            expect(await Token.getAllowance(addr1.address, addr2.address)).to.equal(100);
            
            await Token.connect(addr1).decreaseAllowance(addr2.address, 50);
            expect(await Token.getAllowance(addr1.address, addr2.address)).to.equal(50);
        });
        // Тест невозможности снизить доверенность ниже нуля
        it("Can't decrease below zero", async function() {
            await expect(Token.connect(addr1).decreaseAllowance(addr3.address, 100)).to.be.revertedWith("Decreased allowance below zero");
        })
        // Тест невозможности перевести средства аккаунтом без доверенности
        it("Can't transfer tokens without allowance", async function() {
            await Token.transfer(addr1.address, 50);
            await expect(Token.connect(addr1).transferFrom(addr1.address, addr2.address, 50)).to.be.revertedWith("Exceeds allowance");
        });
    });

    // Тест переводов
    describe("Transfers", function() {
        // Тест перевода между аккаунтами
        it("Transfer tokens from acc to acc", async function() {
            await Token.transfer(addr1.address, 100);
            const addr1Balance = await Token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(100);

            await Token.connect(addr1).increaseAllowance(addr1.address, 50);
            await Token.connect(addr1).transferFrom(addr1.address, addr2.address, 50);
            const addr2Balance = await Token.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);

            await Token.connect(addr1).increaseAllowance(addr2.address, 50);
            await Token.connect(addr2).transferFrom(addr1.address, addr3.address, 50);
            const addr3Balance = await Token.balanceOf(addr3.address);
            expect(addr3Balance).to.equal(50);
            
        });
    });
    // Тест "админских" функций
    describe("Owner functions", function() {
        // Тест сжигания токенов
        it("Burn supply", async function() {
            const supply = await Token.totalSupply();
            const balance = await Token.balanceOf(owner.address);
            await Token.burn(owner.address, 100);
            expect(await Token.balanceOf(owner.address) == balance - 100);
            expect(await Token.totalSupply() == supply - 100);
        });

        // Тест выпуска токенов
        it("Mint supply", async function() {
            const supply = await Token.totalSupply();
            const balance = await Token.balanceOf(owner.address);
            await Token.mint(owner.address, 100);
            expect(await Token.balanceOf(owner.address) == balance + 100);
            expect(await Token.totalSupply() == supply + 100);
        });

        // Тест невозможности сжечь больше, чем есть на балансе
        it("Can't burn more than balance", async function() {
            await expect(Token.burn(addr1.address, 50)).to.be.revertedWith("Burn exceeds account balance");
        });

        // Тест невозможности выпустить больше максимальной эмиссии
        // @dev Здесь я не совсем уверен, как вообще стоило передавать и обрабатывать значение
        // Т.к. кол-во токенов хранится в виде числа токенов, сдвинутых на 10^18, то 100млн выходит за пределы того,
        // что позволяет передать js в виде числа. 
        // Нашел вариант с передачей в виде строки неэскпоненциальной записи числа
        it("Can't mint more than maximum supply", async function() {
            const decimals = await Token.decimals();
            let amount = new Decimal(100000000*Math.pow(10, decimals), 10);
            await expect(Token.mint(addr1.address, amount.toFixed(amount.length))).to.be.revertedWith("Mint exceeds max supply");
        });
    });
});