<script>
onMounted(() => {
  async function getAccessToken() {
    const clientId = 'efb074404f224135a60685d521a9486c';
    const clientSecret = 'd0e880e15fd74523aee6e82575b6c6c7';

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
      },
      body: 'grant_type=client_credentials',

      //  "grant_type=client_credentials&client_id=efb074404f224135a60685d521a9486c&client_secret=d0e880e15fd74523aee6e82575b6c6c7"
    });
    const data = await response.json();
    return data.access_token;

    console.log(data, 'data');
  }
}, []);

async function getArtistData(artistId) {
  const token = await getAccessToken();
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return await response.json();
}

export default {
  data() {
    return {
      featuredMusics: [
        {
          constant: 'listen',
          genre: 'Afro beat',
          artist: 'Asake',
          image: '../public/nft1.png',
        },
        {
          constant: 'listen',
          genre: 'Rap',
          artist: 'Blackbonez',
          image: '../public/nft2.png',
        },
        {
          constant: 'listen',
          genre: 'Afro beat',
          artist: 'Ayra Starr',
          image: '../public/nft3.png',
        },
        {
          constant: 'listen',
          genre: 'Afro beat',
          artist: 'Tems',
          image: '../public/nft4.png',
        },
        {
          constant: 'listen',
          genre: 'Hip hop',
          artist: 'Travis Scott',
          image: '../public/nft5.png',
        },
      ],

      tracks: [
        {
          id: 1,
          title: 'Remembrance (Main Mix)',
          artist: 'Anna',
          album: 'Speicher 105',
          time: '5:41',
          image: '/path/to/image1.png',
        },
        {
          id: 2,
          title: 'Bounce',
          artist: 'Dimitri Vegas & Like Mike, Julian Banks, Snoop Dogg',
          album: 'Bounce',
          time: '2:37',
          image: '/path/to/image2.png',
        },
        {
          id: 3,
          title: '25 Soldiers',
          artist: 'Swizz Beatz, Young Thug',
          album: '25 Soldiers',
          time: '4:47',
          image: '/path/to/image3.png',
        },
        {
          id: 4,
          title: 'Your Biggest Fan',
          artist: 'Marie Davidson',
          album: 'Working Class Woman',
          time: '4:25',
          image: '/path/to/image4.png',
        },
        {
          id: 5,
          title: 'Tints (feat. Kendrick Lamar)',
          artist: 'Anderson .Paak',
          album: 'Tints (feat. Kendrick Lamar)',
          time: '4:29',
          image: '/path/to/image5.png',
        },
      ],
    };
  },
};
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <div class="w-[20%] h-full bg-[#191414] p-4">
      <div class="flex items-center justify-between">
        <img
          src="../public/musee.jpeg"
          alt=""
          class="w-[60px] h-[60px] cursor-pointer"
        />

        <Icon name="mdi-user" size="35px" class="text-[#fff] cursor-pointer" />
      </div>

      <div class="ml-6 mt-9">
        <div class="flex items-center gap-5 cursor-pointer">
          <img src="../public/musee.jpeg" alt="" class="w-[25px] h-[25px]" />

          <p class="text-[#fff]">Home</p>
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
      <div class="ml-6 mt-4 flex items-center gap-5 cursor-pointer">
        <Icon name="mdi-plus-circle" size="25px" class="text-gray-500" />

        <p class="text-[#fff]">New playlist</p>
      </div>

      <div class="ml-6 h-[300px] overflow-hidden overflow-y-auto text-[#fff]">
        <p class="mt-3">hgffgdzhgffgdz hgffgdz hgffgdz</p>
        <p class="my-2">hgffgdz hgffgdz hgffgdz</p>
        <p class="my-2">hgffgdz hgffgdz hgffgdz</p>
        <p class="my-2">hgffgdz hgffgdz hgffgdz</p>
        <p class="my-2">hgffgdz hgffgdz hgffgdz</p>
        <p class="my-2">hgffgdz hgffgdz hgffgdz</p>
        <p class="my-2">hgffgdz hgffgdz hgffgdz</p>
        <p class="my-2">hgffgdz hgffgdz hgffgdz</p>
        <p class="my-2">hgffgdz hgffgdz hgffgdz</p>
        <p class="my-2">hgffgdz hgffgdz hgffgdz</p>
        <p class="my-2">hgffgdz hgffgdz hgffgdz</p>
        <p class="my-2">hgffgdz hgffgdz hgffgdz</p>
        <p class="my-2">hgffgdz hgffgdz hgffgdz</p>
      </div>

      <div class="h-full">
        <p>hhh</p>
      </div>
    </div>

    <div class="w-[80%] h-full bg-gray-900 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <Icon name="mdi-arrow-left" class="cursor-pointer text-[#fff]" />
          <Icon name="mdi-arrow-right" class="cursor-pointer text-gray-500" />
        </div>

        <div class="relative">
          <input
            type="text"
            placeholder="Search"
            class="border rounded py-1 px-7 mb-5"
          />

          <Icon
            name="mdi-magnify"
            size="22px"
            class="absolute left-1 top-[7px] text-[#000]"
          />
        </div>
      </div>

      <p class="my-6 text-[#fff] text-lg font-semibold">Featured</p>

      <div class="w-full h-auto overflow-x-auto">
        <div class="w-max flex items-center gap-3">
          <div
            v-for="(featuredMusic, index) in featuredMusics"
            :key="index"
            class="shrink-0 cursor-pointer"
          >
            <div class="w-[270px] h-auto bg-gray-800">
              <!-- <img :src="featuredMusic.image" alt="" class="w-full h-[50%]" /> -->
              <img src="../public/musix.jpeg" alt="" class="w-full h-[50%]" />

              <div class="h-[50%] p-4 text-[18px]">
                <p class="text-green-500">
                  {{ featuredMusic.constant }}
                </p>
                <p class="my-1 text-[#fff]">
                  {{ featuredMusic.genre }}
                </p>
                <p class="text-gray-500">{{ featuredMusic.artist }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center my-9 text-white">
        <h2 class="text-lg font-semibold">Suggested New Tracks</h2>
        <a href="#" class="text-sm text-gray-400 hover:underline">View all</a>
      </div>

      <div class="h-[300px] overflow-hidden overflow-y-auto text-[#fff]">
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
              v-for="track in tracks"
              :key="track.id"
              class="border-b border-gray-900"
            >
              <td class="flex items-center gap-3 px-4 py-2">
                <!-- <img :src="track.image" alt="" class="w-12 h-12 rounded-md" /> -->
                <img
                  src="../public/nft1.png"
                  alt=""
                  class="w-12 h-12 rounded-md"
                />
                <span>{{ track.title }}</span>
              </td>
              <td class="px-4 py-2">{{ track.artist }}</td>
              <td class="px-4 py-2">{{ track.album }}</td>
              <td class="text-right px-4 py-2">{{ track.time }}</td>
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
  display: none; /* Hide the scrollbar */
}

/* Hide the scrollbar for Firefox */
::-moz-scrollbar {
  display: none;
}

/* Hide the scrollbar for IE */
::-ms-scrollbar {
  display: none;
}
</style>
