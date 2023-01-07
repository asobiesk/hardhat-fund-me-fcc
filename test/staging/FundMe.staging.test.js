const { assert } = require("chai");
const { network, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name.toLowerCase())
    ? describe.skip
    : describe("FundMe Staging Tests", async () => {
          let deployer, fundMe;
          const SEND_VALUE = ethers.utils.parseEther("0.1");
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("allows people to fund and withdraw", async function () {
              const fundTxResponse = await fundMe.fund({ value: SEND_VALUE });
              await fundTxResponse.wait(1);
              const withdrawTxResponse = await fundMe.withdraw();
              await withdrawTxResponse.wait(1);

              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              );
              assert.equal(endingFundMeBalance.toString(), "0");
          });
      });
