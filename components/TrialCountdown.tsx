"use client";

type Props = {
  endsAt: string; // ISO date
  totalDays: number; // 7 for trial, 30 for a monthly renewal
  label: string;
};

export function TrialCountdown({ endsAt, totalDays, label }: Props) {
  const end = new Date(endsAt).getTime();
  const msLeft = Math.max(0, end - Date.now());
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const fraction = Math.min(1, Math.max(0, msLeft / (totalDays * 24 * 60 * 60 * 1000)));
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const urgent = daysLeft <= 2;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label={`${daysLeft} days left`}>
        <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--line)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={urgent ? "var(--danger)" : "var(--brand)"}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
          style={{ transition: "stroke-dashoffset 0.4s" }}
        />
        <text x="32" y="37" textAnchor="middle" fontSize="17" fontWeight="600" fill="var(--text)">
          {daysLeft}
        </text>
      </svg>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: urgent ? "var(--danger)" : "var(--text-3)" }}>
          {daysLeft === 0 ? "Ends today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
        </div>
      </div>
    </div>
  );
}
