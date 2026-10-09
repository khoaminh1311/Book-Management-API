import React from 'react';

/**
 * Quick Metrics Summary Cards
 * Strict Figma Design System Specs (Frame #1:540):
 * - Label: Plus Jakarta Sans SemiBold 600, 11px, leading 14px, tracking 0.05em, color #45474C (style_ccb18673)
 * - Value: Newsreader Regular 400, 24px, leading 32px, tracking -0.01em, color #091426 (style_d01431e5)
 * - Icon: Bronze #745939 (fill_afdf7c66), 18px
 * - Spacing: pt-3 (12px) margin between label and value (EL-8e175aae)
 */
export default function MetricsGrid({ totalTitles, totalAuthors, totalGenres, totalValue }) {
  const metrics = [
    {
      label: 'TOTAL TITLES',
      value: Number(totalTitles || 0).toLocaleString(),
      icon: 'auto_stories',
    },
    {
      label: 'TOTAL AUTHORS',
      value: Number(totalAuthors || 0).toLocaleString(),
      icon: 'group',
    },
    {
      label: 'TOTAL GENRES',
      value: totalGenres ?? 6,
      icon: 'category',
    },
    {
      label: 'TOTAL CATALOG VALUE',
      value: `$${Number(totalValue || 0).toFixed(2)}`,
      icon: 'payments',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => (
        <div
          key={idx}
          className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col justify-between"
        >
          {/* Header Row: Label & Bronze Icon */}
          <div className="flex items-center justify-between text-[#45474C]">
            <span className="text-[11px] font-semibold leading-[14px] tracking-[0.05em] uppercase">
              {m.label}
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#745939]">
              {m.icon}
            </span>
          </div>

          {/* Value: Newsreader Regular (400) 24px/32px -0.01em */}
          <div className="pt-3">
            <span className="font-serif font-normal text-[24px] leading-8 tracking-[-0.01em] text-primary block">
              {m.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
