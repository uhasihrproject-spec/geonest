"use client";

export default function MartEffects() {
  return (
    <style jsx global>{`
      @keyframes floaty {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      @keyframes shimmer {
        0% { transform: translateX(-30%); opacity: 0; }
        30% { opacity: 1; }
        100% { transform: translateX(130%); opacity: 0; }
      }
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .floaty { animation: floaty 6s ease-in-out infinite; }
      .floaty2 { animation: floaty 7.5s ease-in-out infinite; }
      .floaty3 { animation: floaty 9s ease-in-out infinite; }

      .reveal {
        opacity: 0;
        transform: translateY(18px);
        transition: opacity .7s ease, transform .7s ease;
      }
      .reveal.is-in {
        opacity: 1;
        transform: translateY(0);
      }
      .glass {
        background: rgba(255,255,255,.78);
        backdrop-filter: blur(12px);
      }
        @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
        }
        @keyframes pulseSoft {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
        }
        .marquee { animation: marquee 18s linear infinite; }
        .pulseSoft { animation: pulseSoft 2.8s ease-in-out infinite; }
    `}</style>
  );
}
