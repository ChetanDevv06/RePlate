'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { predictionInputSchema, type PredictionInputFormData } from '@/lib/validations';
import { calculateSurplusRisk, getRiskIndicator } from '@/lib/prediction';
import { RECOMMENDED_LISTING_TIMES } from '@/lib/constants';
import type { PredictionResult } from '@/types';
import { cn } from '@/lib/utils';
import { Brain, ChevronRight } from 'lucide-react';

interface PredictionCardProps {
  originalPrice?: number;
  onApplyRecommendation?: (discountedPrice: number) => void;
}

export function PredictionCard({ originalPrice, onApplyRecommendation }: PredictionCardProps) {
  const [result, setResult] = useState<PredictionResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PredictionInputFormData>({
    resolver: zodResolver(predictionInputSchema),
    defaultValues: { average_daily_sales: 0, current_stock: 0, expected_demand: 0 },
  });

  const onSubmit = (data: PredictionInputFormData) => {
    const prediction = calculateSurplusRisk(data);
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
            <CardTitle className="text-base">RePlate Smart Prediction</CardTitle>
            <CardDescription className="text-xs">Rule-based surplus risk analysis</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="avg-sales" className="text-xs text-muted-foreground mb-1 block">
                Avg. Daily Sales
              </Label>
              <Input
                id="avg-sales"
                type="number"
                min="0"
                placeholder="12"
                className="h-8 text-sm"
                {...register('average_daily_sales', { valueAsNumber: true })}
              />
              {errors.average_daily_sales && (
                <p className="text-xs text-destructive mt-0.5">{errors.average_daily_sales.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="current-stock" className="text-xs text-muted-foreground mb-1 block">
                Current Stock
              </Label>
              <Input
                id="current-stock"
                type="number"
                min="1"
                placeholder="20"
                className="h-8 text-sm"
                {...register('current_stock', { valueAsNumber: true })}
              />
              {errors.current_stock && (
                <p className="text-xs text-destructive mt-0.5">{errors.current_stock.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="expected-demand" className="text-xs text-muted-foreground mb-1 block">
                Expected Demand
              </Label>
              <Input
                id="expected-demand"
                type="number"
                min="0"
                placeholder="8"
                className="h-8 text-sm"
                {...register('expected_demand', { valueAsNumber: true })}
              />
              {errors.expected_demand && (
                <p className="text-xs text-destructive mt-0.5">{errors.expected_demand.message}</p>
              )}
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full text-xs h-8"
            onClick={handleSubmit(onSubmit)}
          >
            Analyze Surplus Risk
            <ChevronRight className="size-3 ml-1" />
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
                  <span className="font-semibold">{Math.round(result.recommended_discount * 100)}%</span>
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
                  size="sm"
                  className="w-full h-8 text-xs mt-2"
                  onClick={handleApply}
                >
                  Apply Recommendation
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
