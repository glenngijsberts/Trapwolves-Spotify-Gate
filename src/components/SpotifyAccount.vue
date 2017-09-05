<template>

	<div>

	  <section class="section spotifyAccount">
	    <div class="container">
	      <h1 class="title">Spotify Account</h1>
	      <h2 class="subtitle">
	       {{ authTitle }}
	      </h2>
			
			<div class="authorizedBlock" v-if="authorized"> <!-- if authorized, the authorized property will be true and this block will be shown -->
				
				<!-- this data will be filled by the API response -->
				<img :src="urlProfile" class="image profile-image">
				<h2>Welcome, {{ welcomeAuth }}</h2>
				<h2>Email is {{ emailAuth }}</h2>
				<h2>Spotify followers: {{ spotifyFollowers }}</h2>

				<button class="button is-spotify" @click="getPlaylists()">Get playlists</button>

				<table class="table is-striped is-bordered">
					<thead>
						<tr>
							<th>ID</th>
							<th>Name Playlist</th>
							<th>Total tracks</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in playlist">
							<td>{{ item.id}}</td>
							<td>{{ item.name }}</td>
							<td>{{ item.tracks.total }}</td>
						</tr>
						<tr v-if="playlist == ''">
							<td colspan="3">Click on the button to retrieve playlists</td>
						</tr>
					</tbody>
				</table>

				<button class="button is-spotify" @click="followsPlaylist()">Check if {{ welcomeAuth }} is following trapWolves playlist</button>

				<h2 v-if="follows">Download here</h2>

			</div>
			
			<!-- on click will run the getAuth() function, if authorized the property display will be true so the display class will be active which is display none -->
	      	<button class="button is-spotify" :class="{display : display}" @click="getAuth()">Login to Spotify <i class="fa fa-spotify"></i></button>
			
	      	
	    </div>
	  </section>

	</div>  


	
</template>

<script>

import axios from 'axios'

export default {
	name: 'SpotifyAccount',
	components: {

	},
	data() {
		return {

			authorized: false,
			display: false,

			welcomeAuth: '',
			emailAuth: '',
			urlProfile: '',
			spotifyFollowers: '',
			profile_id: '',

			authTitle: 'Log in to spotify to authorize',

			accessToken: '',

			playlist: [],

			list: '71z8xZqacq06KVQ2Nir9H6',
			owner: 'trapwolvesofficial',
			follows: false,

			client_id: '3f6be5c8306741c8ab06713da0a92f59',
			redirect: 'http://localhost:8080/#/callback',

		}
	},

	methods: {

		login(callback) {

			let app = this;

	        function getLoginURL(scopes) {
	            return 'https://accounts.spotify.com/authorize?client_id=' + app.client_id +
	              '&redirect_uri=' + encodeURIComponent(app.redirect) +
	              '&scope=' + encodeURIComponent(scopes.join(' ')) +
	              '&response_type=token';
	        }
	        
	        let url = getLoginURL([
	            'playlist-read-private',
	            'playlist-modify-public',
	            'playlist-modify-private',
	            'user-follow-read',
	            'user-read-private',
	            'user-follow-modify'
	        ]);
        
          var width = 450,
              height = 730,
              left = (screen.width / 2) - (width / 2),
              top = (screen.height / 2) - (height / 2);

          window.addEventListener("message", function(event) {
              var hash = JSON.parse(event.data);
              if (hash.type == 'access_token') {
                  callback(hash.access_token);
              }
          }, false);

          var w = window.open(url, 'Spotify', 'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);
        
    },

    getUserData(accessToken) {
    	let app = this;
    	axios({
    		method: 'get',
    		url: 'https://api.spotify.com/v1/me',
    		headers: {
               'Authorization': 'Bearer ' + accessToken
            }
    	}).then(function(response) {
    		app.welcomeAuth = response.data.display_name;
    		app.emailAuth = response.data.email;
    		app.urlProfile = response.data.images["0"].url;
    		app.spotifyFollowers = response.data.followers.total;

    		app.profile_id = response.data.id;

    		app.authTitle = 'Authorized as '+ app.welcomeAuth;

    		console.log(response);
    	})
    },

    getPlaylists() {
    	let app = this;
    	axios({
    		method: 'get',
    		url: 'https://api.spotify.com/v1/me/playlists',
    		headers: {
    			'Authorization': 'Bearer ' + app.accessToken
    		}

    	}).then(function(response) {

    		app.playlist = response.data.items;
    		console.log(response);

    	})
    },

    followsPlaylist() {
    	
    	let app = this;

    	axios({
    		method: 'get',
    		url: 'https://api.spotify.com/v1/users/'+app.owner+'/playlists/'+app.list+'/followers/contains?ids='+app.profile_id,
    		headers: {
    			'Authorization': 'Bearer ' + app.accessToken
    		}

    	}).then(function(response) {

    		if(response.data["0"] == true) {
    			app.follows = true;
    		} else {
    			alert('You do not follow the playlist!');

    			    	axios({
				    		method: 'put',
				    		url: 'https://api.spotify.com/v1/users/'+app.owner+'/playlists/'+app.list+'/followers',
				    		headers: {
				    			'Authorization': 'Bearer ' + app.accessToken,
				    			'Content-Type': 'application/json'
				    		}

				    	}).then(function(response) {	
				    		console.log(response);
				    		alert('gelukt!');	
				    	})

    		} // end of else first response	

    	}) // end of then first response

    },

    getAuth() {
    		let app = this;

    	    this.login(function(accessToken) {
          		app.accessToken = accessToken;
          		app.authorized = true;
          		app.display = true;
          		app.getUserData(accessToken);
            });
    }

	} // end of methods
}
</script>

<style lang="scss" scoped>

	$brand-color: #1db954;

	.spotifyAccount {

		.title {
			font-size: 1.5rem;
		}

		.subtitle {
			font-size: 1.2rem;
		}

		.profile-image {
			margin-bottom: 10px;
		}

		h2 {
			margin-bottom: 10px;
		}

		button {
			margin-bottom: 10px;
		}

	}

		.is-spotify {
		background-color: $brand-color;
		color: white;
		border: 1px solid $brand-color;

		.fa-spotify {
			padding-left: 10px;
		}

	}

	.display {
		display: none;
	}
	
</style>