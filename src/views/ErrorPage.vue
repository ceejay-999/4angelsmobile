<template>
    <ion-page>
      <ion-content>
        <swiper :modules="modules" :autoplay="true" :keyboard="true" :pagination="true" :scrollbar="true" :zoom="true">
          <swiper-slide>
            <div>
              <ion-text color="primary">
                <h2>Maintenance</h2>
              </ion-text>
              <p class="ion-text-wrap">This page is still on development comeback later</p>
            </div>
            <!-- <div class="graphics">
              <img src="../images/welcome_graphics.svg" alt="Welcome"/>
            </div> -->
            <div class="flex">
              <ion-button expand="block" size="large" @click="$router.back()">Go Back</ion-button>
            </div>
          </swiper-slide>
        </swiper>
      </ion-content>
    </ion-page>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  import { Autoplay, Keyboard, Pagination, Scrollbar, Zoom } from 'swiper';
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import { IonContent, IonPage, IonicSlides, IonButton, IonText } from '@ionic/vue';
  import 'swiper/css';
  import 'swiper/css/autoplay';
  import 'swiper/css/keyboard';
  import 'swiper/css/pagination';
  import 'swiper/css/scrollbar';
  import 'swiper/css/zoom';
  import '@ionic/vue/css/ionic-swiper.css';
  
  export default defineComponent({
    name: 'WelcomePage',
    components: { Swiper, SwiperSlide, IonContent, IonPage, IonButton, IonText },
    setup() {
      return {
        modules: [Autoplay, Keyboard, Pagination, Scrollbar, Zoom, IonicSlides],
      };
    },
  });
  </script>
  
  <style scoped>
  ion-content {
      --padding-top: 0;
      --padding-bottom: 0;
      --padding-start: 0;
      --padding-end: 0;
  }
  
  .swiper {
      width: 100%;
      height: 100vh;
      padding: 40px 20px;
  }
  
  .swiper .swiper-slide {
      flex-flow: column;
      justify-content: center;
      align-items: stretch;
  }
  
  ion-text h2 {
      font-size: 2em;
      font-weight: bold;
      color: #1f94db;
      margin: 0 0 10px;
  }
  
  .flex {
      display: flex;
      justify-content: center;
      align-items: center;
  }
  
  ion-button {
    width: 47%;
  }
  
  div p {
      font-size: 16px;
      padding: 0 10vw;
  }
  
  .graphics {
      display: block;
      margin: 30px auto;
  }
  
  .graphics img {
      width: 100% !important;
      height: 50vh !important;
  }
  </style>