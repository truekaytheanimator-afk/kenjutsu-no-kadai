import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCYXYPcRYPRWCoyx32J54lpoYSQWxI1D7Q",
  authDomain: "knk-pushnotifs.firebaseapp.com",
  projectId: "knk-pushnotifs",
  storageBucket: "knk-pushnotifs.firebasestorage.app",
  messagingSenderId: "731349079895",
  appId: "1:731349079895:web:a47ec39ef07c7ac5095012",
  measurementId: "G-SNJEZQ79B2"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log("Firebase Service Worker registered:", registration.scope);
        })
        .catch((err) => {
            console.error("Firebase Service Worker registration failed:", err);
        });
}

const db = getFirestore(app);

const VAPID_KEY = "BF7TcmczNYy5pyIhrAitBBcbK0nnCxaYF7tn9SS1yIEmft8n08At_quekOGxvpO5T9OWHcLh7reBQ45ywX-1qIc";

export async function enablePushNotifications() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        await setDoc(doc(db, "push_tokens", token), {
          subscribedAt: new Date().toISOString(),
          userAgent: navigator.userAgent
        });
        return token;
      }
    }
  } catch (err) {
    console.error('Error getting token:', err);
  }
}

onMessage(messaging, (payload) => {
  alert(`${payload.notification.title}\n\n${payload.notification.body}`);
});

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("subscribePushBtn");
    if (btn) {
        btn.addEventListener("click", async () => {
            const token = await enablePushNotifications();
            if (token) {
                btn.textContent = "Notifications Enabled";
                btn.disabled = true;
                btn.style.backgroundColor = "#2a7a2a";
                alert("You're subscribed! You'll be notified when a new chapter comes out.");
            } else {
                alert("Notification permission was denied or couldn't be set up.");
            }
        });
    }
});