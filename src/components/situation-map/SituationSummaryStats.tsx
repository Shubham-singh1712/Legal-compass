'use client';

import React from 'react';
import { Scale, CheckSquare, Calendar, AlertTriangle } from 'lucide-react';

interface SituationSummaryStatsProps {
  rightsCount: number;
  obligationsCount: number;
  deadlinesCount: number;
  reviewItemsCount: number;
  activeTab: 'overview' | 'map' | 'rights' | 'obligations' | 'deadlines' | 'review' | 'action';
  onTabChange: (tab: 'overview' | 'map' | 'rights' | 'obligations' | 'deadlines' | 'review' | 'action') => void;
}

export function SituationSummaryStats({
  rightsCount,
  obligationsCount,
  deadlinesCount,
  reviewItemsCount,
  activeTab,
  onTabChange,
}: SituationSummaryStatsProps) {
  const stats = [
    {
      id: 'rights' as const,
      label: 'Rights',
      count: rightsCount,
      sublabel: 'identified',
      icon: Scale,
      color: 'text-emerald-400',
      activeStyle: 'border-emerald-500/50 bg-emerald-950/30 shadow-emerald-glow',
      bgGlow: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'obligations' as const,
      label: 'Obligations',
      count: obligationsCount,
      sublabel: 'to fulfill',
      icon: CheckSquare,
      color: 'text-blue-400',
      activeStyle: 'border-blue-500/50 bg-blue-950/30 shadow-blue-glow',
      bgGlow: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 'deadlines' as const,
      label: 'Deadlines',
      count: deadlinesCount,
      sublabel: 'critical dates',
      icon: Calendar,
      color: 'text-amber-400',
      activeStyle: 'border-amber-500/50 bg-amber-950/30 shadow-subtle-glow',
      bgGlow: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'review' as const,
      label: 'Review Items',
      count: reviewItemsCount,
      sublabel: 'need attention',
      icon: AlertTriangle,
      color: 'text-rose-400',
      activeStyle: 'border-rose-500/50 bg-rose-950/30',
      bgGlow: 'bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isActive = activeTab === stat.id;

        return (
          <button
            key={stat.id}
            type="button"
            onClick={() => onTabChange(stat.id)}
            className={`surface-card p-5 text-left transition-all duration-200 cursor-pointer ${
              isActive
                ? `${stat.activeStyle} -translate-y-0.5`
                : 'border-legal-800/80 bg-legal-900/60 hover:bg-legal-900 hover:border-legal-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-legal-300">
                {stat.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg ${stat.bgGlow} border flex items-center justify-center ${stat.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {stat.count}
              </span>
              <span className="text-xs text-legal-400">
                {stat.sublabel}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
