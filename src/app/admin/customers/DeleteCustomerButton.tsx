'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteCustomerButtonProps {
  id: string;
  name: string | null;
  phone: string;
}

export default function DeleteCustomerButton({ id, name, phone }: DeleteCustomerButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const customerName = name && name !== 'Cliente Nuevo' ? name : phone;
    const confirmDelete = confirm(`¿Estás seguro que deseas eliminar permanentemente al cliente ${customerName}?\nSe eliminarán todas sus transacciones. Esta acción no se puede deshacer.`);
    
    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/customers?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Error al eliminar el cliente');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--danger)',
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        opacity: isDeleting ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.4rem',
        borderRadius: '4px'
      }}
      title="Eliminar Cliente"
    >
      <Trash2 size={18} />
    </button>
  );
}
