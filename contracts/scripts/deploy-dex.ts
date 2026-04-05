/**
 * deploy-dex.ts — Deploy full Uniswap V2 + V3 + Universal Router stack for JinkFi.
 *
 * Deployment order:
 *   1.  WETH9                          (or use canonical address on known networks)
 *   2.  UniswapV2Factory
 *   3.  UniswapV2Router02
 *   4.  UniswapV3Factory
 *   5.  NFTDescriptor                  (library, needed by step 6)
 *   6.  NonfungibleTokenPositionDescriptor
 *   7.  NonfungiblePositionManager
 *   8.  SwapRouter                     (V3 single-version router)
 *   9.  QuoterV2
 *   10. TickLens
 *   11. UniversalRouter                (V2 + V3, permit2-based)
 *
 * Usage:
 *   npx hardhat run scripts/deploy-dex.ts --network sepolia
 *   npx hardhat run scripts/deploy-dex.ts --network base
 *   npx hardhat run scripts/deploy-dex.ts --network localhost
 */

import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

// ── Canonical addresses ────────────────────────────────────────────────────────

/** Canonical Permit2 — same address on every EVM chain */
const PERMIT2 = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

/** Pre-deployed WETH9 by chainId (deployer gets a fresh one on unknown networks) */
const KNOWN_WETH9: Record<number, string> = {
  1:        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // Ethereum
  11155111: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", // Sepolia
  8453:     "0x4200000000000000000000000000000000000006", // Base
  84532:    "0x4200000000000000000000000000000000000006", // Base Sepolia
  42161:    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // Arbitrum
  10143:    "0x0000000000000000000000000000000000000000", // Monad testnet (deploy fresh)
  4217:     "0x0000000000000000000000000000000000000000", // Tempo (deploy fresh WUSD9)
};

/** Native currency label for NonfungibleTokenPositionDescriptor, by chainId */
const NATIVE_CURRENCY_LABEL: Record<number, string> = {
  4217: "USD", // Tempo native currency
};

/**
 * Standard Uniswap init-code hashes.
 * These are deterministic from the bytecode — the same whether you deploy via
 * this script or from the official Uniswap factory.
 */
const V2_PAIR_INIT_CODE_HASH =
  "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";
const V3_POOL_INIT_CODE_HASH =
  "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54";

// ── Library linker ────────────────────────────────────────────────────────────

