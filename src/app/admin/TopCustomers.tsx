'use client';

interface Customer {
  id: string;
  name: string | null;
  phone: string;
  totalSpent: number;
}

interface TopCustomersProps {
  customers: Customer[];
}

export default function TopCustomers({ customers }: TopCustomersProps) {
  if (customers.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '1.5rem', height: '100%' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'rgba(255,255,255,0.9)' }}>Mejores Clientes</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>No hay datos suficientes.</p>
      </div>
    );
  }

  // Encontrar el gasto máximo para calcular porcentajes de la barra
  const maxSpent = Math.max(...customers.map(c => c.totalSpent));

  return (
    <div className="glass-card" style={{ padding: '1.5rem', height: '100%' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'rgba(255,255,255,0.9)' }}>Mejores Clientes</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {customers.map((customer, index) => {
          const percentage = maxSpent > 0 ? (customer.totalSpent / maxSpent) * 100 : 0;
          
          return (
            <div key={customer.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#fff' }}>
                  <span style={{ opacity: 0.5, marginRight: '0.5rem' }}>#{index + 1}</span>
                  {customer.name && customer.name !== 'Cliente Nuevo' ? customer.name : customer.phone}
                </span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                  ${customer.totalSpent.toFixed(2)}
                </span>
              </div>
              
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${percentage}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, var(--primary) 0%, #00e696 100%)',
                    borderRadius: '4px',
                    transition: 'width 1s ease-in-out'
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
