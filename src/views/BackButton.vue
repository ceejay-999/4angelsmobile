<template>
    <ion-header :class="{ 'hidden': toggleHidden }" animated="false">
        <ion-toolbar color="primary">
            <ion-buttons slot="start" v-if="$route.path == '/login'">
                <ion-back-button text="" @click="$router.push('/welcome')"></ion-back-button>
            </ion-buttons>
            <ion-buttons slot="start" :class="{ 'ion-hide': showButton }" v-else>
                <ion-back-button text="" @click="goBack()"></ion-back-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
</template>

<script>
import { IonButtons, IonHeader, IonToolbar, IonBackButton } from '@ionic/vue';

export default {
    props: {
        toggleHidden: {
            type: Boolean,
            required: true,
            default: false
        },
        showButton: {
            type: Boolean,
            required: true,
            default: true
        },
        bgColor: {
            type: String,
            required: true,
            default: '#fff'
        },
        pageTitle: String
    },
    name: 'BackButton',
    components: { IonButtons, IonHeader, IonToolbar, IonBackButton },
    methods: {
        goBack() {
            this.$router.back();
        },
    }
};
</script>

<style scoped>
ion-toolbar {
    min-height: 88px;
}

ion-toolbar ion-buttons {
    margin: 0;
    padding-right: 15px;
}

ion-toolbar ion-avatar {
    width: 48px;
    height: 48px;
}

ion-buttons {
    min-height: 48px;
}

ion-title {
    position: relative;
    font-size: 18px;
    color: #1f94db;
    width: auto;
    padding: 0;
    margin-right: 15px;
}

ion-title[slot="start"] {
    font-size: 28px;
    font-weight: bold;
    text-align: left;
    margin-right: 0;
}

ion-title span {
    display: block;
    font-size: 12px;
    color: #0e0e0e;
}
</style>