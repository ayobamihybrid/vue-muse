<script setup>
import { onMounted, ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/swiper-bundle.css';
import { useRouter } from 'vue-router';

const router = useRouter();

const playlists = ref([]);
const userPlaylists = ref([]);
const newTracks = ref([]);
const user = ref([]);
const searchQuery = ref('');
const searchQueryTwo = ref('');
const results = ref([]);
const playlistMusic = ref([]);
const newPlaylistName = ref('');
const newPlaylistDescription = ref('');
const createNewPlaylistModal = ref(false);
const addMusic = ref(false);
const playlistCoverImage = ref(null);
const imagePreview = ref(null);
const initialTracks = ref([]);
const primaryColor = ref('#000000');
const isCreatingPlaylist = ref(false);
const isLoadingPlaylists = ref(false);
const currentPlayingPlaylist = ref(null);

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

const fetchUserPlaylists = async (retryCount = 3) => {
  const token = localStorage.getItem('spotifyAccessToken');
  if (!token || !user.value.id) {
    console.error('User not authenticated');
    return;
  }

  isLoadingPlaylists.value = true;

  try {
    const result = await fetch('https://api.spotify.com/v1/me/playlists', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await result.json();
    if (result.ok) {
      userPlaylists.value = data.items;
      console.log('User playlists:', data.items);
    } else {
      console.error('Error fetching user playlists:', data);
      if (retryCount > 0) {
        console.log(`Retrying... (${retryCount} attempts left)`);
        await fetchUserPlaylists(retryCount - 1);
      }
    }
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    if (retryCount > 0) {
      console.log(`Retrying... (${retryCount} attempts left)`);
      await fetchUserPlaylists(retryCount - 1);
    }
  } finally {
    isLoadingPlaylists.value = false;
  }
};

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
        'https://api.spotify.com/v1/recommendations?limit=20&seed_genres=afrobeat',
        {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + token },
        }
      );
      const data = await result.json();

      if (data && data.tracks) {
        newTracks.value = data.tracks;
        console.log(newTracks.value.slice(0, 1), 'new tracks');
      } else {
        console.log('No recommended tracks found.');
      }
    } catch (error) {
      console.error('Error fetching recommended tracks:', error);
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
        await fetchUserPlaylists();
      } else {
        console.error('Error fetching user profile:', data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  await fetchUserProfile();

  fetchFeaturedPlaylists();

  fetchNewReleases();

  fetchUserPlaylists();
});

watch(user, async (newUser) => {
  if (newUser.id) {
    await fetchUserPlaylists();
  }
});

const loginWithSpotify = () => {
  const clientId = 'efb074404f224135a60685d521a9486c';
  const scope =
    'user-read-private user-read-email playlist-read-private playlist-modify-public playlist-modify-private user-modify-playback-state';
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}`;

  window.location.href = spotifyAuthUrl;
};

const searchMusic = async (queryType) => {
  let token = localStorage.getItem('spotifyAccessToken');
  const refreshToken = localStorage.getItem('spotifyRefreshToken');

  if (!token) return;

  const isExpired = isTokenExpired(token);
  if (isExpired && refreshToken) {
    token = await refreshAccessToken(refreshToken);
  }

  let query =
    queryType === 'searchQuery'
      ? searchQuery.value.trim()
      : queryType === 'searchQueryTwo'
      ? searchQueryTwo.value.trim()
      : '';

  if (!query) {
    console.error('Empty query. Please enter a search term.');
    return;
  }

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=track`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (queryType === 'searchQuery') {
    results.value = data.tracks.items;
  } else {
    playlistMusic.value = data.tracks.items;

    console.log(playlistMusic.value, 'playlistMusiccc.value');
  }
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

