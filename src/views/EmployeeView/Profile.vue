<template>
    <ion-page>
        <ion-toolbar class="title-toolbar ion-padding-top ion-padding-bottom">
            <ion-buttons @click="setOpen(true)" class="create-icon2">
                <ion-icon :icon="cloudUpload" slot="start"></ion-icon>
            </ion-buttons>
            <ion-buttons class="create-icon" @click="setOpen2(true)">
                <ion-icon :icon="create" slot="end"></ion-icon>
            </ion-buttons>
            <ion-header>Profile</ion-header>
            <ion-avatar>
                <img :src="user.employee_profilepicture" v-if="user.employee_profilepicture != 'https://www.4angelshc.com/mobile/filesystem/'"/>
                <img src="../../images/profile.svg" v-else/>
                <ion-buttons class="camera-icon">
                    <ion-icon :icon="camera" @click="setProfileImg"></ion-icon>
                </ion-buttons>
                <ion-spinner v-show="loadImageLoader" class="load-img" name="dots"></ion-spinner>
            </ion-avatar>
            <h2 class="title_name">{{ user.employee_firstname }} {{ user.employee_lastname }}<span></span></h2>
        </ion-toolbar>
        <ion-content fullscreen="true">
            <ion-refresher style="position:relative; z-index:999;" slot="fixed" @ionRefresh="handleRefresh($event)">
                <ion-refresher-content refreshing-spinner="crescent"></ion-refresher-content>
            </ion-refresher>
            
            <ion-list class="ion-margin-top">
                <ion-item lines="full">
                    <ion-icon :icon="mail" slot="start" color="medium"></ion-icon>
                    <ion-label position="stacked">Email</ion-label>
                    <ion-input v-model="user.employee_emailaddress" :disabled="true"></ion-input>
                </ion-item>
                <ion-item lines="full">
                    <ion-icon :icon="call" slot="start" color="medium"></ion-icon>
                    <ion-label position="stacked">Phone</ion-label>
                    <ion-input v-model="user.employee_phonenumber" :disabled="true"></ion-input>
                </ion-item>
                <ion-item lines="full">
                    <ion-icon :icon="calendar" slot="start" color="medium"></ion-icon>
                    <ion-label position="stacked">Birthday</ion-label>
                    <ion-input v-model="user.employee_birthday" :disabled="true"></ion-input>
                </ion-item>
                <ion-item lines="full">
                    <ion-icon :icon="briefcase" slot="start" color="medium"></ion-icon>
                    <ion-label position="stacked">Hired Date</ion-label>
                    <ion-input v-model="user.employee_hiredate" :disabled="true"></ion-input>
                </ion-item>
            </ion-list>
            <ion-grid>
                <ion-row>
                    <ion-col size="6" offset="3">
                        <ion-button expand="block" color="dark" @click="presentActionSheet">Logout</ion-button>
                    </ion-col>
                </ion-row>
            </ion-grid>

            <ion-modal :is-open="isOpen">
                <ion-header>
                    <ion-toolbar>
                        <ion-title color="light">UPLOAD FILE</ion-title>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    <div class="file_vwr_ctrl">
                        <button class="bulkSelect"  :class="{active:bulkSelect}" @click="bulkSelect = !bulkSelect;chosenFile=[]">Bulk Select: {{bulkSelect ? 'On': 'Off'}}</button>
                        <button class="delete" @click="deleteSelected" v-if="chosenFile.length>0">Delete</button> 
                        <a :href="this.cifile+this.user.employee_id+'/'+chosenFile[0]" download="true" v-if="!bulkSelect && chosenFile.length == 1">Download</a>
                    </div>
                    <div class="file_vwr">
                        <div class="file_itm" v-for="f in files" :key="f" @click="addToChosen(f)">
                            <div class="file_disp">
                                <img class="selectInd" src="../../images/check-icon.svg" :class="{selected:chosenFile.includes(f)}">
                                <img :src="path+'/'+f" v-if="fileType(f) == 'image'">
                                <img class="fileicon" src="../../images/file-icon.svg" v-if="fileType(f) == 'document'">
                            </div>
                            <p>{{f}}</p>
                        </div>
                        <div class="file_itm uploading" v-for="f,i in uploading" :key="i">
                            <label for="uploadFile">
                            <div class="file_disp" >
                                <img class="fileicon" src="../../images/file-icon.svg">
                            </div>
                            </label>
                            <input type="file" id="uploadFile" hidden @change="uploadFile">
                            <p>[Uploading] {{i}}</p>
                        </div>

                        <div class="file_itm upload">
                            <label for="uploadFile">
                            <div class="file_disp">
                                <img class="fileicon" src="../../images/upload-icon.svg" :class="{selected:chosenFile.includes(f)}">
                            </div>
                            </label>
                            <input type="file" id="uploadFile" hidden @change="uploadFile">
                            <p>Add File</p>
                        </div>
                    </div>
                    <button class="file_vwr_close" @click="setOpen(false)">Close</button>
                </ion-content>
            </ion-modal>

            <ion-modal :is-open="isOpen2">
                <ion-header>
                    <ion-toolbar>
                        <ion-title color="light">UPDATE PROFILE</ion-title>
                    </ion-toolbar>
                </ion-header>
                <ion-content class="ion-padding">
                    <ion-list>
                        <ion-item>
                            <ion-label position="stacked">Firstname</ion-label>
                            <ion-input v-model="user.employee_firstname"></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-label position="stacked">Lastname</ion-label>
                            <ion-input v-model="user.employee_lastname"></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-label position="stacked">Email</ion-label>
                            <ion-input v-model="user.employee_emailaddress"></ion-input>
                        </ion-item>
                        <ion-item>
                            <ion-label position="stacked">Phone</ion-label>
                            <ion-input v-model="user.employee_phonenumber"></ion-input>
                        </ion-item>
                    </ion-list>
                    <ion-grid>
                        <ion-row>
                            <ion-col size="6">
                                <ion-button class="ion-margin-bottom" expand="block" color="primary" @click="setOpen2(false); updateProfile()">Update</ion-button>
                            </ion-col>
                            <ion-col size="6">
                                <ion-button expand="block" color="dark" @click="setOpen2(false)">Close</ion-button>
                            </ion-col>
                        </ion-row>
                    </ion-grid>
                </ion-content>
            </ion-modal>

        </ion-content>
    </ion-page>
