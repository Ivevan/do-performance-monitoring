export const statusVariant = (status: string) => {
  switch (status) {
    case "On Track":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "At Risk":
      return "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30";
    case "Delayed":
      return "bg-dost-red/15 text-dost-red border-dost-red/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};
