'use client';

import { Calendar, Gift } from 'lucide-react';

interface BirthdayCustomer {
  id: string;
  name: string | null;
  phone: string;
  daysUntil: number;
  birthDate: Date;
}

interface UpcomingBirthdaysProps {
  birthdays: BirthdayCustomer[];
}

export default function UpcomingBirthdays({ birthdays }: UpcomingBirthdaysProps) {
  if (birthdays.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '1.5rem', height: '100%' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Gift size={20} color="#ffb800" /> Próximos Cumpleaños
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>No hay cumpleaños próximos registrados.</p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '1.5rem', height: '100%' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Gift size={20} color="#ffb800" /> Próximos Cumpleaños
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {birthdays.map((bday) => {
          const isToday = bday.daysUntil === 0;
          
          return (
            <div 
              key={bday.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '0.8rem',
                background: isToday ? 'rgba(255, 184, 0, 0.15)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isToday ? 'rgba(255, 184, 0, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ 
                  background: isToday ? '#ffb800' : 'rgba(255,255,255,0.1)', 
                  padding: '0.5rem', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isToday ? '#000' : '#fff'
                }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: isToday ? 'bold' : 'normal' }}>
                    {bday.name && bday.name !== 'Cliente Nuevo' ? bday.name : bday.phone}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                    {new Date(bday.birthDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  color: isToday ? '#ffb800' : 'var(--primary)', 
                  fontWeight: 'bold', 
                  fontSize: '0.9rem' 
                }}>
                  {isToday ? '¡Hoy!' : `En ${bday.daysUntil} día${bday.daysUntil > 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
