const { run } = require("hardhat");

async function verify(contractAddress, args) {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
        console.log("Contract verified");
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!");
        } else {
            console.log(error);
        }
    }
}

module.exports = {
    verify,
};
