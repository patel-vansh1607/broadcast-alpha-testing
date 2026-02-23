import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CHANNEL_NAME = 'india_trip_emergency_broadcast';

function App() {
  const [status, setStatus] = useState('Connecting to Cloud...');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  // 1. Critical for Phones: Manually trigger the "Allow" box
  const enableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        alert("System Notifications Enabled ✅");
      }
    }
  };

  useEffect(() => {
    // 2. Setup the Realtime Channel
    const channel = supabase.channel(CHANNEL_NAME, {
      config: { broadcast: { self: true } }, 
    });

    channel
      .on('broadcast', { event: 'alert' }, (payload) => {
        const { text, time } = payload.payload;

        // FORCE ALERT: This wakes up the phone screen
        window.alert(`🚨 NEW ALERT: ${text}`);

        // VIBRATE: 3 Long Pulses
        if ("vibrate" in navigator) {
          navigator.vibrate([500, 200, 500, 200, 500]);
        }

        // SYSTEM NOTIFICATION (if app is in background/minimized)
        if (Notification.permission === "granted") {
          new Notification("TRIP NOTIFICATION", {
            body: text,
            requireInteraction: true,
            icon: "https://cdn-icons-png.flaticon.com/512/1157/1157000.png"
          });
        }

        setMessages((prev) => [{ text, time }, ...prev]);
      })
      .subscribe((subStatus) => {
        if (subStatus === 'SUBSCRIBED') setStatus('ONLINE (Global Ready)');
        if (subStatus === 'CHANNEL_ERROR') setStatus('Connection Failed');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendFromThisDevice = async () => {
    setSending(true);
    try {
      await supabase.channel(CHANNEL_NAME).send({
        type: 'broadcast',
        event: 'alert',
        payload: { 
          text: "ALPHA ALERT: This is a test from " + (window.innerWidth > 800 ? "Laptop" : "Phone"),
          time: new Date().toLocaleTimeString() 
        },
      });
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>India Trip 2026</h1>
        <div style={{...styles.badge, backgroundColor: status.includes('ONLINE') ? '#e6fffa' : '#fff5f5'}}>
          <span style={{color: status.includes('ONLINE') ? '#047481' : '#c53030'}}>
            ● {status}
          </span>
        </div>

        <div style={styles.actionArea}>
          <button onClick={enableNotifications} style={styles.secondaryBtn}>
            1. Setup Permissions
          </button>
          
          <button 
            onClick={sendFromThisDevice} 
            disabled={sending}
            style={{...styles.primaryBtn, backgroundColor: sending ? '#a0aec0' : '#138808'}}
          >
            {sending ? "TRANSMITTING..." : "2. SEND GLOBAL ALERT"}
          </button>
        </div>

        <div style={styles.history}>
          <h3 style={styles.historyTitle}>Broadcast History</h3>
          {messages.length === 0 && <p style={styles.empty}>No messages received yet.</p>}
          {messages.map((m, i) => (
            <div key={i} style={styles.msgBox}>
              <small style={styles.time}>{m.time}</small>
              <div style={styles.msgText}>{m.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#f7fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '20px', fontFamily: '-apple-system, sans-serif' },
  card: { backgroundColor: 'white', width: '100%', maxWidth: '400px', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', height: 'fit-content' },
  title: { textAlign: 'center', fontSize: '24px', color: '#2d3748', marginBottom: '10px' },
  badge: { textAlign: 'center', padding: '8px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', marginBottom: '30px' },
  actionArea: { display: 'flex', flexDirection: 'column', gap: '15px' },
  primaryBtn: { padding: '20px', borderRadius: '12px', border: 'none', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(19,136,8,0.2)' },
  secondaryBtn: { padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#4a5568', cursor: 'pointer' },
  history: { marginTop: '40px' },
  historyTitle: { fontSize: '14px', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #edf2f7', paddingBottom: '10px' },
  msgBox: { padding: '15px 0', borderBottom: '1px solid #edf2f7' },
  time: { fontSize: '10px', color: '#a0aec0' },
  msgText: { color: '#2d3748', marginTop: '4px', fontWeight: '500' },
  empty: { textAlign: 'center', color: '#a0aec0', marginTop: '20px', fontSize: '14px' }
};

export default App;