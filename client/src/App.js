import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. HARDCODE YOUR KEYS HERE - DO NOT USE .ENV FOR THIS TEST
const SUPABASE_URL = 'https://soxrnpgogsfhxthktcme.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNveHJucGdvZ3NmaHh0aGt0Y21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDAyOTIsImV4cCI6MjA4NzQxNjI5Mn0.xATys-aD-tw9XKvrZRkB5xUuQVGs6jtTgOIu_aZ3PiU';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Use a very simple channel name
const CHANNEL_NAME = 'test_room';

function App() {
  const [status, setStatus] = useState('Connecting...');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 2. Setup Channel
    const channel = supabase.channel(CHANNEL_NAME, {
      config: { broadcast: { self: true } }, 
    });

    channel
      .on('broadcast', { event: 'alert' }, (payload) => {
        console.log("RECEIVED:", payload);
        const text = payload.payload.text;
        
        // Vibrate + Alert (Hard for Android to ignore)
        if ("vibrate" in navigator) navigator.vibrate([500, 200, 500]);
        window.alert("🚨 MESSAGE: " + text);

        setMessages(prev => [{ text, time: new Date().toLocaleTimeString() }, ...prev]);
      })
      .subscribe((s) => {
        console.log("STATUS:", s);
        if (s === 'SUBSCRIBED') setStatus('ONLINE ✅');
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendAlert = async () => {
    console.log("SENDING...");
    await supabase.channel(CHANNEL_NAME).send({
      type: 'broadcast',
      event: 'alert',
      payload: { text: "Hello from " + (window.innerWidth > 800 ? "Laptop" : "Phone") },
    });
  };

  return (
    <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Global Comms Test</h2>
      <div style={{ 
        padding: '10px', 
        backgroundColor: status === 'ONLINE ✅' ? '#dcfce7' : '#fee2e2',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        Status: <strong>{status}</strong>
      </div>

      <button 
        onClick={sendAlert}
        style={{ 
          padding: '20px', width: '100%', fontSize: '18px', 
          backgroundColor: '#138808', color: 'white', border: 'none', 
          borderRadius: '12px', fontWeight: 'bold' 
        }}
      >
        SEND BROADCAST
      </button>

      <div style={{ marginTop: '30px', textAlign: 'left' }}>
        <h4>Inbox:</h4>
        {messages.map((m, i) => (
          <div key={i} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
             <small>{m.time}</small> : {m.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;