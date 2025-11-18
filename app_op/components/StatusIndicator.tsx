interface StatusIndicatorProps {
  lastUpdate: Date | null;
}

export default function StatusIndicator({ lastUpdate }: StatusIndicatorProps) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span>Live - อัพเดทล่าสุด: {lastUpdate?.toLocaleTimeString('th-TH')}</span>
    </div>
  );
}
