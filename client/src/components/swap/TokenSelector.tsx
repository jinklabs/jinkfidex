import { useState, useMemo } from "react";
import { X, Search, Loader } from "lucide-react";
import { useChainId, useReadContracts } from "wagmi";
import { getTokensForChain, type Token } from "../../lib/tokens";

const ERC20_META_ABI = [
  { name: "symbol",   inputs: [], outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { name: "name",     inputs: [], outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { name: "decimals", inputs: [], outputs: [{ type: "uint8"  }], stateMutability: "view", type: "function" },
] as const;

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

interface Props {
  onSelect: (token: Token) => void;
  exclude?: Token | null;
  onClose: () => void;
}

export default function TokenSelector({ onSelect, exclude, onClose }: Props) {
  const chainId = useChainId();
  const [query, setQuery] = useState("");

  const tokens = useMemo(() => getTokensForChain(chainId), [chainId]);

  const isAddress = ADDRESS_RE.test(query.trim());
  const pastedAddress = isAddress ? query.trim().toLowerCase() as `0x${string}` : undefined;

  // Only fetch on-chain if the address isn't already in the list
  const alreadyKnown = pastedAddress
    ? tokens.find(t => t.address.toLowerCase() === pastedAddress)
    : undefined;

  const shouldFetch = isAddress && !alreadyKnown;

  const { data: metaResults, isLoading: metaLoading } = useReadContracts({
    contracts: shouldFetch
      ? [
          { address: pastedAddress!, abi: ERC20_META_ABI, functionName: "symbol"   },
          { address: pastedAddress!, abi: ERC20_META_ABI, functionName: "name"     },
          { address: pastedAddress!, abi: ERC20_META_ABI, functionName: "decimals" },
        ]
      : [],
    query: { enabled: shouldFetch },
  });

  const resolvedToken: Token | null = useMemo(() => {
    if (!shouldFetch || !metaResults) return null;
    const [sym, nm, dec] = metaResults;
    if (sym?.status !== "success" || nm?.status !== "success" || dec?.status !== "success") return null;
    return {
      address:  query.trim(),
      symbol:   sym.result  as string,
      name:     nm.result   as string,
      decimals: dec.result  as number,
      chainId,
    };
  }, [shouldFetch, metaResults, query, chainId]);

  const filtered = useMemo(() => {
    if (isAddress) {
      return alreadyKnown
        ? [alreadyKnown].filter(t => t.address !== exclude?.address)
        : [];
    }
    const q = query.toLowerCase();
    return tokens.filter(t =>
      t.address !== exclude?.address &&
      (t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
    );
  }, [tokens, query, exclude, isAddress, alreadyKnown]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)" }}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, width: 380, maxHeight: 520, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Select Token</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "0.75rem 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 10, padding: "0.5rem 0.75rem" }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              autoFocus
              placeholder="Search name, symbol, or paste address"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 14, flex: 1 }}
            />
            {metaLoading && <Loader size={14} color="var(--text-muted)" style={{ animation: "spin 1s linear infinite" }} />}
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "0 0.5rem 0.75rem" }}>
          {/* On-chain resolved token from pasted address */}
          {resolvedToken && (
            <button
              onClick={() => { onSelect(resolvedToken); onClose(); }}
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", padding: "0.65rem 0.75rem", borderRadius: 10, border: "1px solid var(--accent, #d4af37)", background: "rgba(212,175,55,0.06)", color: "var(--text)", cursor: "pointer", textAlign: "left", marginBottom: 4 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-input)", border: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                {resolvedToken.symbol.slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{resolvedToken.symbol}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{resolvedToken.name}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis" }}>{resolvedToken.address}</div>
              </div>
              <span style={{ fontSize: 10, color: "var(--accent, #d4af37)", fontWeight: 600 }}>CUSTOM</span>
            </button>
          )}

          {/* No result for pasted address */}
          {isAddress && !alreadyKnown && !metaLoading && !resolvedToken && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "1.5rem", fontSize: 14 }}>
              No ERC-20 found at this address on the current network
            </div>
          )}

          {/* Regular filtered list */}
          {filtered.map(token => (
            <button
              key={token.address}
              onClick={() => { onSelect(token); onClose(); }}
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", padding: "0.65rem 0.75rem", borderRadius: 10, border: "none", background: "transparent", color: "var(--text)", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-input)", border: "1px solid var(--border)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                {token.logoURI ? (
                  <img src={token.logoURI} alt={token.symbol} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                ) : token.symbol.slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{token.symbol}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{token.name}</div>
              </div>
            </button>
          ))}

          {!isAddress && filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem", fontSize: 14 }}>No tokens found</div>
          )}
        </div>
      </div>
    </div>
  );
}
