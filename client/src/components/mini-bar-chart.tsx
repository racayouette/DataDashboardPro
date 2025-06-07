import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardSummary } from "@shared/schema";

interface MiniBarChartProps {
  data?: DashboardSummary;
  isLoading: boolean;
}

export function MiniBarChart({ data, isLoading }: MiniBarChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const chartData = [
    {
      name: "Not Started",
      value: parseFloat(data.growthRate),
      fill: "#f97316"
    },
    {
      name: "In Progress", 
      value: data.orders,
      fill: "#a855f7"
    },
    {
      name: "FL Review",
      value: parseFloat(data.revenue),
      fill: "#22c55e"
    },
    {
      name: "HR Review",
      value: 90,
      fill: "#3b82f6"
    },
    {
      name: "Completed",
      value: 147,
      fill: "#10b981"
    }
  ];

  const COLORS = ["#f97316", "#a855f7", "#22c55e", "#3b82f6", "#10b981"];

  return (
    <Card className="p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Job Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [value, "Jobs"]}
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #e5e7eb",
                borderRadius: "6px"
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              fontSize={12}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}