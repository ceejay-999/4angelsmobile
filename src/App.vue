<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script>
import { defineComponent } from 'vue';
import { IonApp, IonRouterOutlet, alertController } from '@ionic/vue';
import { Network } from '@capacitor/network';

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
  mounted() {
    Network.addListener('networkStatusChange', status => {
      if (status.connected == false && status.connectionType == 'none') this.presentAlert3();
      if (status.connected == false && status.connectionType == 'unknown') this.presentAlert3();
      if (status.connected == true && status.connectionType == 'wifi' || status.connectionType == 'cellular') this.dismissAlert3();
    });
  },
  methods: {
    async openAlert3() {
      const checkAlert = await alertController.getTop();
      if (!checkAlert) {
        this.alert3 = await alertController.create({
          header: `You must have internet connection to continue using ` + this.companyName + ` app`,
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
        await this.alert3.present();
      } else {
        return false;
      }
    },
    async presentAlert3() {
      this.openAlert3();
    },
    async dismissAlert3() {
      const checkAlert = await alertController.getTop();
      if (checkAlert) await this.alert3.dismiss();
    },
  }
});
</script>
