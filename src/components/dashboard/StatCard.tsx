'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: React.ElementType;
  isLoading: boolean;
  accentColor?: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral' | string;
  sparklineColor?: string;
}

/**
 * @fileOverview Carte de statistique Glassmorphism (Design Qwen High-Fidelity).
 * ✅ RÉSOLU : Ajout des props trend, trendType et sparklineColor pour la compatibilité TS.
 */
export const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    isLoading, 
    accentColor = "bg-primary/20 text-primary",
    trend,
    trendType,
    sparklineColor
}) => {
  const renderTrendIcon = () => {
    if (trendType === 'up') return <TrendingUp className="h-3 w-3" />;
    if (trendType === 'down') return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const trendColor = trendType === 'up' ? 'text-emerald-500' : trendType === 'down' ? 'text-red-500' : 'text-slate-500';

  return (
    <Card className="glass rounded-[2rem] border-white/5 transition-all active:scale-95 shadow-xl overflow-hidden group">
      <CardContent className="p-5 flex flex-col relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
              accentColor
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</span>
          </div>
          {sparklineColor && (
              <div className="w-10 h-4 opacity-30" style={{ borderBottom: `2px solid ${sparklineColor}`, borderRadius: '0 0 4px 4px' }} />
          )}
        </div>
        
        {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-8 w-20 bg-slate-800" />
                <Skeleton className="h-3 w-12 bg-slate-800" />
            </div>
        ) : (
            <>
                <h3 className="text-3xl font-black text-white tracking-tighter leading-none">
                    {value}
                    {unit && <span className="text-xs font-bold text-slate-600 uppercase ml-1">{unit}</span>}
                </h3>
                {trend && (
                    <div className={cn("flex items-center gap-1 mt-2 text-[9px] font-black uppercase tracking-widest", trendColor)}>
                        {renderTrendIcon()}
                        {trend}
                    </div>
                )}
            </>
        )}
      </CardContent>
    </Card>
  );
};
