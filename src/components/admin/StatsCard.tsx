import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  subtitle: string;
  color: 'primary' | 'blue' | 'green' | 'purple';
  action?: {
    label: string;
    onClick: () => void;
  };
  extra?: React.ReactNode;
}

const colorStyles = {
  primary: {
    bg: 'bg-primary-100',
    text: 'text-primary-600',
    badge: 'bg-primary-100 text-primary-700',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    badge: 'bg-green-100 text-green-700',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
  },
};

export default function StatsCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  action,
  extra,
}: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="bg-white rounded-xl shadow-soft-xl p-6 transform hover:scale-[1.02] transition-all duration-200 border border-primary-100/10">
      <div className="flex items-center justify-between mb-4">
        <div className={`${styles.bg} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${styles.text}`} />
        </div>
        {action ? (
          <button
            onClick={action.onClick}
            className={`text-xs font-medium ${styles.badge} px-2 py-1 rounded-full hover:opacity-90 transition-opacity`}
          >
            {action.label}
          </button>
        ) : (
          <span className={`text-xs font-medium ${styles.badge} px-2 py-1 rounded-full`}>
            {title}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-serif mb-1">{value}</h3>
      <div className="space-y-1">
        <p className="text-sm text-primary-600">{subtitle}</p>
        {extra}
      </div>
    </div>
  );
}