import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh] bg-transparent">
      <div className="flex flex-col items-center gap-3 text-zinc-400">
        <Loader2 size={32} className="animate-spin" />
        <p className="text-sm font-medium">Initializing studio...</p>
      </div>
    </div>
  );
}
