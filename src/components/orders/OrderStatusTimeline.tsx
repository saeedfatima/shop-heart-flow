import { cn } from "@/lib/utils";
import { Package, CreditCard, Settings, Truck, CheckCircle, XCircle } from "lucide-react";

const STEPS = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "paid", label: "Payment Confirmed", icon: CreditCard },
  { key: "processing", label: "Processing", icon: Settings },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
] as const;

const stepIndex = (status: string) =>
  STEPS.findIndex((s) => s.key === status);

interface OrderStatusTimelineProps {
  status: string;
  className?: string;
}

const OrderStatusTimeline = ({ status, className }: OrderStatusTimelineProps) => {
  const isCancelled = status === "cancelled";
  const activeIdx = isCancelled ? -1 : stepIndex(status);

  return (
    <div className={cn("w-full", className)}>
      {isCancelled ? (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-medium text-destructive">Order Cancelled</p>
            <p className="text-sm text-muted-foreground">This order has been cancelled.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-1">
          {STEPS.map((step, idx) => {
            const isComplete = idx <= activeIdx;
            const isCurrent = idx === activeIdx;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-1 flex-col items-center gap-2 relative">
                {/* Connector line */}
                {idx > 0 && (
                  <div
                    className={cn(
                      "absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 z-0",
                      idx <= activeIdx ? "bg-primary" : "bg-border"
                    )}
                  />
                )}

                {/* Icon circle */}
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    isComplete
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[11px] leading-tight text-center",
                    isCurrent ? "font-semibold text-foreground" : isComplete ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderStatusTimeline;
