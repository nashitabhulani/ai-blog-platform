export default function StatCard({ value, label, change, changePositive = true }) {
  return (
    <div className="bg-dark-100 border border-dark-400 rounded-xl p-4">
      <p className="text-2xl font-semibold text-white font-mono tracking-tight mb-1">{value}</p>
      <p className="text-[11px] text-gray-500 font-medium">{label}</p>
      {change && (
        <p className={`text-[11px] font-mono mt-1.5 ${changePositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {changePositive ? '↑' : '↓'} {change}
        </p>
      )}
    </div>
  )
}
