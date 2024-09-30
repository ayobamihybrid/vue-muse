<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('spotifyAccessToken');
    if (!token) return;

    try {
      const result = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await result.json();
      user.value = data;
      console.log('User profile:', data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  fetchUserProfile();
});
</script>

<template>
  <div class="w-full h-full flex justify-center items-center">
    <div class="flex flex-col items-center shadow-xl rounded-[10px] p-20">
      <h1 class="text-[24px]">Welcome back: {{ user?.display_name }}</h1>
      <img
        src="../public/nowplaying.jpg"
        alt=""
        class="w-[400px] h-[400px] cursor-pointer"
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
