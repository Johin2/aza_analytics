import React from 'react';
import { Sparkles, Zap, TrendingUp, Target } from 'lucide-react';

interface AIRecommendationsProps {
  recommendations?: string[];
}

const CARD_ICONS = [Zap, TrendingUp, Target];
const CARD_ACCENTS = [
  { border: 'border-l-indigo-500', bg: 'bg-indigo-50', icon: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
  { border: 'border-l-emerald-500', bg: 'bg-emerald-50', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  { border: 'border-l-amber-500', bg: 'bg-amber-50', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
];

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="mb-6 sm:mb-8">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">AI Insights</h3>
          <p className="text-xs text-gray-500">Data-driven recommendations</p>
        </div>
      </div>

      {/* Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recommendations.map((rec, index) => {
          const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
          const Icon = CARD_ICONS[index % CARD_ICONS.length];

          // Split on " — " to get topic and action
          const dashIdx = rec.indexOf(' — ');
          const topic = dashIdx > -1 ? rec.slice(0, dashIdx) : null;
          const body = dashIdx > -1 ? rec.slice(dashIdx + 3) : rec;

          return (
            <div
              key={index}
              className={`relative border-l-[3px] ${accent.border} bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${accent.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${accent.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  {topic && (
                    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${accent.badge} mb-1.5`}>
                      {topic}
                    </span>
                  )}
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
