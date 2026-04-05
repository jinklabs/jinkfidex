import { useState } from "react";
import { ArrowDownUp, CheckCircle2, ExternalLink, Zap, Info } from "lucide-react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { formatUnits } from "viem";
import { ERC20_ABI } from "../../lib/contracts";
import { useSwap } from "../../hooks/useSwap";
import { useSwapV3 } from "../../hooks/useSwapV3";
import TokenSelector from "./TokenSelector";
import SlippageSettings from "./SlippageSettings";
import VersionSelector, { type SwapVersion } from "./VersionSelector";
import FeeTierSelector from "./FeeTierSelector";
import HookSelector from "./HookSelector";
import { ETH_ADDRESS, type Token } from "../../lib/tokens";
import { V4_HOOKS } from "../../lib/uniswap";

type SelectorTarget = "in" | "out" | null;

const VERSION_INFO: Record<SwapVersion, { color: string; text: string }> = {
  v2: { color: "rgba(61,90,122,0.25)",  text: "V2 · Classic AMM · x·y=k" },
  v3: { color: "rgba(202,228,219,0.07)",  text: "V3 · Concentrated liquidity · Select fee tier" },
  v4: { color: "rgba(255,45,107,0.07)", text: "V4 · Hooks architecture · Flash accounting" },
};