</template>

<script>
import { defineComponent } from 'vue';
import axiosA from 'axios';
import { IonContent, IonPage, IonAvatar, IonItem, IonIcon, IonLabel, IonButtons, actionSheetController, loadingController, IonToolbar, IonList, IonCol, IonRow, IonGrid, IonHeader, IonModal, IonInput,IonRefresher, IonRefresherContent, IonButton, IonTitle, IonSpinner } from '@ionic/vue';
import { mail, call, location, create, camera, cloudUpload, briefcase, calendar } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { lStore, axios, ImageDataConverter, openToast} from '@/functions';
import router from '@/router';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
defineCustomElements(window);

export default defineComponent({
    name: 'EmployeeProfile',
    components: { IonContent, IonPage, IonAvatar, IonItem, IonIcon, IonLabel, IonButtons, IonToolbar, IonList, IonCol, IonRow, IonGrid, IonHeader, IonModal, IonInput,IonRefresher, IonRefresherContent, IonButton, IonTitle, IonSpinner  },
    setup() {
        return { mail, call, location, create, camera, cloudUpload, briefcase, calendar };
    },
    data() {
        return {
            user: {},
            isOpen: false,
            cifile: 'https://www.4angelshc.com/mobile/filesystem/',
            path:'',
            relativePath:'',
            files:[],
            chosenFile:[],
            bulkSelect:false,
            uploading:{},
            isOpen2: false,
            loadImage: false,
            loadImageLoader: false
        }
    },
    created() {
        this.user = lStore.get('user_info');
        console.log(this.user.employee_profilepicture);
        this.path = this.cifile+this.user.employee_id;
        this.relativePath = this.user.employee_id;
        axios.post('files?path='+this.relativePath).then(res=>{
            this.files = res.data;
        });
    },
    methods: {
        handleRefresh(event){
            this.user = lStore.get('user_info');
            setTimeout(() => {
                event.target.complete();
            }, 2000);
        },
        setOpen(isOpen) {
            this.isOpen = isOpen;
        },
        setOpen2(isOpen2) {
            this.isOpen2 = isOpen2;
        },
        updateProfile() {
            axios.post('employee/update?id='+lStore.get('user_id'),null, this.user).then(res => {
                if(!res.data.success) return;
                openToast('Profile Information Updated!', 'light');
                setTimeout(() => {
                    lStore.set('user_info',this.user);
                    window.location.reload();
                }, 2000)
            });
        },
        fileType(filename){
            if(typeof filename != 'string') return; 
            let fileSplit = filename.toLowerCase().split('.');
            let ext = fileSplit[fileSplit.length - 1];
            let image = ['gif','png','jpg','jpeg'];
            let video = ['mp4','webm','ogv'];
            let doc = ['doc','docx','xls','xlsx','csv','pdf'];
            if(image.includes(ext)) return 'image'; 
            if(video.includes(ext)) return 'video';
            if(doc.includes(ext)) return 'document';
            return '';
        },
        async openLoader() {
            const loading = await loadingController.create({
                message: 'Logging Out...',
                cssClass: 'custom-loading'
            });
            return loading.present();
        },
        async openActionSheet() {
            const openSheet = await actionSheetController.create({
                header: 'Are you sure you want to log out?',
                buttons: [
                    {
                        text: 'Log Out',
                        role: 'destructive',
                        handler: () => {
                            this.openLoader().then(()=>{
                                this.logout();
                            });
                        },
                    },
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        data: {
                            action: 'cancel',
                        },
                    },
                ],
            });
            return openSheet.present();
        },
        async presentActionSheet() {
            this.openActionSheet();
        },
        logout() {
            loadingController.dismiss();
            localStorage.clear();
            router.push('/login');
            window.location.reload();
        },
        addToChosen(f){
            if(this.bulkSelect) {
                if(!this.chosenFile.includes(f)) this.chosenFile.push(f);
                else this.chosenFile.splice(this.chosenFile.indexOf(f),1);
            }
            else {
                if(this.chosenFile[0] != f) this.chosenFile[0] = f;
                else this.chosenFile.splice(0,1);
            }
        },
        uploadFile(e){
            let file = e.target.files[0];
            this.uploading[file.name] = 0;
            axios.post('files/upload?path='+this.relativePath+'&type='+this.fileType(file.name),null,{file},{
                onUploadProgress:progressEvent =>{
                    let uploadProgress = (progressEvent.loaded / file.size) * 100;
                    this.uploading[file.name] = uploadProgress.toFixed(2);
                }
            }).then(res=>{
                if(res.data.success === false) alert(res.data.msg)
                delete this.uploading[file.name];
                this.files.push(res.data.file_name);
            });
        },
        deleteSelected(){
            if(this.chosenFile.length == 0) {alert('No file selected');return;}
            let toDelete = [];
            this.chosenFile.forEach(el=>{
                axios.post('files/delete?path='+this.relativePath+'/'+el);
                toDelete.push(el);
            });

            for(let i = 0; i < toDelete.length; i++){
                this.files.splice(this.files.indexOf(toDelete[i]),1);
            }
            
            this.chosenFile = [];
        },
        async setProfileImg(){
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                source: CameraSource.Prompt,
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
                    this.loadImageLoader = true;
                    axiosA({
                        method:'post',
                        url: 'https://4angelshc.com/mobile/employee/update?id='+lStore.get('user_id'),
                        data : form
                    }).then(()=>{
                        let userFromLStore = lStore.get('user_info')
                        userFromLStore.employee_profilepicture = image.dataUrl;
                        lStore.set('user_info', userFromLStore);
                        window.location.reload();
                    })
                }
            });
        }
    }
});
</script>

