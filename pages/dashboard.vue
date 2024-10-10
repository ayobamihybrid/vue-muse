<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const user = ref(null);
const userPlaylists = ref([]);
const isLoading = ref(true);
const error = ref(null);
const selectedPlaylist = ref(null);
const playlistTracks = ref([]);

onMounted(async () => {
  await loadDashboardData();
});

const loadDashboardData = async () => {
  console.log('Starting to load dashboard data');
  isLoading.value = true;
  error.value = null;

  try {
    await Promise.all([fetchUserData(), fetchUserPlaylists()]);
    console.log('Dashboard data loaded successfully');
  } catch (e) {
    console.error('Error loading dashboard data:', e);
    error.value =
      e.message || 'Failed to load dashboard data. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const fetchUserData = async () => {
  console.log('Fetching user data...');
  const token = localStorage.getItem('spotifyAccessToken');
  if (!token) {
    console.error('No access token found in localStorage');
    throw new Error('No access token found');
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('User data response status:', response.status);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }
    const userData = await response.json();
    console.log('User data fetched successfully:', userData);
    user.value = userData;
  } catch (error) {
    console.error('Error in fetchUserData:', error);
    throw error;
  }
};

const fetchUserPlaylists = async () => {
  console.log('Fetching user playlists');
  const token = localStorage.getItem('spotifyAccessToken');
  if (!token) {
    console.error('No access token found in localStorage');
    throw new Error('No access token found');
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('User playlists response status:', response.status);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      throw new Error(`Failed to fetch playlists: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('User playlists fetched successfully');
    userPlaylists.value = data.items.map((playlist) => ({
      ...playlist,
      images: playlist.images || [],
    }));
    console.log(userPlaylists.value, 'userPlaylists');
  } catch (error) {
    console.error('Error in fetchUserPlaylists:', error);
    throw error;
  }
};

const fetchPlaylistTracks = async (playlistId) => {
  const token = localStorage.getItem('spotifyAccessToken');
  if (!token) {
    console.error('No access token found');
    return;
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch playlist tracks');
    }

    const data = await response.json();
    playlistTracks.value = data.items.map((item) => item.track);
    selectedPlaylist.value = playlistId;
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    alert('Failed to fetch playlist tracks. Please try again.');
  }
};

const togglePlaylistTracks = (playlist) => {
  if (selectedPlaylist.value === playlist.id) {
    selectedPlaylist.value = null;
    playlistTracks.value = [];
  } else {
    fetchPlaylistTracks(playlist.id);
  }
};

const playPlaylist = async (playlistId) => {
  const token = localStorage.getItem('spotifyAccessToken');
  if (!token) {
    console.error('No access token found');
    return;
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch playlist tracks');
    }

    const data = await response.json();
    const trackUris = data.items.map((item) => item.track.uri);

    const playResponse = await fetch(
      'https://api.spotify.com/v1/me/player/play',
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: trackUris,
        }),
      }
    );

    if (!playResponse.ok) {
      throw new Error('Failed to start playback');
    }

    currentPlayingPlaylist.value = playlistId;
    console.log(`Now playing playlist: ${playlistId}`);
  } catch (error) {
    console.error('Error playing playlist:', error);
    alert(
      'Failed to play playlist. Make sure you have an active Spotify session.'
    );
  }
};

const retryLoading = () => {
  loadDashboardData();
};

const goHome = () => {
  router.push('/');
};

const togglePlaylistTrack = () => {
  playlistTrack.value = !playlistTrack.value;
};
</script>

<template>
  <div class="bg-gray-900 text-white min-h-screen p-8">
    <div
      v-if="isLoading"
      class="flex flex-col justify-center items-center h-screen"
    >
      <p class="text-2xl mb-4">Loading...</p>
      <div
        class="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="flex flex-col justify-center items-center h-screen"
    >
      <p class="text-2xl mb-4 text-red-500">{{ error }}</p>
      <button
        @click="retryLoading"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
      >
        Retry
      </button>
      <button
        @click="goHome"
        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-2"
      >
        Go Home
      </button>
    </div>

    <div v-else>
      <header class="mb-8">
        <h1 class="text-3xl font-bold">
          Welcome back, {{ user?.display_name }}
        </h1>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-2xl font-semibold mb-4">Your Playlists</h2>
          <ul v-if="userPlaylists.length > 0" class="space-y-2">
            <li
              v-for="playlist in userPlaylists"
              :key="playlist.id"
              class="cursor-pointer"
            >
              <div
                @click="togglePlaylistTracks(playlist)"
                class="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded"
              >
                <img
                  :src="playlist.images[0]?.url || '/path/to/default-image.jpg'"
                  alt="Playlist cover"
                  class="w-10 h-10 rounded"
                />
                <span>{{ playlist.name }}</span>
              </div>
              <ul
                v-if="selectedPlaylist === playlist.id"
                class="ml-12 mt-2 space-y-1"
              >
                <li
                  v-for="track in playlistTracks"
                  :key="track.id"
                  class="text-sm text-gray-300"
                  @click="
                    router.push({
                      path: '/playing-now',
                      query: {
                        track: track.uri,
                        trackId: track.id,
                        trackName: track.name,
                        trackArtist: track.artists[0]?.name,
                      },
                    })
                  "
                >
                  {{ track.name }} - {{ track.artists[0].name }}
                </li>
              </ul>
            </li>
          </ul>
          <p v-else class="text-gray-400">No playlists found.</p>
        </section>

        <section class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-2xl font-semibold mb-4">Recently Played</h2>
          <p class="text-gray-400">Feature coming soon...</p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