export default function SwapWidget() {
  const { isConnected, address } = useAccount();
  const { login } = usePrivy();
  const [version, setVersion] = useState<SwapVersion>("v3");
  const [selectorTarget, setSelectorTarget] = useState<SelectorTarget>(null);
  const [hookAddr, setHookAddr] = useState<string>(V4_HOOKS[0].address);

  const v2 = useSwap();
  const v3 = useSwapV3();

  const isV3orV4 = version === "v3" || version === "v4";
  const tokenIn  = isV3orV4 ? v3.tokenIn  : v2.tokenIn;
  const tokenOut = isV3orV4 ? v3.tokenOut : v2.tokenOut;
  const amountIn  = isV3orV4 ? v3.amountIn  : v2.amountIn;
  const amountOut = isV3orV4 ? v3.amountOut : v2.amountOut;
  const isSwapping  = isV3orV4 ? v3.isSwapping  : v2.isSwapping;
  const isTxPending = isV3orV4 ? v3.isTxPending : v2.isTxPending;
  const txHash      = isV3orV4 ? v3.txHash      : v2.txHash;
  const error       = isV3orV4 ? v3.error       : v2.error;
  const needsApproval = isV3orV4 ? v3.needsApproval : v2.needsApproval;

  const setTokenIn  = (t: Token) => { v2.setTokenIn(t); v3.setTokenIn(t); };
  const setTokenOut = (t: Token) => { v2.setTokenOut(t); v3.setTokenOut(t); };
  const setAmt = (v: string) => { v2.setAmountIn(v); v3.setAmountIn(v); };
  const flip   = () => { if (isV3orV4) v3.flip(); else v2.flip(); };
  const approve = () => { if (isV3orV4) v3.approve(); else v2.approve(); };
  const doSwap  = () => { if (isV3orV4) v3.swap(); else v2.swap(); };

  const { data: ethBalance } = useBalance({ address });
  const { data: tokenInBalanceRaw } = useReadContract({
    address: tokenIn?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!tokenIn && tokenIn.address !== ETH_ADDRESS },
  });

  const displayBalance = tokenIn?.address === ETH_ADDRESS
    ? ethBalance ? parseFloat(formatUnits(ethBalance.value, 18)).toFixed(4) : "0.0000"
    : tokenIn && tokenInBalanceRaw !== undefined ? parseFloat(formatUnits(tokenInBalanceRaw as bigint, tokenIn.decimals)).toFixed(4) : "0.0000";

  const canSwap = !needsApproval && amountIn && amountOut && !isSwapping && !isTxPending;
  const info = VERSION_INFO[version];

  return (
    <div style={{
      background: "rgba(4,8,18,0.95)",
      backdropFilter: "blur(24px)",
      border: "1px solid var(--border)",
      borderTop: "1px solid var(--border-bright)",
      padding: "1.25rem",
      width: "100%",
      maxWidth: 440,
      boxShadow: "0 0 40px rgba(0,0,0,0.6), 0 0 80px rgba(202,228,219,0.03)",
      animation: "fadeIn 0.3s ease",
      position: "relative",
      clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",
    }}>
      {/* Cut-corner accent */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 16, height: 16,
        borderTop: "1px solid var(--accent)",
        borderRight: "1px solid var(--accent)",
        boxShadow: "2px -2px 8px var(--accent-glow)",
      }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Zap size={13} color="var(--accent)" />
          <span style={{
            fontWeight: 900, fontSize: 14,
            letterSpacing: "0.14em",
            fontFamily: "'Rajdhani', sans-serif",
            color: "var(--text)",
          }}>SWAP</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <VersionSelector value={version} onChange={setVersion} />
          <SlippageSettings
            value={version === "v3" ? v3.slippage : v2.slippage}
            onChange={v => { v3.setSlippage(v); v2.setSlippage(v); }}
          />
        </div>
      </div>

      {/* Version info banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.4rem",
        padding: "0.35rem 0.6rem",
        background: info.color,
        borderLeft: `2px solid ${version === "v4" ? "var(--punk)" : "var(--accent)"}`,
        marginBottom: "0.85rem",
        fontSize: 10, color: "var(--text-muted)",
        letterSpacing: "0.04em",
        fontFamily: "'Share Tech Mono', monospace",
      }}>
        <Info size={10} />
        {info.text}
      </div>

      {version === "v3" && (
        <div style={{ marginBottom: "0.75rem" }}>
          <FeeTierSelector value={v3.fee} onChange={v3.setFee} />
        </div>
      )}

      {version === "v4" && (
        <div style={{ marginBottom: "0.75rem" }}>
          <HookSelector value={hookAddr} onChange={(addr) => setHookAddr(addr)} />
        </div>
      )}

      {/* Token In */}
      <TokenBox label="YOU PAY" token={tokenIn} amount={amountIn} onChange={setAmt} onTokenClick={() => setSelectorTarget("in")} balance={displayBalance} onMax={() => setAmt(displayBalance)} />

      {/* Flip */}
      <div style={{ display: "flex", justifyContent: "center", margin: "0.4rem 0" }}>
        <button
          onClick={flip}
          style={{
            background: "var(--bg-deep)",
            border: "1px solid var(--border)",
            width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--text-muted)",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.boxShadow = "0 0 12px var(--accent-glow)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <ArrowDownUp size={13} />
        </button>
      </div>

      {/* Token Out */}
      <TokenBox label="YOU RECEIVE" token={tokenOut} amount={amountOut} onTokenClick={() => setSelectorTarget("out")} readOnly />

      {/* Rate */}
      {tokenIn && tokenOut && amountIn && amountOut && (
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 11, margin: "0.65rem 0",
          padding: "0.4rem 0.6rem",
          background: "rgba(0,0,0,0.3)",
          borderLeft: "2px solid var(--border)",
          fontFamily: "'Share Tech Mono', monospace",
        }}>
          <span style={{ color: "var(--text-muted)" }}>RATE</span>
          <span style={{ color: "var(--accent)" }}>
            1 {tokenIn.symbol} = {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)} {tokenOut.symbol}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(255,45,107,0.07)", borderLeft: "2px solid var(--punk)", padding: "0.5rem 0.7rem", fontSize: 12, color: "var(--punk)", marginBottom: "0.5rem", fontFamily: "'Share Tech Mono', monospace" }}>
          {error}
        </div>
      )}

      {/* Success */}
      {txHash && !isSwapping && (
        <div style={{ background: "rgba(202,228,219,0.05)", borderLeft: "2px solid var(--accent)", padding: "0.5rem 0.7rem", fontSize: 12, color: "var(--accent)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "'Share Tech Mono', monospace" }}>
          <CheckCircle2 size={12} /> TX SUBMITTED
          <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ marginLeft: "auto", color: "var(--accent)" }}><ExternalLink size={11} /></a>
        </div>
      )}

      {/* CTA */}
      {!isConnected ? (
        <button
          onClick={() => login()}
          style={{
            marginTop: "0.65rem", width: "100%", padding: "0.75rem",
            background: "var(--accent)", color: "var(--bg-deep)",
            border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 900, letterSpacing: "0.12em",
            fontFamily: "'Share Tech Mono', monospace",
            boxShadow: "0 0 20px var(--accent-glow)",
          }}
        >
          CONNECT WALLET
        </button>
      ) : needsApproval ? (
        <CTA onClick={approve} label={`APPROVE ${tokenIn?.symbol}`} />
      ) : (
        <CTA onClick={doSwap} loading={isSwapping || isTxPending} disabled={!canSwap} label={amountIn ? `SWAP VIA ${version.toUpperCase()}` : "ENTER AMOUNT"} />
      )}

      {selectorTarget && (
        <TokenSelector
          onSelect={t => { if (selectorTarget === "in") setTokenIn(t); else setTokenOut(t); }}
          exclude={selectorTarget === "in" ? tokenOut : tokenIn}
          onClose={() => setSelectorTarget(null)}
        />
      )}
    </div>
  );
}

