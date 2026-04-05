import type { Pool } from "../api/client";

export const MOCK_POOLS: Pool[] = [
  { id: "1", address: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc", chainId: 4217, token0Symbol: "ETH",  token1Symbol: "USDC", reserve0: "12450.82", reserve1: "44132450.00", tvlUSD: 88_264_900, volume24h: 6_420_000, apr: 18.42, feeTier: "0.3%" },
  { id: "2", address: "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852", chainId: 4217, token0Symbol: "ETH",  token1Symbol: "USDT", reserve0: "9821.44",  reserve1: "34801200.00", tvlUSD: 69_602_400, volume24h: 4_810_000, apr: 14.87, feeTier: "0.3%" },
  { id: "3", address: "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940", chainId: 4217, token0Symbol: "ETH",  token1Symbol: "WBTC", reserve0: "4210.30",  reserve1: "625.18",      tvlUSD: 42_174_000, volume24h: 2_200_000, apr: 10.52, feeTier: "0.3%" },
  { id: "4", address: "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5", chainId: 4217, token0Symbol: "USDC", token1Symbol: "DAI",  reserve0: "18200000", reserve1: "18184000",    tvlUSD: 36_384_000, volume24h: 8_100_000, apr: 22.70, feeTier: "0.05%" },
  { id: "5", address: "0xd3d2E2692501A5c9Ca623199D38826e513033a17", chainId: 4217, token0Symbol: "ETH",  token1Symbol: "UNI",  reserve0: "3150.90",  reserve1: "963450.00",  tvlUSD: 22_344_000, volume24h: 1_450_000, apr: 9.21,  feeTier: "0.3%" },
  { id: "6", address: "0xa478c2975Ab1Ea89e8196811F51A7B7Ade33eB11", chainId: 4217, token0Symbol: "ETH",  token1Symbol: "DAI",  reserve0: "6840.10",  reserve1: "24224195.00", tvlUSD: 48_448_390, volume24h: 3_620_000, apr: 12.38, feeTier: "0.3%" },
];
