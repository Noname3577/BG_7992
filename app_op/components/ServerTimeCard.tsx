import { ServerTime } from '@/types/market';
import { formatServerTime } from '@/lib/utils/format';

interface ServerTimeCardProps {
  serverTime: ServerTime | null;
  lastUpdate: Date | null;
}

export default function ServerTimeCard({ serverTime, lastUpdate }: ServerTimeCardProps) {
  return (
    <div className="mb-6 p-4 bg-white dark:bg-zinc-900 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
        Server Time
      </h2>
      {serverTime && (
        <div className="space-y-1 text-zinc-700 dark:text-zinc-300">
          <p className="text-sm">
            เวลาอัพเดท: {lastUpdate?.toLocaleTimeString('th-TH')}
          </p>
          {Object.entries(serverTime).map(([key, value]) => (
            <p key={key} className="text-sm">
              <span className="font-semibold">{key}:</span>{' '}
              {typeof value === 'number' ? formatServerTime(value) : value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