/** Replace placeholder references in bytecode with deployed library addresses. */
function linkLibraries(
  artifact: { bytecode: string; linkReferences: Record<string, Record<string, Array<{ start: number; length: number }>>> },
  libraries: Record<string, string>
): string {
  let linked = artifact.bytecode;
  for (const [file, refs] of Object.entries(artifact.linkReferences)) {
    for (const [libName, locs] of Object.entries(refs)) {
      const key = `${file}:${libName}`;
      const addr = libraries[key] ?? libraries[libName];
      if (!addr) throw new Error(`Missing library address for: ${key}`);
      const addrHex = addr.toLowerCase().replace("0x", "").padStart(40, "0");
      for (const { start, length } of locs) {
        linked =
          linked.slice(0, 2 + start * 2) +
          addrHex +
          linked.slice(2 + (start + length) * 2);
      }
    }
  }
  return linked;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function col(label: string, addr: string) {
  return `║  ${label.padEnd(24)}${addr.padEnd(42)}  ║`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId   = Number((await ethers.provider.getNetwork()).chainId);
  const isLocal   = ["hardhat", "localhost"].includes(network.name);

  console.log(`\n${"═".repeat(64)}`);
  console.log(`  JinkFi DEX — Full Protocol Deployment`);
  console.log(`${"═".repeat(64)}`);
  console.log(`  Network:  ${network.name}  (chainId ${chainId})`);
  console.log(`  Deployer: ${deployer.address}`);
  console.log(`  Balance:  ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  console.log(`${"═".repeat(64)}\n`);

  // ── 1. WETH9 ──────────────────────────────────────────────────────────────

  let weth9Address = KNOWN_WETH9[chainId];
  if (!weth9Address || weth9Address === ethers.ZeroAddress || isLocal) {
    process.stdout.write("  [1/11] Deploying WETH9…  ");
    const artifact = require("@uniswap/v2-periphery/build/WETH9.json");
    const factory  = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
    const weth9    = await factory.deploy();
    await weth9.waitForDeployment();
    weth9Address   = await weth9.getAddress();
    console.log(`✓  ${weth9Address}`);
  } else {
    console.log(`  [1/11] WETH9 (existing)   ✓  ${weth9Address}`);
  }

  // ── 2. V2 Factory ─────────────────────────────────────────────────────────

  process.stdout.write("  [2/11] V2 Factory…       ");
  const v2FactoryArtifact  = require("@uniswap/v2-core/build/UniswapV2Factory.json");
  const v2FactoryContract  = new ethers.ContractFactory(v2FactoryArtifact.abi, v2FactoryArtifact.bytecode, deployer);
  const v2Factory          = await v2FactoryContract.deploy(deployer.address); // feeToSetter = deployer
  await v2Factory.waitForDeployment();
  const v2FactoryAddr      = await v2Factory.getAddress();
  console.log(`✓  ${v2FactoryAddr}`);

  // ── 3. V2 Router02 ────────────────────────────────────────────────────────

  process.stdout.write("  [3/11] V2 Router02…      ");
  const v2RouterArtifact   = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
  const v2RouterContract   = new ethers.ContractFactory(v2RouterArtifact.abi, v2RouterArtifact.bytecode, deployer);
  const v2Router           = await v2RouterContract.deploy(v2FactoryAddr, weth9Address);
  await v2Router.waitForDeployment();
  const v2RouterAddr       = await v2Router.getAddress();
  console.log(`✓  ${v2RouterAddr}`);

  // ── 4. V3 Factory ─────────────────────────────────────────────────────────

  process.stdout.write("  [4/11] V3 Factory…       ");
  const v3FactoryArtifact  = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json");
  const v3FactoryContract  = new ethers.ContractFactory(v3FactoryArtifact.abi, v3FactoryArtifact.bytecode, deployer);
  const v3Factory          = await v3FactoryContract.deploy();
  await v3Factory.waitForDeployment();
  const v3FactoryAddr      = await v3Factory.getAddress();
  console.log(`✓  ${v3FactoryAddr}`);

  // ── 5. NFTDescriptor library ──────────────────────────────────────────────

  process.stdout.write("  [5/11] NFTDescriptor…    ");
  const nftDescArtifact    = require("@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json");
  const nftDescFactory     = new ethers.ContractFactory(nftDescArtifact.abi, nftDescArtifact.bytecode, deployer);
  const nftDesc            = await nftDescFactory.deploy();
  await nftDesc.waitForDeployment();
  const nftDescAddr        = await nftDesc.getAddress();
  console.log(`✓  ${nftDescAddr}`);

  // ── 6. NonfungibleTokenPositionDescriptor ─────────────────────────────────

  process.stdout.write("  [6/11] TokenPosDescriptor…");
  const nftPosDescArtifact = require("@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json");
  const linkedBytecode     = linkLibraries(nftPosDescArtifact, {
    "contracts/libraries/NFTDescriptor.sol:NFTDescriptor": nftDescAddr,
  });
  const nftPosDescFactory  = new ethers.ContractFactory(nftPosDescArtifact.abi, linkedBytecode, deployer);
  const nativeCurrencyLabelBytes = ethers.encodeBytes32String(NATIVE_CURRENCY_LABEL[chainId] ?? "ETH");
  const nftPosDesc         = await nftPosDescFactory.deploy(weth9Address, nativeCurrencyLabelBytes);
  await nftPosDesc.waitForDeployment();
  const nftPosDescAddr     = await nftPosDesc.getAddress();
  console.log(`✓  ${nftPosDescAddr}`);

  // ── 7. NonfungiblePositionManager ─────────────────────────────────────────

  process.stdout.write("  [7/11] PositionManager…  ");
  const npmArtifact        = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");
  const npmFactory         = new ethers.ContractFactory(npmArtifact.abi, npmArtifact.bytecode, deployer);
  const npm                = await npmFactory.deploy(v3FactoryAddr, weth9Address, nftPosDescAddr);
  await npm.waitForDeployment();
  const npmAddr            = await npm.getAddress();
  console.log(`✓  ${npmAddr}`);

  // ── 8. SwapRouter (V3) ────────────────────────────────────────────────────

  process.stdout.write("  [8/11] V3 SwapRouter…    ");
  const swapRouterArtifact = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");
  const swapRouterFactory  = new ethers.ContractFactory(swapRouterArtifact.abi, swapRouterArtifact.bytecode, deployer);
  const swapRouter         = await swapRouterFactory.deploy(v3FactoryAddr, weth9Address);
  await swapRouter.waitForDeployment();
  const swapRouterAddr     = await swapRouter.getAddress();
  console.log(`✓  ${swapRouterAddr}`);

  // ── 9. QuoterV2 ───────────────────────────────────────────────────────────

  process.stdout.write("  [9/11] QuoterV2…         ");
  const quoterV2Artifact   = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json");
  const quoterV2Factory    = new ethers.ContractFactory(quoterV2Artifact.abi, quoterV2Artifact.bytecode, deployer);
  const quoterV2           = await quoterV2Factory.deploy(v3FactoryAddr, weth9Address);
  await quoterV2.waitForDeployment();
  const quoterV2Addr       = await quoterV2.getAddress();
  console.log(`✓  ${quoterV2Addr}`);

  // ── 10. TickLens ──────────────────────────────────────────────────────────

  process.stdout.write("  [10/11] TickLens…        ");
  const tickLensArtifact   = require("@uniswap/v3-periphery/artifacts/contracts/lens/TickLens.sol/TickLens.json");
  const tickLensFactory    = new ethers.ContractFactory(tickLensArtifact.abi, tickLensArtifact.bytecode, deployer);
  const tickLens           = await tickLensFactory.deploy();
  await tickLens.waitForDeployment();
  const tickLensAddr       = await tickLens.getAddress();
  console.log(`✓  ${tickLensAddr}`);

  // ── 11. Universal Router ──────────────────────────────────────────────────
  // NFT marketplace integrations (seaport, x2y2, etc.) are set to ZeroAddress —
  // the router still handles all V2 + V3 token swaps normally.

  process.stdout.write("  [11/11] Universal Router…");
  const ZERO = ethers.ZeroAddress;
  const urParams = {
    permit2:                     PERMIT2,
    weth9:                       weth9Address,
    seaportV1_5:                ZERO,
    seaportV1_4:                ZERO,
    openseaConduit:              ZERO,
    nftxZap:                     ZERO,
    x2y2:                        ZERO,
    foundation:                  ZERO,
    sudoswap:                    ZERO,
    elementMarket:               ZERO,
    nft20Zap:                    ZERO,
    cryptopunks:                 ZERO,
    looksRareV2:                ZERO,
    routerRewardsDistributor:   ZERO,
    looksRareRewardsDistributor: ZERO,
    looksRareToken:              ZERO,
    v2Factory:                   v2FactoryAddr,
    v3Factory:                   v3FactoryAddr,
    pairInitCodeHash:            V2_PAIR_INIT_CODE_HASH,
    poolInitCodeHash:            V3_POOL_INIT_CODE_HASH,
  };
  const urArtifact         = require("@uniswap/universal-router/artifacts/contracts/UniversalRouter.sol/UniversalRouter.json");
  const urFactory          = new ethers.ContractFactory(urArtifact.abi, urArtifact.bytecode, deployer);
  const universalRouter    = await urFactory.deploy(urParams);
  await universalRouter.waitForDeployment();
  const universalRouterAddr = await universalRouter.getAddress();
  console.log(`✓  ${universalRouterAddr}`);

  // ── Save record ───────────────────────────────────────────────────────────

  const record = {
    network:   network.name,
    chainId:   chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer:  deployer.address,
    contracts: {
      weth9:                      weth9Address,
      v2Factory:                  v2FactoryAddr,
      v2Router:                   v2RouterAddr,
      v3Factory:                  v3FactoryAddr,
      nftDescriptor:              nftDescAddr,
      nftPositionDescriptor:      nftPosDescAddr,
      nonfungiblePositionManager: npmAddr,
      v3SwapRouter:               swapRouterAddr,
      quoterV2:                   quoterV2Addr,
      tickLens:                   tickLensAddr,
      universalRouter:            universalRouterAddr,
    },
  };

  const dir  = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `dex-${chainId}.json`);
  fs.writeFileSync(file, JSON.stringify(record, null, 2));

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log(`\n${"═".repeat(64)}`);
  console.log(`  DEPLOYMENT COMPLETE — ${network.name} (${chainId})`);
  console.log(`${"═".repeat(64)}`);
  console.log(col("WETH9",               weth9Address));
  console.log(col("V2 Factory",          v2FactoryAddr));
  console.log(col("V2 Router02",         v2RouterAddr));
  console.log(col("V3 Factory",          v3FactoryAddr));
  console.log(col("NFTDescriptor lib",   nftDescAddr));
  console.log(col("V3 PosDescriptor",    nftPosDescAddr));
  console.log(col("V3 PositionManager",  npmAddr));
  console.log(col("V3 SwapRouter",       swapRouterAddr));
  console.log(col("QuoterV2",            quoterV2Addr));
  console.log(col("TickLens",            tickLensAddr));
  console.log(col("Universal Router",    universalRouterAddr));
  console.log(`${"═".repeat(64)}`);
  console.log(`  Saved → deployments/dex-${chainId}.json`);
  console.log(`\n  Next steps:`);
  console.log(`    1. Update CONTRACT_ADDRESSES in client/src/lib/contracts.ts`);
  console.log(`    2. Run:  npm run verify:dex:sepolia`);
  console.log(`${"═".repeat(64)}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
