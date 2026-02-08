interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

const StatsCard = ({ title, value, description, icon, color }: StatsCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="mb-2">
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
};

export default StatsCard;