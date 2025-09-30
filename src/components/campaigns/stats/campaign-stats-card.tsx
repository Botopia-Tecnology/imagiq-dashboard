import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface CampaignStatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  progress: number;
  icon: LucideIcon;
}

export function CampaignStatsCard({
  title,
  value,
  subtitle,
  progress,
  icon: Icon
}: CampaignStatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mb-2">
          {subtitle}
        </p>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {progress}% del objetivo
        </p>
      </CardContent>
    </Card>
  );
}