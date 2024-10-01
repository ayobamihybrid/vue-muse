<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const userName = route.query.userName || '';
</script>

<template>
  <div class="w-full h-full flex justify-center items-center">
    <div class="flex flex-col items-center shadow-xl rounded-[10px] p-20">
      <h1 class="text-[24px]">Welcome back: {{ userName }}</h1>
      <Playlist :playlists="playlists" />
    </div>
  </div>
</template>

<style scoped>
audio {
  width: 100%;
  height: 40px;
}
</style>
