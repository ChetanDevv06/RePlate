'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { calculateSurplusRisk, getRiskIndicator } from '@/lib/prediction';
import type { PredictionResult } from '@/types';
import { cn } from '@/lib/utils';
import { Brain, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface PredictionCardProps {
  originalPrice?: number;
  onApplyRecommendation?: (discountedPrice: number) => void;
}

export function PredictionCard({ originalPrice, onApplyRecommendation }: PredictionCardProps) {
  const [avgSales, setAvgSales] = useState<string>('');
  const [currentStock, setCurrentStock] = useState<string>('');
  const [expectedDemand, setExpectedDemand] = useState<string>('');
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleAnalyze = () => {
    const stockNum = Number(currentStock);
    const avgNum = Number(avgSales) || 0;
    const demandNum = Number(expectedDemand) || 0;

    if (!currentStock || stockNum <= 0) {
      toast.info('Enter your current stock to calculate surplus risk');
      return;
    }

    const prediction = calculateSurplusRisk({
      average_daily_sales: avgNum,
      current_stock: stockNum,
      expected_demand: demandNum,
    });

    setResult(prediction);
  };

  const handleApply = () => {
    if (!result || !originalPrice || !onApplyRecommendation) return;
    const discountedPrice = Math.round(originalPrice * (1 - result.recommended_discount));
    onApplyRecommendation(discountedPrice);
  };

  const riskColorClass = result
    ? { high: 'text-red-600 font-semibold', medium: 'text-amber-600 font-semibold', low: 'text-green-600 font-semibold' }[result.risk]
    : '';

  const riskBgClass = result
    ? { high: 'bg-red-50 border-red-200', medium: 'bg-amber-50 border-amber-200', low: 'bg-green-50 border-green-200' }[result.risk]
    : '';

  return (
    <Card className="border-primary/20 bg-primary/[0.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base flex items-center gap-1.5">
              Smart Predictor
              <span className="text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Optional
              </span>
            </CardTitle>
            <CardDescription className="text-xs">Estimate surplus risk & discount</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="pred-avg-sales" className="text-xs text-muted-foreground mb-1 block">
                Avg. Sales
              </Label>
              <Input
                id="pred-avg-sales"
                type="number"
                placeholder="12"
                className="h-8 text-sm"
                value={avgSales}
                onChange={(e) => setAvgSales(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pred-current-stock" className="text-xs text-muted-foreground mb-1 block">
                Stock
              </Label>
              <Input
                id="pred-current-stock"
                type="number"
                placeholder="20"
                className="h-8 text-sm"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pred-demand" className="text-xs text-muted-foreground mb-1 block">
                Exp. Demand
              </Label>
              <Input
                id="pred-demand"
                type="number"
                placeholder="8"
                className="h-8 text-sm"
                value={expectedDemand}
                onChange={(e) => setExpectedDemand(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full text-xs h-8 hover:bg-primary/5 hover:border-primary/40"
            onClick={handleAnalyze}
          >
            <Sparkles className="size-3.5 mr-1 text-primary" />
            Analyze Surplus Risk
          </Button>
        </div>

        {result && (
          <>
            <Separator />
            <div className={cn('rounded-lg border p-3 space-y-2', riskBgClass)}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{getRiskIndicator(result.risk)}</span>
                <span className={cn('text-sm capitalize', riskColorClass)}>
                  {result.risk === 'high' ? 'High' : result.risk === 'medium' ? 'Medium' : 'Low'} Surplus Risk
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{result.explanation}</p>
              <Separator className="my-2" />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recommended discount</span>
                  <span className="font-semibold text-primary">{Math.round(result.recommended_discount * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">List food</span>
                  <span className="font-medium">{result.recommended_listing_time}</span>
                </div>
                {originalPrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Suggested price</span>
                    <span className="font-semibold text-primary">
                      ₹{Math.round(originalPrice * (1 - result.recommended_discount))}
                    </span>
                  </div>
                )}
              </div>

              {onApplyRecommendation && originalPrice && (
                <Button
                  type="button"
                  size="sm"
                  className="w-full h-8 text-xs mt-2 bg-primary hover:bg-primary/90"
                  onClick={handleApply}
                >
                  Apply Suggested Price
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
