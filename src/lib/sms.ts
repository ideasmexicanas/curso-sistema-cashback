import { prisma } from '@/lib/prisma';

/**
 * Biblioteca para envío de mensajes SMS usando SMS Masivos (México)
 */

const API_KEY = process.env.SMS_MASIVOS_KEY || '4272002b8a218faa777e3fd9b7aac07f40c40cfc';
const BASE_URL = 'https://api.smsmasivos.com.mx';

export async function sendSMS(to: string, message: string, logData?: { tenantId: string, type: string }): Promise<boolean> {
  try {
    // Normalizamos el número a 10 dígitos para México
    const cleanNumber = to.replace(/\D/g, '').slice(-10);
    
    console.log(`[SMS Masivos] Intentando enviar SMS a: 52-${cleanNumber}`);

    const url = new URL(`${BASE_URL}/sms/send`);
    url.searchParams.append('apikey', API_KEY);
    url.searchParams.append('numbers', cleanNumber);
    url.searchParams.append('country_code', '52');
    url.searchParams.append('message', message);

    const response = await fetch(url.toString(), {
      method: 'GET'
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`[SMS Masivos] ✅ SMS enviado con éxito a ${cleanNumber}`);
      
      // Registrar el mensaje si tenemos el tenantId
      if (logData && logData.tenantId) {
        try {
          await prisma.messageLog.create({
            data: {
              tenantId: logData.tenantId,
              channel: 'SMS',
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
      console.error(`[SMS Masivos] ❌ Error de la API de SMS:`, data);
      const errorMsg = data.message || data.error || JSON.stringify(data);
      throw new Error(`Error de SMS Masivos: ${errorMsg}`);
    }
  } catch (error) {
    console.error('[SMS Masivos] 🚨 Error crítico al enviar SMS:', error);
    throw error;
  }
}
