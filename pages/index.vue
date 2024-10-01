<script setup>
import { onMounted, ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/swiper-bundle.css';
import { useRouter } from 'vue-router';

const router = useRouter();

const playlists = ref([]);
const newTracks = ref([]);
const user = ref([]);
const searchQuery = ref('');
const results = ref([]);

const redirectUri = 'http://localhost:3000/authorization';

async function getAccessToken() {
  const clientId = 'efb074404f224135a60685d521a9486c';
  const clientSecret = 'd0e880e15fd74523aee6e82575b6c6c7';

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
      },
      body: 'grant_type=client_credentials',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
  }
}

onMounted(async () => {
  const fetchFeaturedPlaylists = async () => {
    try {
      const token = await getAccessToken();

      const result = await fetch(
        'https://api.spotify.com/v1/browse/featured-playlists',
        {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + token },
        }
      );
      const data = await result.json();

      if (data && data.playlists && data.playlists.items) {
        playlists.value = data.playlists.items;
      } else {
        console.log('No playlists found.');
      }
    } catch (error) {
      console.error('Error fetching featured playlists:', error);
    }
  };

  const fetchNewReleases = async () => {
    try {
      const token = await getAccessToken();

      const result = await fetch(
        'https://api.spotify.com/v1/browse/new-releases',
        {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + token },
        }
      );
      const data = await result.json();

      if (data && data.albums && data.albums.items) {
        const trackPromises = data.albums.items.map(async (album) => {
          const albumDetails = await fetch(
            `https://api.spotify.com/v1/albums/${album.id}`,
            {
              method: 'GET',
              headers: { Authorization: 'Bearer ' + token },
            }
          );
          const albumData = await albumDetails.json();
          return albumData.tracks.items;
        });

        const allTracks = await Promise.all(trackPromises);
        newTracks.value = allTracks.flat();
        console.log(newTracks.value.slice(0, 1), 'tracks');
      } else {
        console.log('No albums found.');
      }
    } catch (error) {
      console.error('Error fetching new releases:', error);
    }
  };

  const fetchUserProfile = async () => {
    let token = localStorage.getItem('spotifyAccessToken');
    const refreshToken = localStorage.getItem('spotifyRefreshToken');

    if (!token) {
      console.error('No access token found');
      return;
    }

    const isExpired = isTokenExpired(token);
    if (isExpired && refreshToken) {
      console.log('Token expired, refreshing...');
      token = await refreshAccessToken(refreshToken);
    }

    if (!token) {
      console.error('Failed to retrieve a valid access token');
      return;
    }

    try {
      const result = await fetch('https://api.spotify.com/v1/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await result.json();
      if (result.ok) {
        user.value = data;
        console.log('User profile:', data);
      } else {
        console.error('Error fetching user profile:', data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  fetchFeaturedPlaylists();

  fetchNewReleases();

  fetchUserProfile();
});

const loginWithSpotify = () => {
  const clientId = 'efb074404f224135a60685d521a9486c';
  const scope = 'user-read-private user-read-email playlist-read-private';
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}`;

  window.location.href = spotifyAuthUrl;
};

const searchMusic = async () => {
  let token = localStorage.getItem('spotifyAccessToken');
  const refreshToken = localStorage.getItem('spotifyRefreshToken');

  if (!token) return;

  const isExpired = isTokenExpired(token);
  if (isExpired && refreshToken) {
    token = await refreshAccessToken(refreshToken);
  }

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${searchQuery.value}&type=track`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  results.value = data.tracks.items;
};

const isTokenExpired = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) throw new Error('Invalid token format');

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(base64 + padding);

    const payload = JSON.parse(decoded);
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

const refreshAccessToken = async (refreshToken) => {
  const clientId = 'efb074404f224135a60685d521a9486c';
  const clientSecret = 'd0e880e15fd74523aee6e82575b6c6c7';

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();

  if (data.access_token) {
    localStorage.setItem('spotifyAccessToken', data.access_token);
    return data.access_token;
  } else {
    console.error('Failed to refresh access token:', data);
    return null;
  }
};
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <div class="w-[20%] h-full bg-[#191414] p-4">
      <div class="flex items-center justify-between">
        <NuxtLink to="/">
          <img
            src="../public/musee.jpeg"
            alt=""
            class="w-[60px] h-[60px] cursor-pointer"
          />
        </NuxtLink>

        <p
          v-if="user"
          class="text-[#fff] cursor-pointer"
          @click="
            router.push({
              path: '/dashboard',
              query: {
                userName: user.display_name,
              },
            })
          "
        >
          {{ user?.display_name?.split(' ').slice(0, 2).join(' ') }}
        </p>

        <Icon
          v-else
          name="mdi-user"
          size="35px"
          class="text-[#fff] cursor-pointer"
          @click="loginWithSpotify"
        />
      </div>

      <div class="ml-6 mt-9">
        <div class="flex items-center gap-5 cursor-pointer">
          <img src="../public/musee.jpeg" alt="" class="w-[25px] h-[25px]" />

          <p class="text-[#fff]"><NuxtLink to="/">Home</NuxtLink></p>
        </div>

        <div class="mt-4 flex items-center gap-5 cursor-pointer">
          <Icon name="mdi-compass" size="25px" class="text-gray-500" />

          <p class="text-[#fff]">Explore</p>
        </div>
      </div>

      <div class="ml-6 mt-9">
        <p class="text-gray-500">My collection</p>

        <div class="mt-4 flex items-center gap-5 cursor-pointer">
          <Icon name="mdi-album" size="25px" class="text-gray-500" />

          <p class="text-[#fff]">Albums</p>
        </div>

        <div class="mt-4 flex items-center gap-5 cursor-pointer">
          <Icon name="mdi-music" size="25px" class="text-gray-500" />

          <p class="text-[#fff]">Tracks</p>
        </div>

        <div class="mt-4 flex items-center gap-5 cursor-pointer">
          <Icon name="mdi-video" size="25px" class="text-gray-500" />

          <p class="text-[#fff]">Videos</p>
        </div>

        <div class="mt-4 flex items-center gap-5 cursor-pointer">
          <Icon name="mdi-account-music" size="25px" class="text-gray-500" />

          <p class="text-[#fff]">Artists</p>
        </div>
      </div>

      <div class="ml-6 mt-9 flex justify-between items-center">
        <p class="text-gray-500">My playlist</p>

        <p class="text-gray-500">...</p>
      </div>

      <div class="ml-6 mt-4 flex items-center gap-4 cursor-pointer">
        <div class="p-[2px] bg-gray-500 rounded-full flex justify-center">
          <Icon name="mdi-plus" size="20px" class="" />
        </div>

        <p class="text-[#fff]">New playlist</p>
      </div>

      <div class="ml-6 h-[300px] overflow-hidden overflow-y-auto text-[#fff]">
        <p class="my-3" v-for="(playlist, index) in playlists" :key="index">
          {{ playlist.name }}
        </p>
      </div>
    </div>

    <div class="w-[80%] h-full overflow-y-auto bg-gray-900 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <Icon name="mdi-arrow-left" class="cursor-pointer text-[#fff]" />
          <Icon name="mdi-arrow-right" class="cursor-pointer text-gray-500" />
        </div>

        <div class="relative">
          <input
            v-model="searchQuery"
            @keyup.enter="searchMusic"
            type="text"
            placeholder="Search"
            class="border rounded py-1 px-7 mb-5"
          />

          <Icon
            name="mdi-magnify"
            size="22px"
            class="absolute left-1 top-[7px] text-[#000]"
            @click="searchMusic"
          />
        </div>
      </div>
      <div v-if="results.length">
        <h3 class="text-[#fff]">Search Results ({{ results.length }})</h3>

        <div class="w-full h-auto overflow-x-auto">
          <div class="w-max flex items-center gap-3">
            <div
              v-for="item in results"
              :key="item.id"
              class="shrink-0 cursor-pointer"
            >
              <div class="w-[270px] h-auto bg-gray-800">
                <img
                  :src="item.album?.images[0]?.url"
                  alt="Album Cover"
                  class="w-full h-[55%]"
                />

                <div class="h-[45%] p-4 text-[18px]">
                  <p class="my-1 text-[#fff]">
                    {{ item.name.slice(0, 26) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p class="my-6 text-[#fff] text-lg font-semibold">Featured</p>

      <Playlist :playlists="playlists" />

      <div class="flex justify-between items-center my-9 text-white">
        <h2 class="text-lg font-semibold">Suggested New Tracks</h2>
        <a href="#" class="text-sm text-gray-400 hover:underline">View all</a>
      </div>

      <div class="h-auto text-[#fff]">
        <table class="table-auto w-full h-full">
          <thead class="border-b border-gray-900">
            <tr>
              <th class="text-left text-gray-400 px-4 py-2">TITLE</th>
              <th class="text-left text-gray-400 px-4 py-2">ARTIST</th>
              <th class="text-left text-gray-400 px-4 py-2">ALBUM</th>
              <th class="text-right text-gray-400 px-4 py-2">TIME</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(track, index) in newTracks.slice(0, 20)"
              :key="index"
              class="border-b border-gray-900 cursor-pointer"
              @click="
                router.push({
                  path: '/playing-now',
                  query: {
                    track: track.preview_url,
                    trackName: track.name,
                    trackArtist: track.artists[0]?.name,
                  },
                })
              "
            >
              <td class="flex items-center gap-3 px-4 py-2">
                <img
                  src="../public/nft1.png"
                  alt=""
                  class="w-12 h-12 rounded-md"
                />
                <span>{{ track.name }}</span>
              </td>
              <td class="px-4 py-2">{{ track.artists[0]?.name }}</td>
              <td class="px-4 py-2">
                {{ track.album?.name || 'Unknown Album' }}
              </td>
              <td class="text-right px-4 py-2">
                {{ (track.duration_ms / 60000).toFixed(2) }}
              </td>
              <td class="text-right px-4 py-2">
                <button class="text-white px-2">+</button>
                <button class="text-gray-400 px-2">
                  <i class="mdi mdi-heart-outline"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  display: none;
}

::-moz-scrollbar {
  display: none;
}

::-ms-scrollbar {
  display: none;
}

.mySwiper {
  width: 100%;
  height: auto;
}
</style>
