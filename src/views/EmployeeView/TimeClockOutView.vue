<template>
    <ion-page>
         <BackButton :showButton = false bgColor="#FFF" :toggleHidden = true ></BackButton>
         <ion-header class="ion-head">
         </ion-header>
         <ion-content fullscreen="true" id="main-content" scroll-events="true">
             <ion-text class="ion-padding-start ion-margin-top" color="primary">You will clockout at {{ timers }} on facility  {{ readytoclockoutsched.facility_name }} {{ new Date(readytoclockoutsched.schedules_dates+' '+readytoclockoutsched.schedules_timestart).toLocaleTimeString() }} - {{ new Date(readytoclockoutsched.schedules_dates+' '+readytoclockoutsched.schedules_timeend).toLocaleTimeString() }}</ion-text>
             <div class="avatar_wrap">
                 <p>Please provide a selfie</p>
                 <img :src="readytoclockoutsched.assignschedules_clockoutselfie" v-if="readytoclockoutsched.assignschedules_clockoutselfie != 'https://www.4angelshc.com/mobile/filesystem/' && readytoclockoutsched.assignschedules_clockoutselfie != null"/>
                 <img src="../../images/profile.svg" v-else/>
                 <ion-buttons class="camera-icon">
                     <ion-icon :icon="camera" @click="setProfileImg"></ion-icon>
                 </ion-buttons>
                 <ion-button @click="ClockOut">Continue &raquo;</ion-button>
             </div>
         </ion-content>
     </ion-page>
 </template>
 <script>
 import { defineComponent } from 'vue';
 import { IonContent, IonPage, IonHeader, IonText,IonIcon,IonButtons,IonButton,actionSheetController } from '@ionic/vue';
 import { apps, map, chatbox, settings, ticket, helpCircle, logOut, alertCircle, warning, menu, reader, checkmarkCircle, location, time, calendar, calendarClear, navigate, person, timerOutline,camera } from 'ionicons/icons';
 import { lStore, axios, formatDateString,ImageDataConverter,openToast,calcFlyDist } from '@/functions';
 import axiosA from 'axios';
 import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
 import BackButton from '@/views/BackButton';
 import { defineCustomElements } from '@ionic/pwa-elements/loader';
 import { Geolocation } from '@capacitor/geolocation';
 defineCustomElements(window);
 
 
 export default defineComponent({
     name: 'DashboardView',
     components: { IonContent, IonPage, IonHeader, IonText,BackButton,IonIcon,IonButtons,IonButton },
     setup() {
         const logScrolling = (e) => {
             if (e.detail.scrollTop >= 20) {
                 document.querySelector('.ion-head').classList.add('ion-head-style');
             } else {
                 document.querySelector('.ion-head').classList.remove('ion-head-style');
             }
         }
         return { camera,apps, map, chatbox, settings, ticket, helpCircle, logOut, alertCircle, menu, warning, logScrolling, reader,timerOutline, checkmarkCircle, location, time, calendar, calendarClear, navigate, person };
     },
     data() {
         return{
             readytoclockoutsched: {},
             timers: lStore.get('timeOut'),
         }
     },
     created() {
         
         let currentDate = new Date();
         let currentDateString = currentDate.toLocaleDateString().split('/');
         currentDateString = formatDateString(currentDateString[2] + '-' + currentDateString[0] + '-' + currentDateString[1]).replaceAll(' ','');
         let weekDate = new Date();
         weekDate.setDate(weekDate.getDate()+7);
         weekDate = weekDate.toLocaleDateString();
         let weekDateArr = weekDate.split('/');
         let weekDateString = formatDateString(weekDateArr[2]+'-'+weekDateArr[0]+'-'+weekDateArr[1]).replaceAll(' ','');
         axios.post(`schedule?_joins=assignschedules,assigndesignation,facility,role&_on=assignschedules_scheduleid=schedules_id,assigndesignation_id=assignschedules_assigndesignationid,schedules_facilityid=facility_id,role_id=assigndesignation_roleid&_GTE_schedules_dates=${currentDateString}&_LSE_schedules_dates=${weekDateString}&_batch=true&schedules_id=${lStore.get('scheduleclockoutid')}&_orderby=dates,schedules__timestart_ASC`).then(res=>{
             if(res.data.result == null)
             {
                 return;
             }
             res.data.result.forEach(element => {
                 this.readytoclockoutsched = element;
             });
         });
     },
     methods: {
         async setProfileImg(){
             const image = await Camera.getPhoto({
                 quality: 90,
                 allowEditing: true,
                 source: CameraSource.Camera,
                 resultType: CameraResultType.DataUrl
             });
 
             let blobObj = new ImageDataConverter(image.dataUrl);
             let blob = blobObj.dataURItoBlob()
             let form = new FormData();
             form.append('file',blob,'file.'+blobObj.getMimeString().replace(/\w+\//g,''));
 
             let action = await actionSheetController.create({
                 header: 'Confirm Image?',
                 buttons: [
                     {
                         text: 'Confirm',
                         data: {
                             action: 'confirm',
                         },
                     },
                     {
                         text: 'Choose Another',
                         data: {
                             action: 'redo',
                         },
                     },
                     {
                         text: 'Cancel',
                         role: 'cancel',
                         data: {
                             action: 'cancel',
                         },
                     }
                 ]
             })
 
             await action.present();
 
             action.onDidDismiss().then(res=>{
                 if(res.data == null) return;
                 if(res.data.action == 'cancel') return;
                 if(res.data.action == 'redo') {
                     this.setProfileImg();
                     return;
                 }
                 if(res.data.action == 'confirm') {
                     openToast('Saving Image', 'tertiary')
                     axiosA({
                         method:'post',
                         url: 'https://4angelshc.com/mobile/assign/updates?id='+this.readytoclockoutsched.assignschedules_id,
                         data : form
                     }).then(()=>{
                         this.loadImage = true;
                         let userFromLStore = this.readytoclockoutsched;
                         userFromLStore.assignschedules_clockoutselfie = image.dataUrl;
                         openToast('Successfully Added Image', 'primary')
                         // setTimeout(()=>{
                         //     this.$router.go(0);
                         // },2000);
                     })
                 }
 
             });
 
             
         },
         async ClockOut()
         {
             if(this.readytoclockoutsched.assignschedules_clockoutselfie == 'https://www.4angelshc.com/mobile/filesystem/' || this.readytoclockoutsched.assignschedules_clockoutselfie == null || this.readytoclockoutsched.assignschedules_clockoutselfie == '')
             {
                 openToast('Please provide a Clockout selfie', 'danger');
                 return;
             }
             else{
                 const coordinates = await Geolocation.getCurrentPosition({enableHighAccuracy:true});
                 if(calcFlyDist([this.readytoclockoutsched.facility_location_long,this.readytoclockoutsched.facility_location_lat],[coordinates.coords.longitude,coordinates.coords.latitude]) <= 0.2)
                 {

                        let ClockinTime = new Date().toLocaleTimeString('zh-Hans-CN');
                        console.log(ClockinTime);
                        axios.post('assign/update?id='+this.readytoclockoutsched.assignschedules_id,null,{ assignschedules_timeout: ClockinTime, assignschedules_status: 1,assignschedules_timeoutlocationname: await this.mapFind(coordinates.coords.longitude,coordinates.coords.latitude), assignschedules_timeoutlong: coordinates.coords.longitude, assignschedules_timeoutlat: coordinates.coords.latitude}).then(()=>{
                            openToast('Successfully Clockout', 'primary')
                        })
                        setTimeout(()=>{
                            this.$router.push('employee/dashboard');
                        },3000);
                    
                 }
                 else
                 {
                     openToast('You need to be near on the facility to clockout', 'danger');
                     return;
                 }
             }
         },
         async mapFind(long,lat){
             let accessToken = "pk.eyJ1Ijoic3BlZWR5cmVwYWlyIiwiYSI6ImNsNWg4cGlzaDA3NTYzZHFxdm1iMTJ2cWQifQ.j_XBhRHLg-CcGzah7uepMA";
             let returnVal = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${long},${lat}.json?access_token=${accessToken}`)
             return returnVal.data.features[0].place_name;
         },
     }
 });
 </script>
 
 <style scoped>
 .mt{
     margin-top: 15px;
 }
 .item.sc-ion-label-ios-h, .item .sc-ion-label-ios-h{white-space: unset;}
 
 .noData{text-align: center; color: #959595; font-weight: bold;}
 
 .disabled2,.disabled{pointer-events: none;}
 .today {display: none;}
 .upcoming {display: none;}
 
 ion-menu ion-content {
     background: #fff;
     --background: #fff;
     --padding-top: 20px;
     --padding-bottom: 60px;
     --padding-start: 0;
     --padding-end: 0;
     --inner-padding-start: 0;
     --inner-padding-end: 0;
 }
 
 ion-label h1{color: #555;margin-bottom: 9px; border-left: 12px groove #1f94db; padding-left: 6px; text-transform: capitalize;font-size: 18px !important;}
 
 ion-item{margin-top: 15px;}
 
 ion-item p strong{color: #999;}
 
 .ion-head-style {
     background: linear-gradient(to top, #fff, #6cbcf0);
     padding-bottom: 10px;
 }
 
 ion-menu ion-list {
     padding: 0;
 }
 
 ion-menu ion-content ion-item ion-label {
     margin: 0;
 }
 
 ion-menu ion-content ion-item ion-button {
     width: 100%;
     margin: auto;
 }
 
 ion-header {
     z-index: 999;
 }
 
 ion-header {
     box-shadow: none;
 }
 
 ion-header::after {
     display: none;
 }
 
 ion-card {
     margin: 24px auto;
 }
 
 ion-card-title {
     font-size: 15px;
     margin: 6px auto 4px;
     color: #1f94db;
 }
 
 ion-text {
     font-size: 24px;
     display: block;
     text-align: center;
     padding: 0;
 }
 
 ion-text p {
     font-size: 50px;
 }
 
 .main-header {
     position: relative;
     z-index: 2;
 }
 
 .sub-header {
     position: relative;
     top: 0;
     --padding-top: 0;
     transition: top ease-in-out 500ms;
     z-index: 1;
     border-radius: 0 0 30px 30px;
 }
 
 .sub-header ion-card {
     margin: 0 auto 8px; 
     padding: 15px 0;
     border-radius: 25px;
 }
 
 .sub-header.hidden {
     top: -200px;
 }
 
 ion-header {
     box-shadow: none;
 }
 
 ion-header::after {
     display: none;
 }
 
 ion-text h3 {
     font-size: 18px;
     margin: 0;
 }
 
 ion-item p {
     color: #1f94db;
     font-weight: bold;
 }
 
 ion-item p span {
     display: block;
     color: #999999;
     margin-top: 2px;
     font-weight: normal;
 }
 
 ion-list {
     border-radius: 12px;
 }
 
 .approved {
     font-size: 13px;
     font-weight: bold;
     color: #999;
 }
 
 .approved ion-icon {
     position: relative;
     top: 2px;
     left: 1px;
 }
 
 ion-toolbar p {
     margin: 4px 0 0;
     font-size: 12px;
     color: #fff;
 }
 
 ion-title {
     color: #fff;
 }
 
 .avatar_wrap {
     position: relative;
 }
 
 .avatar_wrap p {
     text-align: center;
     color: #555;
     margin: 30px 0 15px;
 }
 
 .avatar_wrap img {
     width: 200px;
     margin: 0 auto;
     display: block;
 }
 
 .avatar_wrap ion-icon {
     position: absolute;
     right: 85px;
     bottom: 0;
     font-size: 25px;
 }
 
 .avatar_wrap ion-button {
     margin: 25px auto 0;
     text-align: center;
     display: block;
     width: 150px;
     max-width: 100%;
 }
 
 
 </style>