const createNewPlaylist = async () => {
  console.log('Starting playlist creation process');
  isCreatingPlaylist.value = true;
  const token = localStorage.getItem('spotifyAccessToken');
  if (!token || !user.value.id) {
    console.error('User not authenticated');
    isCreatingPlaylist.value = false;
    return;
  }

  if (!newPlaylistName.value.trim()) {
    console.error('Playlist name is required');
    alert('Please enter a playlist name');
    isCreatingPlaylist.value = false;
    return;
  }

  try {
    console.log('Step 1: Creating playlist');
    const response = await fetch(
      `https://api.spotify.com/v1/users/${user.value.id}/playlists`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPlaylistName.value,
          description: newPlaylistDescription.value,
          public: true,
          collaborative: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create playlist: ${response.statusText}`);
    }

    const playlistData = await response.json();
    console.log('Playlist created:', playlistData);

    if (playlistCoverImage.value) {
      console.log('Step 2: Uploading cover image');
      try {
        await uploadCoverImage(playlistData.id, token);
      } catch (imageError) {
        console.error('Error uploading cover image:', imageError);
        alert(
          'Playlist created, but there was an error uploading the cover image. You can try adding an image later.'
        );
      }
    } else {
      console.log('No cover image to upload');
    }

    if (initialTracks.value.length > 0) {
      console.log('Step 3: Adding tracks to playlist');
      try {
        await addTracksToPlaylist(playlistData.id, token);
      } catch (tracksError) {
        console.error('Error adding tracks to playlist:', tracksError);
      }
    }

    console.log('Step 4: Updating local state');
    updateLocalState(playlistData);

    console.log('Step 5: Fetching updated user playlists');
    await fetchUserPlaylists();

    console.log('Playlist creation process completed successfully');
    alert('Playlist created successfully!');
    resetFormAndCloseModal();
  } catch (error) {
    console.error('Error in playlist creation process:', error);
    alert(`Failed to create playlist: ${error.message}`);
  } finally {
    isCreatingPlaylist.value = false;
    console.log('Playlist creation process ended');
  }
};

const uploadCoverImage = async (playlistId, token) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result.split(',')[1];
      try {
        console.log('Uploading cover image...');
        console.log('Playlist ID:', playlistId);
        console.log('Image size:', base64data.length, 'bytes');

        if (base64data.length > 256 * 1024) {
          throw new Error('Image file is too large. Maximum size is 256KB.');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const imageResponse = await fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}/images`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'image/jpeg',
            },
            body: base64data,
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          console.error('Image upload response:', errorText);
          throw new Error(
            `Failed to upload cover image: ${imageResponse.statusText}. ${errorText}`
          );
        }

        console.log('Cover image uploaded successfully');
        resolve();
      } catch (error) {
        console.error('Error in uploadCoverImage:', error);
        if (error.name === 'AbortError') {
          console.error('Image upload timed out after 30 seconds');
        }
        reject(error);
      }
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(error);
    };
    reader.readAsDataURL(playlistCoverImage.value);
  });
};

const addTracksToPlaylist = async (playlistId, token) => {
  console.log('Adding tracks to playlist...');
  const tracksResponse = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: initialTracks.value.map((track) => track.uri),
      }),
    }
  );
  if (!tracksResponse.ok) {
    throw new Error(
      `Failed to add tracks to playlist: ${tracksResponse.statusText}`
    );
  }
  console.log('Tracks added to playlist successfully');
};

const updateLocalState = (playlistData) => {
  console.log('Updating local state with new playlist');
  const updatedPlaylist = {
    ...playlistData,
    images: playlistCoverImage.value
      ? [{ url: URL.createObjectURL(playlistCoverImage.value) }]
      : [],
    tracks: { total: initialTracks.value.length },
  };
  userPlaylists.value = [updatedPlaylist, ...userPlaylists.value];
};

const resetFormAndCloseModal = () => {
  console.log('Resetting form and closing modal');
  newPlaylistName.value = '';
  newPlaylistDescription.value = '';
  playlistCoverImage.value = null;
  imagePreview.value = null;
  initialTracks.value = [];
  createNewPlaylistModal.value = false;
};

const handleCoverImageUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    playlistCoverImage.value = file;
    imagePreview.value = URL.createObjectURL(file);
  } else {
    alert('Please select a valid image file.');
    playlistCoverImage.value = null;
    imagePreview.value = null;
  }
};

const addTrack = async (track) => {
  const trackExists = initialTracks.value.some((t) => t.uri === track.uri);
  if (!trackExists) {
    initialTracks.value.push({
      uri: track.uri,
      name: track.name,
      artists: track.artists.map((artist) => artist.name).join(', '),
    });
    console.log('Track added to playlist:', track.name);
  } else {
    console.log('Track already exists in the playlist:', track.name);
  }
};

const toggleModal = () => {
  createNewPlaylistModal.value = !createNewPlaylistModal.value;

  newPlaylistName.value = '';
  newPlaylistDescription.value = '';
  playlistCoverImage.value = null;
  searchQueryTwo.value = null;
};

