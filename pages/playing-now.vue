<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const audioPlayer = ref(null);

const trackId = route.query.trackId;

onMounted(() => {
  const playMusic = () => {
    if (audioPlayer.value) {
      audioPlayer.value.load();
      audioPlayer.value.play();
    }

    return {
      playMusic,
    };
  };

  playMusic();
});
</script>

<template>
  <div
    class="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-gray-900 to-black p-6"
  >
    <div class="max-w-4xl w-full rounded-lg">
      <iframe
        :src="`https://open.spotify.com/embed/track/${trackId}`"
        width="100%"
        height="400"
        frameborder="0"
        allowtransparency="true"
        allow="encrypted-media"
      ></iframe>
    </div>
  </div>
</template>

<style scoped>
audio {
  width: 100%;
  height: 40px;
}
</style>
