/* eslint-disable no-restricted-globals */
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'Alert', body: 'New Message!' };
  
  const options = {
    body: data.body,
    icon: '/logo192.png', // Make sure this path is correct
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "TRIP UPDATE", options)
  );
});