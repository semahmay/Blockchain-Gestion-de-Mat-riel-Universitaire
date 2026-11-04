import fs from "node:fs";
import path from "node:path";
import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("EquipmentLending");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const chain = await ethers.provider.getNetwork();
  const adminRole = await contract.ADMIN_ROLE();

  const deployment = {
    network: network.name,
    chainId: Number(chain.chainId),
    contract: "EquipmentLending",
    address,
    deployer: deployer.address,
    adminRole,
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(
    path.join(deploymentsDir, `${network.name}.json`),
    `${JSON.stringify(deployment, null, 2)}\n`,
  );

  console.log("EquipmentLending deployed locally");
  console.log(`  Network:  ${deployment.network} (chainId ${deployment.chainId})`);
  console.log(`  Address:  ${deployment.address}`);
  console.log(`  Deployer: ${deployment.deployer}`);
  console.log(`  Admin:    ${deployment.deployer} has ADMIN_ROLE`);
  console.log(`  Saved to: deployments/${network.name}.json`);
  console.log("\nThis deployment is local only. No public network or real funds are used.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
