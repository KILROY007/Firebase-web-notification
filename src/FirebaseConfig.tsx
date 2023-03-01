import { initializeApp } from "firebase/app";
import { getToken, getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FB_API_KEY,
  authDomain: process.env.REACT_APP_FB_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FB_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FB_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FB_APP_ID,
};

const UrlFirebaseConfig = new URLSearchParams(
  {
    apiKey: process.env.REACT_APP_FB_API_KEY,
    authDomain: process.env.REACT_APP_FB_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FB_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FB_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FB_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FB_APP_ID,
  }.toString()
);

const swUrl = `${process.env.REACT_APP_POZ_URL}/firebase-messaging-sw.js?${UrlFirebaseConfig}`;

export const firebaseApp = initializeApp(firebaseConfig);

export const messaging = (async () => {
  try {
    const isSupportedBrowser = await isSupported();
    if (isSupportedBrowser) {
      return getMessaging(firebaseApp);
    }
    console.log("Firebase is not supported in this browser");
    return null;
  } catch (err) {
    console.log(err);
    return null;
  }
})();

export const getOrRegisterServiceWorker = () => {
  if (
    "serviceWorker" in navigator &&
    typeof window.navigator.serviceWorker !== "undefined"
  ) {
    return window.navigator.serviceWorker
      .getRegistration("/firebase-push-notification-scope")
      .then((serviceWorker) => {
        if (serviceWorker) return serviceWorker;
        return window.navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          {
            scope: "/firebase-push-notification-scope",
          }
        );
      });
  }
  throw new Error("The browser doesn`t support service worker.");
};

export const getFirebaseToken = async () => {
  try {
    const messagingResolve = await messaging;
    if (messagingResolve) {
      return getOrRegisterServiceWorker().then((serviceWorkerRegistration) => {
        return Promise.resolve(
          getToken(messagingResolve, {
            vapidKey: process.env.REACT_APP_FB_VAPID_KEY,
            serviceWorkerRegistration,
          })
        );
      });
    }
  } catch (error) {
    console.log("An error occurred while retrieving token. ", error);
  }
};
