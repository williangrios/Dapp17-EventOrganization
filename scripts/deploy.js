
const hre = require("hardhat");

async function main() {
  const EventContract = await hre.ethers.getContractFactory("EventContract");
  const eventContract = await EventContract.deploy();

  await eventContract.deployed();

  console.log(
    `Contract deployed to ${eventContract.address}`
  );
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