<style scoped>

ion-item ion-icon {
    font-size: 22px;
}

.load-img{position: absolute; left: 0; right: 0; text-align: center; margin: 0 auto; top: 50px; color: #000;}

.load-img::before{
    content: '';
    background: #fff;
    width: 104px;
    height: 104px;
    position: absolute;
    top: -42px;
    left: -38px;
    opacity: 0.5;
    border-radius: 70px;
}

.close_icon {
    position: absolute;
    top: 35px;
    z-index: 1;
    right: 25px;
    font-size: 25px;
}

ion-card {
    border: 2px dashed #b0b0b0;
    padding: 20px;
}

ion-toolbar {
    min-height: 0;
}

ion-title {
    font-size: 18px;
}
ion-header {
    box-shadow: none; 
    text-align: center; 
    font-size: 20px;
}

ion-avatar {
    width: 120px;
    height: auto;
    position: relative;
    margin: 20px auto 0;
    text-align: center;
}

ion-avatar img {
    width: 100%;
    max-width: 220px;
    height: 100%;
    padding: 3px;
    border: 5px solid #fff;
}

ion-content {
    text-align: center;
}

ion-content h2 {
    font-size: 26px;
    font-weight: bold;
    color: #1f94db;
    text-align: center;
    margin: 24px 0 30px;
}

.title_name {
    text-align: center;
    margin-top: 8px;
    font-size: 20px;
}

.title_name span {
    display: block;
    font-size: 14px;
    color: #fff;
}

ion-list {
    background: none;
    margin-bottom: 30px;
}

ion-item {
    --background: none;
    padding: 12px 0 !important;
    margin-bottom: 6px;
    border-radius: 4px;
}

ion-row {
    background: none;
}

.create-icon {
    position: absolute;
    top: 34px;
    right: 12px;
    font-size: 25px;
    color: #fff;
    display: block;
}

.create-icon2 {
    position: absolute;
    top: 38px;
    left: 12px;
    font-size: 25px;
    color: #fff;
    display: block;
}

.camera-icon {
    position: absolute;
    bottom: 0;
    font-size: 20px;
    color: #fff;
    display: block;
    right: 0;
}

ion-toolbar {
    color: #fff;
}

.title-toolbar {
    background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(58,174,245,1) 30%, rgba(20,139,210,1) 65%); 
    border-radius: 0 0 25px 25px;
}

