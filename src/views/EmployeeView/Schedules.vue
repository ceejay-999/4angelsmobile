<template>
    <ion-page>
        <div class="Schedule_modal" :class="{openModal:openModal}">
            <div class="Schedule_modal_box">
                <h2>{{openedSchedule.role_name}}</h2>
                <div class="grid">
                    <p>Schedule ID:</p><div><span>{{openedSchedule.schedules_id}}</span></div>
                    <p>Schedule Date:</p><div><span>{{dateFormat('%lm %d, %y','2022-01-01 '+openedSchedule.schedules_dates)}}</span></div>
                    <p>Schedule Start:</p><div><span>{{dateFormat('%h:%i%a','2022-01-01 '+openedSchedule.schedules_timestart)}}</span></div>
                    <p>Schedule End:</p><div><span>{{dateFormat('%h:%i%a','2022-01-01 '+openedSchedule.schedules_timeend)}}</span></div>
                    <p>Branch:</p><div><span>{{openedSchedule.facility_name}}</span></div>
                    <p>Branch Location:</p><div><span>{{openedSchedule.facility_location}}</span></div>
                    <p>Description:</p><div><span>{{openedSchedule.schedules_description}}</span></div>
                    <p v-if="scheduleShowStatus(openedSchedule) != false">Status:</p><div><span>{{scheduleShowStatus(openedSchedule)[1]}}</span></div>
                </div>

                <ion-button expand="block" @click="openModal=false">Close</ion-button>
            </div>
        </div>

        <div class="request_change_modal" :class="{openModal:openModal}">

        </div>

        <ion-header class="header" no-border collapse="fade">
            
            <ion-toolbar class="main-header">
                <ion-buttons slot="end">
                    <ion-avatar @click="$router.push('/employee/profile')">
                        <img :src="user.employee_profilepicture"/>
                    </ion-avatar>
                </ion-buttons>
                <ion-title>Schedules</ion-title>
            </ion-toolbar>
            <ion-toolbar class="sub-header sub-header2 ion-padding-bottom">
                <ion-datetime @ionChange="setDate" presentation="date"></ion-datetime>
            </ion-toolbar>
        </ion-header>
        <ion-content fullscreen="true">
            <ion-refresher style="position:relative; z-index:999;" slot="fixed" @ionRefresh="handleRefresh($event)">
                <ion-refresher-content refreshing-spinner="crescent"></ion-refresher-content>
            </ion-refresher>

            <div class="noData" v-if="schedulesToday == ''">
                <img src="@/images/noData.svg" alt="No Data">
            </div>

            <ion-list class="ion-margin-top" v-for="st in schedulesToday" :key="st.id">
                <ion-item button lines="none" @click="openActionSheet(st.schedules_id)" :style="'border-left: 6px solid '+st.role_color">
                    <ion-label>
                        <h2>{{st.role_name}}
                        </h2>
                        <p>Start Time: {{dateFormat('%h:%i%a',selectedDate+' '+st.schedules_timestart)}}</p>
                        <p>End Time: {{dateFormat('%h:%i%a',selectedDate+' '+st.schedules_timeend)}}</p>
                        <p>Date: {{dateFormat('%lm %d, %y',st.schedules_dates)}}</p>
                        <small class="schedStatus" v-if="scheduleShowStatus(st) != false">
                            <ion-icon :icon="scheduleShowStatus(st)[0]"></ion-icon>
                            {{scheduleShowStatus(st)[1]}}
                        </small>
                    </ion-label>
                </ion-item>
            </ion-list>

        </ion-content>
    </ion-page>
</template>

<script>
import { defineComponent } from 'vue';
import { IonContent, IonPage, IonHeader, IonToolbar, IonDatetime, IonIcon,actionSheetController, IonTitle, IonButtons, IonRefresher, IonRefresherContent, IonButton, IonAvatar, IonLabel, IonItem, IonList } from '@ionic/vue';
import { stopwatch, calendar, checkmarkDoneCircle, clipboard} from 'ionicons/icons';
import { axios, lStore,dateFormat, openToast } from '@/functions';

