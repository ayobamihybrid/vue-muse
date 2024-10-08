<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const audioPlayer = ref(null);

const track = route.query.track || '';
const trackName = route.query.trackName || '';
const trackArtist = route.query.trackArtist || '';

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
  <div class="w-full h-full flex justify-center items-center bg-[#191414]">
    <div
      class="w-full max-w-[1000px] flex flex-col items-center bg-[#644b4b07] shadow-2xl rounded-[10px] p-20"
    >
      <h1 class="text-[24px] text-[#fff]">
        Now Playing: {{ trackName }} by {{ trackArtist }}
      </h1>

      <img
        src="../public/nowplaying.jpg"
        alt=""
        class="w-[400px] h-[400px] cursor-pointer my-3"
      />

      <div class="w-full p-2 bg-green-400 rounded-full shadow-xl">
        <audio ref="audioPlayer" :src="track" controls></audio>
      </div>
    </div>
  </div>
</template>

<style scoped>
audio {
  width: 100%;
  height: 40px;
}
</style>
