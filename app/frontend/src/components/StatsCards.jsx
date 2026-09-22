export default function StatsCards({ stats }) {
  const cards = [
    { label: 'Total Tasks', value: stats.total, delta: '+6% vs last week', tone: 'neutral', icon: '📋' },
    { label: 'In Progress', value: stats.inProgress, delta: '+2% vs last week', tone: 'neutral', icon: '⏳' },
    { label: 'Completed', value: stats.completed, delta: '+33% vs last week', tone: 'success', icon: '✓' },
    { label: 'Due Today', value: stats.dueToday, delta: '+1 from yesterday', tone: 'danger', icon: '📅' },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <article key={card.label} className={`stat-card stat-${card.tone}`}>
          <div className="stat-card-top">
            <span className="stat-label">{card.label}</span>
            <span className="stat-icon">{card.icon}</span>
          </div>
          <div className="stat-value">{card.value}</div>
          <div className={`stat-delta delta-${card.tone}`}>{card.delta}</div>
        </article>
      ))}
    </div>
  );
}
