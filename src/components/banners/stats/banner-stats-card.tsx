import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface BannerStatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  progress: number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function BannerStatsCard({
  title,
  value,
  subtitle,
  progress,
  icon: Icon,
  trend
}: BannerStatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>

          {trend && (
            <div className="flex items-center text-xs">
              <span className={`font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}
              </span>
              <span className="text-muted-foreground ml-1">vs mes anterior</span>
            </div>
          )}

          <div className="space-y-1">
            <Progress value={progress} className="h-1" />
            <p className="text-xs text-muted-foreground">{progress}% del objetivo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}