function TokenBox({ label, token, amount, onChange, onTokenClick, balance, onMax, readOnly }: {
  label: string; token: Token | null; amount: string; onChange?: (v: string) => void;
  onTokenClick: () => void; balance?: string; onMax?: () => void; readOnly?: boolean;
}) {
  return (
    <div style={{
      background: "rgba(2,5,12,0.8)",
      border: "1px solid var(--border)",
      borderLeft: "2px solid var(--border-bright)",
      padding: "0.85rem 0.9rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
        <span style={{
          fontSize: 9, color: "var(--text-muted)", fontWeight: 700,
          letterSpacing: "0.18em", textTransform: "uppercase",
          fontFamily: "'Share Tech Mono', monospace",
        }}>{label}</span>
        {balance !== undefined && (
          <div style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", gap: "0.3rem", alignItems: "center", fontFamily: "'Share Tech Mono', monospace" }}>
            {balance}
            {onMax && (
              <button onClick={onMax} style={{
                background: "transparent", border: "1px solid var(--accent)",
                color: "var(--accent)", padding: "0 4px",
                fontSize: 9, cursor: "pointer", fontWeight: 700, letterSpacing: "0.06em",
              }}>MAX</button>
            )}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
        <input
          type="number" placeholder="0.00" value={amount}
          onChange={e => onChange?.(e.target.value)} readOnly={readOnly}
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            fontSize: 28, fontWeight: 700, color: "var(--text)", minWidth: 0,
            fontFamily: "'Share Tech Mono', monospace",
          }}
        />
        <button
          onClick={onTokenClick}
          style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            background: token ? "rgba(255,255,255,0.04)" : "var(--accent)",
            border: `1px solid ${token ? "var(--border)" : "transparent"}`,
            padding: "0.4rem 0.7rem",
            cursor: "pointer",
            color: token ? "var(--text)" : "var(--bg-deep)",
            fontWeight: 800, fontSize: 13, flexShrink: 0,
            boxShadow: token ? "none" : "0 0 16px var(--accent-glow)",
            letterSpacing: "0.04em",
            transition: "all 0.15s",
          }}
        >
          {token ? (
            <>
              <div style={{ width: 18, height: 18, overflow: "hidden", background: "var(--bg-input)", flexShrink: 0 }}>
                {token.logoURI && <img src={token.logoURI} alt="" style={{ width: "100%", height: "100%" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />}
              </div>
              {token.symbol} <span style={{ color: "var(--text-muted)", fontSize: 9 }}>▾</span>
            </>
          ) : "SELECT ▾"}
        </button>
      </div>
    </div>
  );
}

function CTA({ onClick, loading, disabled, label }: { onClick: () => void; loading?: boolean; disabled?: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: "100%", padding: "0.85rem",
        border: `1px solid ${disabled ? "var(--border)" : "var(--accent)"}`,
        background: disabled ? "transparent" : "var(--accent)",
        color: disabled ? "var(--text-muted)" : "var(--bg-deep)",
        fontWeight: 900, fontSize: 13,
        letterSpacing: "0.1em",
        cursor: disabled ? "not-allowed" : "pointer",
        marginTop: "0.65rem",
        opacity: loading ? 0.7 : 1,
        boxShadow: disabled ? "none" : "0 0 24px var(--accent-glow)",
        transition: "all 0.15s",
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      {loading ? "CONFIRMING..." : label}
    </button>
  );
}
