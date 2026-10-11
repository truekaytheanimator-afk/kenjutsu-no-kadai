importScripts('https://www.gstatic.com/firebasejs/13.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCYXYPcRYPRWCoyx32J54lpoYSQWxI1D7Q",
  authDomain: "knk-pushnotifs.firebaseapp.com",
  projectId: "knk-pushnotifs",
  storageBucket: "knk-pushnotifs.firebasestorage.app",
  messagingSenderId: "731349079895",
  appId: "1:731349079895:web:a47ec39ef07c7ac5095012",
  measurementId: "G-SNJEZQ79B2"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// handle background notifications
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/src/knklogodark0001.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});