import { type LucideIcon, Plus, Boxes } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = Boxes,
  title,
  description,
  actionText,
  onAction,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
          <Icon size={30} className="stroke-[1.75]" />
        </div>
        <div className="absolute inset-0 bg-emerald-500/20 blur-xl -z-10 rounded-full" />
      </div>

      <h3 className="text-base font-bold text-slate-800 dark:text-white tracking-tight mb-1">
        {title}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-semibold text-xs transition shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus size={15} className="stroke-[2.5]" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
