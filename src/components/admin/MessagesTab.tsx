import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface MessagesTabProps {
  rsvps: any[];
}

export default function MessagesTab({ rsvps }: MessagesTabProps) {
  const withMessages = rsvps.filter((r) => r.message);

  return (
    <div className="space-y-4">
      {withMessages.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No messages from guests yet.</p>
      ) : (
        withMessages.map((r) => (
          <Card key={r.id} className="border-primary/10">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">{r.guest_name}</p>
                  <p className="text-muted-foreground text-sm mt-1">{r.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
