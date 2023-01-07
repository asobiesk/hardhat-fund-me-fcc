const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name.toLowerCase())
    ? describe.skip
    : describe("FundMe", async () => {
          const SEND_VALUE = ethers.utils.parseEther("1"); //1 ETH
          let fundMe, deployer, mockV3Aggregator;
          beforeEach(async () => {
              deployer = (await getNamedAccounts())?.deployer;
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("constructor", async () => {
              it("sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe("fund", async () => {
              it("fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWithCustomError(
                      fundMe,
                      "FundMe__NotEnough"
                  );
              });

              it("updates the funders array with the funder address and amount", async () => {
                  await fundMe.fund({ value: SEND_VALUE });
                  const response = await fundMe.getFunder("0");
                  assert.equal(response.funderAddress, deployer);
                  assert.equal(response.value.toString(), SEND_VALUE);
              });
          });

          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: SEND_VALUE });
              });

              it("withdraws ETH from a single funder", async () => {
                  //Arrange
                  const startingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //Act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  //Assert
                  assert.equal(endingContractBalance, 0);
                  assert.equal(
                      startingContractBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("withdraws ETH from multiple funders", async () => {
                  //Arrange
                  const accounts = await ethers.getSigners();
                  for (let account of accounts.slice(1, 6)) {
                      const fundMeConnectedContract = await fundMe.connect(
                          account
                      );
                      await fundMeConnectedContract.fund({ value: SEND_VALUE });
                  }
                  const startingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //Act
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingContractBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //Assert
                  assert.equal(endingContractBalance, 0);
                  assert.equal(
                      startingContractBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
                  await expect(fundMe.getFunder(0)).to.be.revertedWithPanic;
              });

              it("declines the non-owner address to perform withdrawals", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1]; //Owner is accounts[0]
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(
                      attackerConnectedContract,
                      "FundMe__NotOwner"
                  );
              });
          });
      });
