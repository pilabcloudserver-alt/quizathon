import { Zap } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Zap className="h-6 w-6 text-primary" />
      <span className="text-xl font-black tracking-tighter text-foreground uppercase">
        Quizathon
      </span>
    </div>
  );
}