export default defineComponent({
    name: 'SchedulesView',
    components: { IonIcon,IonContent, IonPage, IonHeader, IonToolbar, IonDatetime, IonTitle, IonButtons, IonRefresher, IonRefresherContent, IonButton, IonAvatar, IonLabel, IonItem, IonList },
    setup() {
        const logScrolling2 = (e) => {
            if (e.detail.scrollTop >= 50) {
                document.querySelector('ion-header').classList.add('hidden');
                document.querySelector('.sub-header2').classList.add('hidden');
            } else {                                                                                
                document.querySelector('ion-header').classList.remove('hidden');
                document.querySelector('.sub-header2').classList.remove('hidden');
            }
        }
        return { logScrolling2 };
    },
    data() {
        return{
            formLoading1: false,
            task: null,
            message: null,
            schedulesToday:[],
            takenSchedulesToday: [],
            noProfilePic: false,
            selectedDate:'2022-01-01',
            user: {},
            facility: '',
            getMonthToday: '',
            isOpen: false,
            openModal: false,
            openedSchedule:{},
            allowedRoles:{},

            stopwatch, calendar, checkmarkDoneCircle, clipboard
        }
    },
    created() {
        this.user = lStore.get('user_info');
    },
    mounted() {
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        let month = months[new Date().getMonth()].toUpperCase();
        this.getMonthToday = month;


        
        let date = new Date().toLocaleDateString();
        date = date.split('/')[2]+'-'+date.split('/')[0]+'-'+date.split('/')[1];
        this.selectedDate = date;

        this.allowedRoles = {};

        axios.post(`UserDesignations?_batch=true&assigndesignation_employeeid=${lStore.get('user_info').employee_id}`).then(res=>{
            res.data.result.forEach(el=>{
                this.allowedRoles[el.assigndesignation_facilityid] = el;
            })
        });

        let selectedDate = new Date().toLocaleDateString('zh-Hans-CN',{
                year:'numeric',
                month:'2-digit',
                day: '2-digit'
            }).replaceAll('/','-');
            


        this.setDate(selectedDate);
    },
    methods: {
        dateFormat,
        scheduleShowStatus(sched){
            if(sched.assignschedules_id == null) return false;
            if(sched.assignschedules_timeout != null) return [this.checkmarkDoneCircle,'Completed'];
            else if(sched.assignschedules_timein != null) return [this.stopwatch,'In progress'];
            else if(sched.assignschedules_status != 10) return [this.calendar,'Assigned'];
            else if(sched.assignschedules_status == 10) return [this.clipboard,'Applied'];
        },
        async openActionSheet(id) {
            let selectedSched = this.schedulesToday.filter(el=>el.schedules_id == id);
            selectedSched = selectedSched[0];
            let actionSheetButtons = [
                {
                    text: 'View Schedule Details',
                    data: {
                        action: 'view',
                    },
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    data: {
                        action: 'cancel',
                    },
                }
            ];

            if(!this.hasApplied(selectedSched)){
                actionSheetButtons.push({
                    text: 'Apply Shift',
                    data: {
                        action: 'apply',
                    }
                });
            }
            // else{
            //     actionSheetButtons.push({
            //         text: 'Request Change',
            //         data: {
            //             action: 'request change',
            //         }
            //     });
            // }

            const openSheet = await actionSheetController.create({
                header: 'Schedule Action',
                buttons: actionSheetButtons,
            });

            await openSheet.present();
            openSheet.onDidDismiss().then(res=>{
                if(res.data == null) return;
                if(res.data.action == 'cancel') return;
                if(res.data.action == 'apply') {
                    let schedStart = new Date(selectedSched.schedules_dates+' '+selectedSched.schedules_timestart);
                    let curDateTime = new Date();
                    console.log(schedStart,curDateTime,curDateTime.getTime() >= schedStart.getTime());
                    if(curDateTime.getTime() >= schedStart.getTime()) {
                        openToast('You cannot apply for a schedule that\'s already finished!','warning');
                        return;
                    }

                    axios.post('Assign/create',null,{
                        assignschedules_assigndesignationid: this.allowedRoles[selectedSched.schedules_facilityid].assigndesignation_id,
                        assignschedules_scheduleid: selectedSched.schedules_id,
                        assignschedules_status: 10
                    }).then(()=>{
                        window.location.reload();
                    })
                    
                }else if(res.data.action == 'view'){
                    this.openedSchedule = selectedSched;
                    this.openModal = true;
                }
            });

        },
        setOpen() {
            this.isOpen = true;
        },
        hasApplied(sched){
            return sched.assignschedules_id != null
        },
        handleRefresh(e){
            this.setDate(this.selectedDate);
            setTimeout(() => {
                e.target.complete();
            }, 2000);
        },
        setDate(e){
            let date = e;
            if(e.target != null){
                date = e.target.value.match(/^[0-9]+-[0-9]+-[0-9]+/)[0];
                this.selectedDate = date;
            }
            
            let selectedDate = new Date(date).toLocaleDateString('zh-Hans-CN',{
                year:'numeric',
                month:'2-digit',
                day: '2-digit'
            }).replaceAll('/','-');
            
            
            axios.post(`Schedule/joint?schedules_dates=${selectedDate}&_batch=true`).then(res=>{
                if(res.data.result == null) {
                    this.schedulesToday = [];
                    return;
                }
                this.schedulesToday = [];
                res.data.result.forEach(el=>{
                    if(el.assignedEmps.length > 0) el = {...el,...el.assignedEmps[0]};
                    delete el.assignedEmps;
                    if(this.allowedRoles[el.schedules_facilityid] == null) return false;
                    if(this.allowedRoles[el.schedules_facilityid].assigndesignation_roleid != el.schedules_roleid) return;
                    this.schedulesToday.push(el)
                });

                this.schedulesToday = this.schedulesToday.sort((a,b)=>{
                    let timeA = new Date(a.schedules_dates+' '+a.schedules_timestart).getTime();
                    let timeB = new Date(b.schedules_dates+' '+b.schedules_timestart).getTime();
                    return timeA - timeB;
                });
            })
        }
    }
});
</script>

