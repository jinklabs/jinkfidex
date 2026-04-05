export interface FarmInfo {
  pid: number;
  name: string;
  lpToken: string;
  token0Symbol: string;
  token1Symbol: string;
  rewardSymbol: string;
  aprPercent: number;
  tvlUSD: number;
  multiplier: string;
  isHot?: boolean;
  isNew?: boolean;
  chainId: number;
}

export const MOCK_FARMS: FarmInfo[] = [
  { pid: 0, name: "ETH-USDC LP", lpToken: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc", token0Symbol: "ETH", token1Symbol: "USDC", rewardSymbol: "JINK", aprPercent: 124.5, tvlUSD: 8_420_000, multiplier: "40x", isHot: true, chainId: 4217 },
  { pid: 1, name: "ETH-USDT LP", lpToken: "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852", token0Symbol: "ETH", token1Symbol: "USDT", rewardSymbol: "JINK", aprPercent: 98.2, tvlUSD: 6_100_000, multiplier: "30x", chainId: 4217 },
  { pid: 2, name: "ETH-WBTC LP", lpToken: "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940", token0Symbol: "ETH", token1Symbol: "WBTC", rewardSymbol: "JINK", aprPercent: 76.4, tvlUSD: 4_830_000, multiplier: "20x", chainId: 4217 },
  { pid: 3, name: "USDC-DAI LP", lpToken: "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5", token0Symbol: "USDC", token1Symbol: "DAI", rewardSymbol: "JINK", aprPercent: 42.1, tvlUSD: 2_960_000, multiplier: "10x", isNew: true, chainId: 4217 },
  { pid: 4, name: "ETH-UNI LP", lpToken: "0xd3d2E2692501A5c9Ca623199D38826e513033a17", token0Symbol: "ETH", token1Symbol: "UNI", rewardSymbol: "JINK", aprPercent: 58.9, tvlUSD: 1_750_000, multiplier: "15x", chainId: 4217 },
];
