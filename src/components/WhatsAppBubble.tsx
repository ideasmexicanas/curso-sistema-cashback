'use client';
import { useState, useEffect } from 'react';
import styles from './WhatsAppBubble.module.css';

export default function WhatsAppBubble() {
  const [isVisible, setIsVisible] = useState(false);
  const phoneNumber = "527442584411";
  const message = "Hola, tengo una duda sobre LoyaltyOS...";

  // Show automatically after 3 seconds to grab attention
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Auto hide after 8 seconds if they don't interact to keep it clean
      setTimeout(() => setIsVisible(false), 8000);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={styles.bubbleContainer}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div className={`${styles.messageBubble} ${isVisible ? styles.visible : ''}`}>
        Cuéntanos cómo podemos ayudarte o si tienes alguna duda. 👋
      </div>
      <a 
        href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappButton}
        title="Contáctanos por WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="34" height="34" fill="white">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.711.927 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.101.824zm-3.392-10.616c-4.284 0-7.76 3.475-7.761 7.761 0 1.46.38 2.808 1.063 3.999l-1.094 3.999 4.098-1.074c1.144.612 2.457.962 3.821.964l.003.001c4.281 0 7.758-3.475 7.76-7.76.002-4.284-3.474-7.762-7.76-7.762z"/>
        </svg>
      </a>
    </div>
  );
}
