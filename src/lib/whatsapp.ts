import { prisma } from '@/lib/prisma';

/**
 * Biblioteca para envío de mensajes vía WhatsApp usando SMS Masivos (México)
 */

const API_KEY = process.env.SMS_MASIVOS_KEY || '4272002b8a218faa777e3fd9b7aac07f40c40cfc';
const INSTANCE_ID = process.env.SMS_MASIVOS_INSTANCE || 'irbj0fq0-87gb-vgvo-slds-h09p35skot74';
const BASE_URL = 'https://api.smsmasivos.com.mx';

export async function sendWhatsApp(to: string, message: string, logData?: { tenantId: string, type: string }): Promise<boolean> {
  try {
    // Normalizamos el número a 10 dígitos para México
    const cleanNumber = to.replace(/\D/g, '').slice(-10);
    
    console.log(`[SMS Masivos] Intentando enviar a: 52-${cleanNumber}`);

    const url = new URL(`${BASE_URL}/whatsapp/send`);
    url.searchParams.append('apikey', API_KEY);
    url.searchParams.append('instance_id', INSTANCE_ID);
    url.searchParams.append('type', 'text');
    url.searchParams.append('number', cleanNumber);
    url.searchParams.append('country_code', '52');
    url.searchParams.append('message', message);

    const response = await fetch(url.toString(), {
      method: 'GET'
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`[SMS Masivos] ✅ Mensaje enviado con éxito a ${cleanNumber}`);
      
      // Registrar el mensaje si tenemos el tenantId
      if (logData && logData.tenantId) {
        try {
          await prisma.messageLog.create({
            data: {
              tenantId: logData.tenantId,
              channel: 'WHATSAPP',
              type: logData.type,
              phone: cleanNumber,
              status: 'SENT'
            }
          });
        } catch (dbError) {
          console.error('[SMS Masivos] ⚠️ Error registrando el log del mensaje:', dbError);
        }
      }
      
      return true;
    } else {
      console.error(`[SMS Masivos] ❌ Error de la API:`, data);
      const errorMsg = data.message || data.error || JSON.stringify(data);
      throw new Error(`Error de SMS Masivos: ${errorMsg}`);
    }
  } catch (error) {
    console.error('[SMS Masivos] 🚨 Error crítico:', error);
    throw error;
  }
}