.file_vwr_ctrl{padding: 10px;}
.file_vwr_ctrl button,.file_vwr_ctrl a{padding: 5px;margin: 3px;border-radius: 5px;transition:0.2s;display: inline-block;}
.file_vwr_ctrl .bulkSelect{color: #2095db;background: #fff;border: 1px solid #2095db;}
.file_vwr_ctrl .bulkSelect.active, .file_vwr_ctrl .bulkSelect:active{background: #2095db;color:#fff;font-size: 14px;}
.file_vwr_ctrl .delete{background: #85382a;color:#fff}
.file_vwr_ctrl .delete:active{background: #492019;color:#fff}
.file_vwr_ctrl a{text-decoration: none;color: #fff;background: #3c8839;font-weight: 400;font-size: 13px;}
.file_vwr_ctrl a:active{background: #244223;}

.file_vwr{display: flex;justify-content: flex-start;gap:5px;flex-wrap: wrap;}
.file_itm{width: 24%;background: #fff;padding: 5px;border:1px solid #ddd;border-radius: 5px;overflow: hidden;transition: 0.2s;}
.file_itm:active{transform: scale(0.9);}
.file_disp{border-radius: 5px;overflow: hidden;aspect-ratio: 1/1;position: relative;border:1px solid #ddd;}
.file_disp img:not(.fileicon):not(.selectInd){object-fit: cover;width: 100%;height: 100%;}
.file_disp .selectInd{opacity: 0;transition:0.2s;position: absolute;z-index: 2;background: rgba(0, 0, 0, 0.5);padding: 28%;transform: none;left: 0;}
.file_disp .selectInd.selected{opacity: 1;}
.file_disp .fileicon{width: 30px;height: 30px;position: absolute;left: 50%;top: 50%;transform: translateX(-50%) translateY(-50%);}
.file_itm p{margin: 10px 0;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;}
.file_itm.upload .file_disp{border:none}
.file_itm.upload{border: 2px dashed #2095db;}
.uploading .file_disp .fileicon{animation-name:uploading;animation-duration: 2s;animation-iteration-count: infinite;}
.file_vwr_close{margin-top: 20px;padding: 10px;width: 100px;background: #bb4a36;border-radius: 5px;}
.file_vwr_close:active{background: #7c3225;}
ion-avatar img{aspect-ratio: 1/1;}


@media only screen and (max-width:500px){
    .file_itm{width: 31%;}
}

@keyframes uploading{
    0%{transform: translateX(-50%) translateY(-50%);}
    49%{transform: translateX(-50%) translateY(-500%);}
    50%{transform: translateX(-50%) translateY(450%);}
    0%{transform: translateX(-50%) translateY(-50%);}
}

</style>