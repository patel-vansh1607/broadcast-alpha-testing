import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Pulling keys from .env file
const SUPABASE_URL = 'https://soxrnpgogsfhxthktcme.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNveHJucGdvZ3NmaHh0aGt0Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDAyOTIsImV4cCI6MjA4NzQxNjI5Mn0.xATys-aD-tw9XKvrZRkB5xUuQVGs6jtTgOIu_aZ3PiU';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CHANNEL_NAME = 'india-broadcast-alpha';

function App() {
  const [status, setStatus] = useState('Connecting...');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // 1. Request Permission
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    // 2. Subscribe to the Global Channel
    const channel = supabase.channel(CHANNEL_NAME, {
      config: { broadcast: { self: true } }, 
    });

    channel
      .on('broadcast', { event: 'alert' }, (payload) => {
        const { text, time } = payload.payload;

        // Show System Notification
        if (Notification.permission === "granted") {
          new Notification("🚨 TRIP ALERT", {
            body: text,
            vibrate: [200, 100, 200]
          });
        }

        // Phone Vibrate
        if ("vibrate" in navigator) {
          navigator.vibrate([300, 100, 300]);
        }

        setMessages((prev) => [{ text, time }, ...prev]);
      })
      .subscribe((subStatus) => {
        if (subStatus === 'SUBSCRIBED') setStatus('ONLINE (Global)');
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendAlert = async () => {
    setSending(true);
    try {
      await supabase.channel(CHANNEL_NAME).send({
        type: 'broadcast',
        event: 'alert',
        payload: { 
          text: "ALPHA TEST: Move to the assembly point!", 
          time: new Date().toLocaleTimeString() 
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Comms Alpha</h2>
        <p style={{ color: status.includes('ONLINE') ? '#138808' : '#e63946' }}>
          Status: <strong>{status}</strong>
        </p>

        <button 
          onClick={sendAlert} 
          disabled={sending}
          style={{ ...styles.btn, backgroundColor: sending ? '#ccc' : '#138808' }}
        >
          {sending ? 'TRANSMITTING...' : 'SEND REMOTE ALERT'}
        </button>

        <div style={styles.log}>
          <p style={{ fontSize: '12px', fontWeight: 'bold' }}>RECENT ALERTS</p>
          {messages.map((m, i) => (
            <div key={i} style={styles.logItem}>
              <small>{m.time}</small>
              <div>{m.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '100%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  title: { color: '#1a1a1a', marginBottom: '5px' },
  btn: { width: '100%', padding: '15px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' },
  log: { marginTop: '30px', textAlign: 'left' },
  logItem: { padding: '10px', borderBottom: '1px solid #eee' }
};

export default App;