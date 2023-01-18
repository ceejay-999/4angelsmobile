const ciapi = process.env.VUE_APP_CIAPI;
const mapboxApiKey = process.env.VUE_APP_MAPBOX_APIKEY;
const firebaseConfig = process.env.VUE_APP_FIREBASE_CONFIG;

const needEmailVerif = false;

export { ciapi, needEmailVerif, mapboxApiKey, firebaseConfig };
