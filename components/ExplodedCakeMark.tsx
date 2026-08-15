export function ExplodedCakeMark() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[360px]" aria-hidden="true">
      <div className="explode-stage absolute inset-0">
        <div className="tier tier-a absolute left-[18%] top-[58%] h-[28%] w-[64%] rounded-[16px] border border-ink bg-sunflower" />
        <div className="tier tier-b absolute left-[26%] top-[36%] h-[24%] w-[48%] rounded-[16px] border border-ink bg-rose" />
        <div className="tier tier-c absolute left-[34%] top-[16%] h-[22%] w-[32%] rounded-[16px] border border-ink bg-sky" />
        <p className="leader data absolute right-0 top-[22%] text-[12px] text-gel-piping">
          TIP #32
        </p>
        <p className="leader data absolute right-0 top-[48%] text-[12px] text-gel-frosting">
          fondant
        </p>
        <p className="leader data absolute right-0 top-[72%] text-[12px] text-gel-decor">
          edible print
        </p>
      </div>
      <style>{`
        .tier { box-shadow: var(--shadow-explode); }
        @keyframes explode-loop {
          0%, 12% { transform: translateY(0); }
          25%, 62% { transform: translateY(var(--y)); }
          75%, 100% { transform: translateY(0); }
        }
        .tier-a { --y: 18px; animation: explode-loop 8s ease-in-out infinite; }
        .tier-b { --y: -6px; animation: explode-loop 8s ease-in-out infinite 80ms; }
        .tier-c { --y: -28px; animation: explode-loop 8s ease-in-out infinite 160ms; }
        .leader { animation: explode-loop 8s ease-in-out infinite 160ms; }
        @media (prefers-reduced-motion: reduce) {
          .tier-a { transform: translateY(18px); animation: none; }
          .tier-b { transform: translateY(-6px); animation: none; }
          .tier-c { transform: translateY(-28px); animation: none; }
          .leader { animation: none; }
        }
      `}</style>
    </div>
  );
}
