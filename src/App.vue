<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script>
import { defineComponent } from 'vue';
import { IonApp, IonRouterOutlet, alertController } from '@ionic/vue';
import { lStore, openToast } from '@/functions.js';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { Geolocation } from '@capacitor/geolocation';
import { NativeSettings, AndroidSettings, IOSSettings } from 'capacitor-native-settings';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic';
import { warning } from 'ionicons/icons';
import router from '@/router';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet,
  },
  data(){
    return{
      loginPaths: [
        "/home",
        "/splash",
        "/welcome",
        "/login",
      ],
      interval: null,
      alerted: true,
      alert1: '',
      alert2: '',
      alert3: '',
      isChecked: false,
      isExecuted: false,
      companyName: '4Angels Healthcare Staffing'
    };
  },
  beforeUnmounted() {
    clearInterval(this.interval);
  },
  created() {
    this.routeChanged(this.$route.path);
    defineCustomElements(window);
  },
  mounted() {
    if (!navigator.onLine) this.presentAlert3();
    else this.dismissAlert3();
    if (Capacitor.isNativePlatform()) {
      Network.addListener('networkStatusChange', status => {
        if (status.connected == false && status.connectionType == 'none') this.presentAlert3();
        if (status.connected == false && status.connectionType == 'unknown') this.presentAlert3();
        if (status.connected == true && status.connectionType == 'wifi' || status.connectionType == 'cellular') this.dismissAlert3();
      });
    }
  },
  methods: {
    getLocation() {
      return new Promise((resolve, reject)=>{
        navigator.geolocation.getCurrentPosition(
          position => {
            const location = {
              lat: position.coords.latitude,
              long: position.coords.longitude
            };
            resolve(location); // Resolve with location. location can now be accessed in the .then method.
          },
          err => {
            this.locationResponse = `${err.message}`;
            if (err.message == 'Position acquisition timed out') return;
            openToast(this.locationResponse, 'danger', warning);
            reject(err); // Reject with err. err can now be accessed in the .catch method.
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });
    },
    async locationState() {
      const enabled = await Diagnostic.isLocationEnabled();
      if (enabled) {
        this.dismissAlert2();
        const status = await Diagnostic.getLocationAuthorizationStatus();
        if (status == 'NOT_REQUESTED' || status == 'not_determined') Geolocation.requestPermissions();
        if (status == 'DENIED_ONCE' || status == 'denied_once' || status == 'DENIED_ALWAYS' || status == 'denied_always') this.presentAlert1();
        if (status == 'RESTRICTED' || status == 'restricted') this.presentAlert1();
        if (status == 'GRANTED' || status == 'granted' || status == 'GRANTED_WHEN_IN_USE' || status == 'granted_when_in_use') this.dismissAlert1();
        if (status == 'AUTHORIZED' || status == 'authorized' || status == 'AUTHORIZED_WHEN_IN_USE' || status == 'authorized_when_in_use') this.dismissAlert1();
        return;
      } else {
        this.dismissAlert1();
        this.presentAlert2();
      }
    },
    async openAlert1() {
      const checkAlert = await alertController.getTop();
      const checkStatus = await Diagnostic.getLocationAuthorizationStatus();

      if (!this.isChecked) {
        if (checkStatus == 'DENIED_ALWAYS' || checkStatus == 'denied_always' || checkStatus == 'RESTRICTED' || checkStatus == 'restricted') {
          this.isChecked = true;
          this.dismissAlert1();
        }
      }

      if (!checkAlert) {
        this.alertApp11 = await alertController.create({
          header: 'Please allow ' + this.companyName + ' to access location services',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                return false;
              },
            },{
              text: 'Allow',
              role: 'confirm',
              handler: () => {
                if (checkStatus == 'DENIED_ALWAYS' || checkStatus == 'denied_always' || checkStatus == 'RESTRICTED' || checkStatus == 'restricted') {
                  NativeSettings.open({
                    optionAndroid: AndroidSettings.ApplicationDetails,
                    optionIOS: IOSSettings.App,
                  });
                } else {
                  Diagnostic.requestLocationAuthorization();
                }
                this.dismissAlert1();
                return false;
              },
            },
          ],
          backdropDismiss: false
        });
        await this.alertApp11.present();
      } else {
        return false;
      }
    },
    async presentAlert1() {
      this.openAlert1();
    },
    async dismissAlert1() {
      const checkAlert = await alertController.getTop();
      if (checkAlert) try { await this.alertApp11.dismiss(); } catch(e) { return false; }
    },
    async openAlert2() {
      const checkAlert = await alertController.getTop();
      if (!checkAlert) {
        this.alertApp22 = await alertController.create({
          header: `Please turn on the location services to continue using ` + this.$compName + ` app`,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                return false;
              },
            },{
              text: 'Turn on',
              role: 'confirm',
              handler: () => {
                NativeSettings.open({
                  optionAndroid: AndroidSettings.Location,
                  optionIOS: IOSSettings.LocationServices,
                });
                return false;
              },
            },
          ],
          backdropDismiss: false
        });
        await this.alertApp22.present();
      } else {
        return false;
      }
    },
    async presentAlert2() {
      this.openAlert2();
    },
    async dismissAlert2() {
      const checkAlert = await alertController.getTop();
      if (checkAlert) try { await this.alertApp22.dismiss(); } catch(e) { return false; }
    },
    async openAlert3() {
      const checkAlert = await alertController.getTop();
      if (!checkAlert) {
        this.alertApp33 = await alertController.create({
          header: `You must have internet connection to continue using ` + this.$compName + ` app`,
          buttons: [
            {
              text: 'OK',
              handler: () => {
                return false;
              },
            }
          ],
          backdropDismiss: false
        });
        await this.alertApp33.present();
      } else {
        return false;
      }
    },
    async presentAlert3() {
      this.openAlert3();
    },
    async dismissAlert3() {
      const checkAlert = await alertController.getTop();
      if (checkAlert) try { await this.alertApp33.dismiss(); } catch(e) { return false; }
    },
    routeChanged(to) {
      if (!lStore.get('user_token')) {
        if (this.loginPaths.includes(to)) return;
        router.push('/login');
      }
    }
  },
  watch: {
    $route(to) {
      this.routeChanged(to.path);
      if (this.loginPaths.includes(to.path) || this.$route.path == '/blocked') return;
      setInterval(() => { 
        if (!Capacitor.isNativePlatform()) return;
        this.locationState();
      }, 1000);
      this.getLocation();
    }
  }
});
</script>
