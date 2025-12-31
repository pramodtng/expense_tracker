import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/currency"
import { Currency } from "@/lib/currency"

type CategoryData = {
  name: string
  value: number
  color: string
}

type CategoryBreakdownChartProps = {
  data: CategoryData[]
  isLoading?: boolean
  currency: Currency
}
const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4'
];

export function CategoryBreakdownChart({ data, isLoading, currency }: CategoryBreakdownChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
          No category data available
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value, color } = payload[0].payload
      const percentage = ((value / total) * 100).toFixed(1)
      
      return (
        <div className="rounded-lg border bg-background p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <span className="font-medium">{name}</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="text-sm text-muted-foreground">Amount:</div>
            <div className="text-sm font-medium text-right">
              {formatCurrency(value, currency)}
            </div>
            <div className="text-sm text-muted-foreground">Percentage:</div>
            <div className="text-sm font-medium text-right">{percentage}%</div>
          </div>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN) * 1.1;
    const y = cy + radius * Math.sin(-midAngle * RADIAN) * 1.1;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]} 
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  paddingTop: '16px',
                }}
                formatter={(value, entry: any, index) => {
                  const percentage = ((entry.payload.value / total) * 100).toFixed(1)
                  return `${value} (${percentage}%)`
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
