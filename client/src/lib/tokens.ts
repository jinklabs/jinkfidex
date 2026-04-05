import tokenListJson from "./tokenlist.json";

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  tags?: string[];
}

export interface TokenList {
  name: string;
  timestamp: string;
  version: { major: number; minor: number; patch: number };
  tokens: Token[];
}

export const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const TOKEN_LIST: TokenList = tokenListJson as TokenList;

/** All tokens for the given chain, falling back to mainnet if none found. */
export function getTokensForChain(chainId: number): Token[] {
  const tokens = TOKEN_LIST.tokens.filter((t) => t.chainId === chainId);
  return tokens.length > 0 ? tokens : TOKEN_LIST.tokens.filter((t) => t.chainId === 1);
}

/** Mainnet tokens — kept for backward compatibility with existing imports. */
export const DEFAULT_TOKENS: Token[] = TOKEN_LIST.tokens.filter((t) => t.chainId === 1);