<style scoped>

.page-title{text-align: center; font-weight: bold; font-size: 20px; margin: 0 0 12px;}

.noData{width: 230px; max-width: 100%; margin: 30px auto 0;}

ion-menu ion-content ion-item ion-label {
    margin: 0;
}

ion-menu ion-content ion-item ion-button {
    width: 100%;
    margin: auto;
}

ion-avatar img {
    padding: 3px;
    border: 3px solid #fff;
}

ion-header {
    z-index: 200;
}

ion-header.hidden {
	max-height: 104px;
	margin-bottom: 104px;
}

.ios ion-header.hidden {
	max-height: 88px;
	margin-bottom: 88px;
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
}

.sub-header ion-card {
    margin: 0 auto 8px; 
    padding: 15px 0;
    border-radius: 25px;
}

.sub-header.hidden {
    top: -250px;
}

ion-header {
    box-shadow: none;
}

ion-header::after {
    display: none;
}

ion-datetime {
    min-height: 0 !important;
}

ion-title {
    --text-align: left !important; 
    font-size: 21px; 
    --padding: 0 !important;
}

ion-title span {
    display: block;
    color: #1f94db;
    font-weight: bold;
}

ion-text h3 {
    font-size: 18px;
    margin: 0;
}

ion-card {
    margin: 24px auto;
}

ion-card img {
    display: table;
    width: 100%;
    max-width: 200px;
    height: 100%;
    object-fit: contain;
    margin: auto;
}

ion-card-subtitle {
    color: #1f94db;
    font-weight: bold;
}

ion-col h2 {
    font-size: 17px; 
    padding-left: 14px;
}

ion-col h2 {
    font-size: 15px;
    padding-left: 14px;
    color: #4daca8;
    font-weight: 600;
}

ion-col h2 span {
    display: block;
}

ion-col h2 small {
    font-size: 10px;
}

ion-list ion-item {
    border: 1px solid #ddd;
    border-left: 6px solid #999999;
    margin-bottom: 6px;
}

ion-list ion-item:nth-child(even) {
    border-left: 6px solid #1f94db  ;
}

ion-toolbar ion-text {
    text-align: center;
    display: block;
    margin: 0 auto;
}

ion-text h2 {
    font-size: 17px; 
    padding-left: 14px;
}

ion-text h2 {
    font-size: 15px;
    padding-left: 14px;
    color: #4daca8;
    font-weight: 600;
    margin: 0 ;
}

ion-text h2 span {
    display: block;
}

ion-text h2 small {
    font-size: 10px;
}

ion-select {
    width: 100%;
}

.facility_wrap {
    border-radius: 20px;
}

.logout-icon {
    position: absolute;
    top: 35px;
    right: 12px;
    font-size: 25px;
    color: #fff;
    display: block;
}

.schedTaken ion-item{
    border-left: 6px solid #f44;
}

.Schedule_modal{
    z-index: -1;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    width: 100vw;
    height: 100vh;
    transition: 0.4s;
    opacity: 0;
    overflow: auto;
    padding-bottom: 50px;
    display:flex;
    align-items:center;
}

.Schedule_modal.openModal{
    z-index: 999;
    opacity:1;
}

.Schedule_modal_box{
    background: #fff;
    color: #000;
    padding: 10px;
    margin: 20px auto;
    border-radius: 10px;
    transition: 0.4s;
    transform: translateY(-100%);
    width: 0%;
    overflow: hidden;
}

.Schedule_modal.openModal .Schedule_modal_box{
    transform: translateY(0%);
    width: calc(100% - 40px);
}

.Schedule_modal_box h2{
    margin: 0;
    font-size: 20px;
    border-bottom: 1px solid #eee;
    padding: 10px 0;
}

.Schedule_modal_box .grid{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap:10px;
    margin: 20px 0;
}

.Schedule_modal_box .grid > p{
    font-weight: normal;
    width:30%;
    color: #555;
    font-size: 15px;
    line-height: 1.5;
    margin: 0;
}



.Schedule_modal_box .grid > div{
    width:63%;
}

.Schedule_modal_box .grid > div:nth-child(2n) > span{
    background: #edf8ff;
    border-bottom: 1px solid #c0e7ff;
    padding: 7px;
    line-height: 1.5;
    color: #555;
    font-size: 15px;
    width: 100%;
    display: block;
    border-radius: 10px;
}

.notBranchMatch{
    background: #ffbcbc;
    padding: 5px;
    margin: 5px 0;
    display: inline-block;
}

.designation_chips_cont{margin-top: 10px;}

.designation_chips{
    background: #1f94db;
    color: #fff;
    padding: 5px 7px;
    border-radius: 20px;
    margin: 0 5px;
    font-size: 15px;
    display: inline-block;
}
.designation_chips:first-child{margin-left: 0;}
.schedStatus{
    color: #fff;
    background: var(--ion-color-primary);
    font-size: 14px;
    padding: 2px 5px;
    border-radius: 20px;
    display: block;
    width: max-content;
    margin: 10px 0;
}
.schedStatus i {vertical-align: text-top;}
</style>