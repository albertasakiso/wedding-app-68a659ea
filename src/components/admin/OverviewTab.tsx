import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Heart } from "lucide-react";

interface OverviewTabProps {
  rsvps: any[];
}

export default function OverviewTab({ rsvps }: OverviewTabProps) {
  const total = rsvps.length;
  const attending = rsvps.filter((r) => r.attending).length;
  const declined = rsvps.filter((r) => !r.attending).length;
  const plusOnes = rsvps.filter((r) => r.plus_one_name).length;

  const stats = [
    { label: "Total RSVPs", value: total, icon: Users, color: "text-primary" },
    { label: "Attending", value: attending, icon: UserCheck, color: "text-green-600" },
    { label: "Declined", value: declined, icon: UserX, color: "text-red-500" },
    { label: "Plus Ones", value: plusOnes, icon: Heart, color: "text-pink-500" },
    { label: "Total Guests", value: attending + plusOnes, icon: Users, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-primary/10">
            <CardContent className="pt-6 text-center">
              <s.icon className={`h-8 w-8 mx-auto mb-2 ${s.color}`} />
              <p className="text-3xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(meals).length > 0 && (
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" /> Meal Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(meals).map(([meal, count]) => (
                <div key={meal} className="bg-muted rounded-lg p-3 text-center">
                  <p className="font-semibold text-foreground">{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">{meal}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
