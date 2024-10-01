<script setup>
import { ref, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';

const modules = [Autoplay];

const props = defineProps({
  playlists: {
    type: Array,
    required: true,
  },
});

const onSwiper = (swiper) => {
  console.log(swiper, 'swiper');
};

const truncateDescription = (description, maxLength) => {
  return description.length > maxLength
    ? `${description.slice(0, maxLength - 1)}...`
    : description;
};
</script>

<template>
  <div class="w-full">
    <swiper
      :modules="modules"
      :slides-per-view="4"
      :space-between="10"
      :autoplay="{ delay: 3000, disableOnInteraction: false }"
      @swiper="onSwiper"
    >
      <swiper-slide v-for="(playlist, index) in playlists" :key="index">
        <div class="w-full h-auto bg-gray-800">
          <img
            :src="playlist.images[0]?.url"
            alt=""
            class="w-full h-[165px] object-cover"
          />
          <div class="h-[135px] p-4 text-[18px]">
            <a
              :href="playlist.external_urls.spotify"
              target="_blank"
              class="text-green-500 hover:underline"
              >Listen on Spotify</a
            >
            <p class="my-1 text-white">{{ playlist.name }}</p>
            <p class="text-gray-500 text-sm">
              {{ truncateDescription(playlist.description, 50) }}
            </p>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>
