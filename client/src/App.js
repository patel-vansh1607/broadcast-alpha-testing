import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

// YOUR SPECIFIC IP ADDRESS
const socket = io('http://192.168.1.162:3001');

function App() {
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
  // 1. Request Permission as soon as the app loads
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      console.log("Notification permission:", permission);
    });
  }

  socket.on('receive_update', (data) => {
    // 2. Trigger the SYSTEM notification bar
    if (Notification.permission === "granted") {
      const options = {
        body: data.text,
        requireInteraction: true, // Keeps it on screen until they tap it
        vibrate: [200, 100, 200]
      };
      
      // This is what puts it in the notification tray
      new Notification("BROADCAST ALPHA", options);
    }

    // 3. Fallback: Internal alert and vibration
    if ("vibrate" in navigator) {
      navigator.vibrate([500, 100, 500]);
    }
  });

  return () => socket.off('receive_update');
}, []);
  const handleSend = () => {
    if (message.trim()) {
      socket.emit('send_update', { 
        text: message, 
        time: new Date().toLocaleTimeString() 
      });
      setMessage("");
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#ff9933' }}>India Comms Test</h1>
      <p>Connection: 
        <span style={{ color: isConnected ? 'green' : 'red', fontWeight: 'bold' }}>
          {isConnected ? " ONLINE" : " OFFLINE"}
        </span>
      </p>

      <div style={{ marginBottom: '20px' }}>
        <input 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Enter stealth update..." 
          style={{ padding: '12px', width: '70%', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <br /><br />
        <button 
          onClick={handleSend} 
          style={{ padding: '12px 30px', backgroundColor: '#138808', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          BROADCAST TO ALL
        </button>
      </div>

      <hr />

      <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
        <h3>History:</h3>
        {logs.map((log, i) => (
          <div key={i} style={{ background: '#f4f4f4', padding: '10px', marginBottom: '10px', borderRadius: '5px', borderLeft: '5px solid #138808' }}>
            <small>{log.time}</small>
            <p style={{ margin: '5px 0' }}>{log.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;