'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, eachDayOfInterval, subDays, startOfDay } from 'date-fns';

interface Order {
  quantity: number;
  total_amount: number;
  commission: number;
  collected_at: string | null;
}

interface AnalyticsChartsProps {
  orders: Order[];
}

export function AnalyticsCharts({ orders }: AnalyticsChartsProps) {
  const chartData = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return last30Days.map((day) => {
      const dayStr = format(day, 'MMM d');
      const dayOrders = orders.filter((o) => {
        if (!o.collected_at) return false;
        return format(startOfDay(new Date(o.collected_at)), 'yyyy-MM-dd') === format(startOfDay(day), 'yyyy-MM-dd');
      });

      return {
        date: dayStr,
        orders: dayOrders.length,
        meals: dayOrders.reduce((sum, o) => sum + o.quantity, 0),
        revenue: Math.round(dayOrders.reduce((sum, o) => sum + o.total_amount, 0)),
      };
    });
  }, [orders]);

  // Only show last 14 for readability on bar chart
  const recentData = chartData.slice(-14);

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">
                {entry.name === 'Revenue' ? `₹${entry.value.toLocaleString('en-IN')}` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Revenue Recovered (₹)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={recentData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a5c38" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1a5c38" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#1a5c38"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Meals Rescued Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Meals Rescued</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={recentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="meals" name="Meals" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
