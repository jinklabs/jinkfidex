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