const toggleAddMusic = () => {
  addMusic.value = !addMusic.value;
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

        <!-- <p
          v-if="user"
          class="text-[#fff] cursor-pointer"
          @click="
            router.push({
              path: '/dashboard',
              query: {
                userName: user.display_name,
                userPlaylists: userPlaylists,
              },
            })
          "
        >
          {{ user?.display_name?.split(' ').slice(0, 2).join(' ') }}
        </p> -->

        <p
          v-if="user"
          class="text-[#fff] cursor-pointer"
          @click="router.push('/dashboard')"
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

      <div
        @click="toggleModal"
        class="ml-6 mt-4 flex items-center gap-4 cursor-pointer"
      >
        <div class="p-[2px] bg-gray-500 rounded-full flex justify-center">
          <Icon name="mdi-plus" size="20px" class="" />
        </div>

        <p class="text-[#fff]">New playlist</p>
      </div>

      <div v-if="isLoadingPlaylists" class="ml-6 my-3 text-[#fff]">
        Loading playlists...
      </div>

      <div v-else-if="userPlaylists.length === 0">
        <p class="ml-6 my-3 text-[#fff]">
          You don't have a playlist created yet
        </p>
      </div>

      <div
        v-else
        class="ml-6 h-[300px] overflow-hidden overflow-y-auto text-[#fff]"
      >
        <p
          class="my-3"
          v-for="playlist in userPlaylists"
          :key="playlist.id"
          @click="router.push('/dashboard')"
        >
          {{ playlist.name }}
        </p>
      </div>

      <div
        v-if="createNewPlaylistModal"
        class="absolute top-0 left-0 right-0 bottom-0 bg-black/25 backdrop-blur-sm flex justify-center items-center z-[99999] shadow-lg"
      >
        <div
          class="w-full max-w-[1200px] min-h-[200px] p-5 bg-gradient-to-br from-gray-900 to-black shadow-xl rounded-[10px] text-[#fff]"
        >
          <div class="flex justify-between items-center">
            <p class="text-[26px]">New Playlist</p>

            <p @click="toggleModal" class="text-[22px] cursor-pointer">X</p>
          </div>

          <form @submit.prevent="createNewPlaylist">
            <input
              type="text"
              v-model="newPlaylistName"
              placeholder="Enter the name of the playlist"
              id="name"
              name="name"
              required
              class="mt-9 border rounded w-full py-2 px-3 mb-2 bg-transparent"
            />

            <input
              type="text"
              v-model="newPlaylistDescription"
              placeholder="Provide a description for your playlist"
              id="name"
              name="name"
              class="mt-2 border rounded w-full py-2 px-3 mb-2 bg-transparent"
            />

            <div class="my-4">
              <label for="cover-image" class="block text-sm font-medium mb-1">
                Cover Image
              </label>

              <input
                type="file"
                id="cover-image"
                @change="handleCoverImageUpload"
                accept="image/*"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
            </div>

            <div v-if="imagePreview" class="mb-4">
              <img
                :src="imagePreview"
                alt="Cover preview"
                class="w-full h-80 object-cover rounded-md"
              />
            </div>

            <p @click="toggleAddMusic" class="block text-xl font-medium my-5">
              Add music +
            </p>

            <div v-if="addMusic" class="relative">
              <div class="flex gap-2">
                <input
                  v-model="searchQueryTwo"
                  @keyup.enter="searchMusic('searchQueryTwo')"
                  type="text"
                  placeholder="Search"
                  class="border rounded py-1 px-7 mb-5 bg-transparent"
                />

                <p @click="searchMusic('searchQueryTwo')">search</p>
              </div>

              <div v-if="playlistMusic.length">
                <h3 class="text-[#fff]">
                  Search Results ({{ playlistMusic.length }})
                </h3>

                <div class="w-full h-auto overflow-x-auto">
                  <div class="w-max flex items-center gap-3">
                    <div
                      v-for="item in playlistMusic"
                      :key="item.id"
                      class="shrink-0 cursor-pointer"
                      @click="addTrack(item)"
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

              <div v-if="initialTracks.length > 0" class="mt-4">
                <h3 class="text-gray-700 font-semibold">Added Tracks:</h3>
                <ul class="list-disc pl-5">
                  <li
                    v-for="track in initialTracks"
                    :key="track.uri"
                    class="text-gray-600"
                  >
                    {{ track.name }} - {{ track.artists }}
                  </li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              :disabled="isCreatingPlaylist"
              class="mt-9 w-full p-2 bg-violet-200 rounded-[10px] disabled:opacity-50"
            >
              <p v-if="!isCreatingPlaylist">Create playlist</p>
              <p v-else>Creating playlist...</p>
            </button>
          </form>
        </div>
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
            @keyup.enter="searchMusic('searchQuery')"
            type="text"
            placeholder="Search"
            class="border rounded py-1 px-7 mb-5"
          />

          <Icon
            name="mdi-magnify"
            size="22px"
            class="absolute left-1 top-[7px] text-[#000]"
            @click="searchMusic('searchQuery')"
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
                    track: track.uri,
                    trackId: track.id,
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
