import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const AuthPix: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("AuthPix", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
};

export default AuthPix;

AuthPix.tags = ["AuthPix"];
