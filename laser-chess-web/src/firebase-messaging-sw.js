// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Reemplaza con los valores reales de tu proyecto Firebase
firebase.initializeApp({
    apiKey: "AIzaSyDummy",
    authDomain: "example.firebaseapp.com",
    projectId: "example-project",
    storageBucket: "example.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje en background', payload);
  const notificationTitle = payload.notification?.title || 'Notificación';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/assets/icon.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});