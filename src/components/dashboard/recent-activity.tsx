import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  customer: string
  action: string
  amount: number
  time: string
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'Nueva orden':
        return 'bg-blue-100 text-blue-800'
      case 'Orden entregada':
        return 'bg-green-100 text-green-800'
      case 'Pago confirmado':
        return 'bg-emerald-100 text-emerald-800'
      case 'Orden cancelada':
        return 'bg-red-100 text-red-800'
      case 'Orden enviada':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={getActionColor(activity.action)}>
                    {activity.action}
                  </Badge>
                  <span className="text-sm font-medium">#{activity.id}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.customer}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  ${activity.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  hace {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}