<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

onMounted(async () => {
  const code = route.query.code;

  console.log(code, 'code');

  if (code) {
    const clientId = 'efb074404f224135a60685d521a9486c';
    const clientSecret = 'd0e880e15fd74523aee6e82575b6c6c7';
    // const redirectUri = 'https://vue-muse.vercel.app/authorization';
    const redirectUri = 'http://localhost:3000/authorization';

    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('code', code);
    body.append('redirect_uri', redirectUri);
    body.append('client_id', clientId);
    body.append('client_secret', clientSecret);

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log('Access Token:', data.access_token);

      localStorage.setItem('spotifyAccessToken', data.access_token);
      localStorage.setItem('spotifyRefreshToken', data.refresh_token);

      window.location.href = '/';
    } catch (error) {
      console.error('Error exchanging authorization code:', error);
    }
  }
});
</script>
