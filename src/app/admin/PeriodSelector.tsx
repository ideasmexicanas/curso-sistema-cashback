import styles from './admin.module.css';

type Period = 'hora' | 'dia' | 'semana' | 'quincena' | 'mes' | 'anio';

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
}

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const periods: { id: Period; label: string }[] = [
    { id: 'hora', label: 'Hora' },
    { id: 'dia', label: 'Hoy' },
    { id: 'semana', label: 'Semana' },
    { id: 'quincena', label: 'Quincena' },
    { id: 'mes', label: 'Mes' },
    { id: 'anio', label: 'Año' },
  ];

  return (
    <div className={styles.periodSelectorContainer}>
      {periods.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`${styles.periodBtn} ${value === p.id ? styles.periodBtnActive : ''}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
