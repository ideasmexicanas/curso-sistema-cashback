'use client';

import { useState, useEffect } from 'react';
import styles from './employees.module.css';

interface Employee {
  id: string;
  name: string;
  createdAt: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) setEmployees(data.employees);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    });
    setNewName('');
    fetchEmployees();
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar a este cajero?')) return;
    await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
    fetchEmployees();
  };

  return (
    <div className={styles.container}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Equipo y Cajeros</h2>

      <div className={styles.addCard}>
        <form onSubmit={addEmployee} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="Nombre del nuevo cajero..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Añadir Cajero</button>
        </form>
      </div>

      <div className={styles.listCard}>
        {isLoading ? (
          <p style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Cargando empleados...</p>
        ) : employees.length === 0 ? (
          <p style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No hay empleados registrados. El sistema usará &quot;Cajero Default&quot; en la Terminal.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha de Alta</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td style={{ opacity: 0.7 }}>{new Date(emp.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => deleteEmployee(emp.id)}
                      className={styles.deleteBtn}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
