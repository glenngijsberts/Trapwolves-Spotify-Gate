<template>

	<div>

		  <Header />

		  <div class="giveaway-steps">

			  <div class="container">
			  	
				<Steps>

					<div class="column step">
						<div class="round round-1" :class="{active : active_one}"><span class="round-1-1">1</span></div> <h3 :class="{active : active_one}"><span class="showSM"><br /></span>Follow</h3>
					</div>

					<div class="column step">
						<div class="round round-2" :class="{active : active_two}">2</div> <h3 :class="{active : active_two}"><span class="showSM"><br /></span>Information</h3>
					</div>

					<div class="column step">
						<div class="round round-3" :class="{active : active_three}">3</div> <h3 :class="{active : active_three}"><span class="showSM"><br /></span>Complete</h3>
					</div>

				</Steps>

			  	<div class="step-1 top20" v-if="step_one">
			  		<button class="button is-spotify" v-show="!authorized" @click="getAuth()">Login to Spotify to Follow us <i class="fa fa-spotify"></i></button>
			  		<p class="help-text" v-show="!authorized">You have to follow the TrapWolves playlist in order to enter the giveaway</p>
			  	</div>

			  	<div class="step-2 top20" v-if="step_two">

					<form v-on:submit.prevent="onSubmit">
						<div class="field">
						  <div class="control">
						    <input class="input" type="text" name="name" placeholder="Your name" v-model="name">
						  </div>
						</div>					
						<div class="field">
						  <div class="control">
						    <input class="input" type="email" name="email" placeholder="E-mailadress" v-model="emailadress">
						  </div>
						</div>
					</form>

			  		<button class="button is-spotify" @click="checkForm()">Complete</button>
			  		<p class="help-text">*Winner will be announched by Email!</p>

			  	</div>

				<StepThree v-if="step_three" />
				
			  </div>

		  </div>




	</div>  


	
</template>

<script>

// Import dependencies
import axios from 'axios'
import firebase from 'firebase'

// Import config 
import { FirebaseConfig, SpotifyConfig} from '../config.js' //firebase auth settings

// Custom components
import Header from './Header.vue'
import Steps from './Steps.vue'

import StepThree from './Steps/StepThree.vue'


export default {

	name: 'Welcome',
	components: {
		Header,
		Steps,
		StepThree
	},

	data() {
		return {

			// Check for authorized
			authorized: false,
			display: false,

			// Steps
			active_one: true,
			active_two: false,
			active_three: false,

			// accessToken from login spotify API
			accessToken: '',

			// List id from Spotify playlist
			list: '71z8xZqacq06KVQ2Nir9H6',
			// Owner of the playlist
			owner: 'trapwolvesofficial',
			// Check for following the playlist
			follows: false,

			// Client_id from spotify APP
			client_id: SpotifyConfig.client_id,
			// Redirect callback link
			redirect: SpotifyConfig.redirect,

			// Profile_id from spotify API response
			profile_id: '',

			// Managing which step you are one and which HTML will be showing
			step_one: true,
			step_two: false,
			step_three: false,

			// Name and Email for Firebase storing
			name: '',
			emailadress: '',

			// Storing the data from firebase to check if the email is already entered
			array: [],
			checkEmail: ''

		}
	},

	methods: {

		//Login to spotify function
		login(callback) {

			// Set variables
			const client = this.client_id;
			const redirect = this.redirect;

			function getLoginURL(scopes) {
	            return `https://accounts.spotify.com/authorize?client_id=${client}&redirect_uri=${encodeURIComponent(redirect)}&scope=${encodeURIComponent(scopes.join(' '))}&response_type=token`;
	        }

			// Permission scopes
	        const url = getLoginURL([
	        	'user-follow-read',
	            'user-read-private',
	            'user-follow-modify',
	            'playlist-read-private',
	            'playlist-modify-public',
	            'playlist-modify-private'
	        ]);

			// Define the popup window
          	const 	width = 450,
            		height = 750,
              		left = (screen.width / 2) - (width / 2),
              		top = (screen.height / 2) - (height / 2);

			
			window.addEventListener("message", (event) => {
				var hash = JSON.parse(event.data);
				hash.type == 'access_token' ? callback(hash.access_token) : null;
			}, false);

          	var w = window.open(url, 'Spotify', `menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=${width}, height=${height}, top=${top}, left=${left}`);
        
    },

    getUserData(accessToken) {

    	axios({
    		method: 'get',
    		url: 'https://api.spotify.com/v1/me',
    		headers: {
               'Authorization': `Bearer ${accessToken}`
            }
    	}).then((response) => {
    		this.profile_id = response.data.id;
    		this.followsPlaylist();
		})
		
    },

   followsPlaylist() {
    	
		let owner = this.owner;
		let list = this.list;
		let profile = this.profile_id;
		let token = this.accessToken;

    	axios({
    		method: 'get',
    		url: `https://api.spotify.com/v1/users/${owner}/playlists/${list}/followers/contains?ids=${profile}`,
    		headers: {
    			'Authorization': `Bearer ${token}`
    		}
    	}).then((response) => {

    		if(response.data["0"] == true) {
    			this.follows = true;
    			this.step_one = false;
    			this.active_one = false;

    			this.active_two = true;
    			this.step_two = true;
    		} else {
    			this.follow();
    		}

    	}) // end of then first response

    },

    follow() {

		let owner = this.owner;
		let list = this.list;
		let profile = this.profile_id;
		let token = this.accessToken;

    	axios({
			method: 'put',
			url: `https://api.spotify.com/v1/users/${owner}/playlists/${list}/followers`,
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
			}).then((response) => {	
		    	this.follows = true;
		    	this.step_one = false;
		    	this.active_one = false;

		    	this.step_two = true;
		    	this.active_two = true;
			})    	
    },

    getAuth() {

    	this.login((accessToken) => {
          	this.accessToken = accessToken;
          	this.authorized = true;
          	this.display = true;
          	this.getUserData(accessToken);
         });
    },

    checkForm() {

		this.name == '' || this.emailadress == '' ? alert('You have to fill out the form') : this.getFirebase();

    },

    getFirebase() {

    		let app = this;

			var ref = firebase.database().ref().child('/aanmeldingen/');
			
		    ref.once('value', (snapshot) => {

		        snapshot.forEach((childSnapshot) => {
		           this.checkEmail = childSnapshot.val().email;
		           this.array.push(this.checkEmail);
		        });

		        const res = this.array.includes(this.emailadress);

		        if(res) {
		        	alert('You already have entered the giveaway');
		        } else if (res == false) {
		        	app.store();
				}
				
		    });
    },

    store() {
    	this.step_two = false;
	    this.active_two = false;

	    this.active_three = true;
		this.step_three = true;

		let app = this;
		
		firebase.database().ref('/aanmeldingen/').push({
		    username: app.name,
		    email: app.emailadress,
		});
    }

	} // end of methods
}
</script>

<style lang="scss">


html {
	font-size: 16px;
}

 body {
 	font-family: 'Ubuntu', sans-serif;
 }

 .hero-body {
 	padding: 1.5rem;
 }

 .section {
    padding: 0.5rem 1.5rem;
}

 	$brand-color: #40D2A4;
	$trapwolves: #40D2A4;

	.welcome {

		text-align: center;

		h1.title {
			font-size: 3rem;
			font-family: 'Bignoodle', sans-serif;
			color: $trapwolves;
			margin-bottom: 12px;
			font-weight: normal;
		}

		h2.subtitle {
			font-size: 2rem;
			font-family: 'Bignoodle', sans-serif;
			color: black;
			font-weight: normal;
		}

		.image-logo {
			max-width: 70px;
			margin: 0 auto;
			margin-bottom: 10px;
		}

	}

	.shirts {
		margin-top: -30px;
		position: relative;

		.image-shirts {
			max-width: 450px;
			margin: 0 auto;
		}

		.arrow-left {
			position: absolute;
		    top: 125px;
		    max-width: 75px;
		    left: 0px;
		}

		.arrow-right {
			position: absolute;
		    top: 125px;
		    max-width: 75px;
		    right: 0px;
		}

	}

	@media screen and (max-width: 768px) {
		.image-shirts {
			max-width: 300px !important;
			margin: 0 auto;
		}

		.arrow-left, .arrow-right {
			display: none !important;
		}

	}

	.is-spotify {
		background-color: $brand-color;
		color: white;
		border: 1px solid $brand-color;

		.fa-spotify {
			padding-left: 10px;
		}
		&:hover, &:active, &:focus {
			color: white;
			border: 1px solid $brand-color;
            background-color: darken($brand-color, 10%);
		}
	}

	.display {
		display: none;
	}


	 $brand-color: #1db954;

	 .top20 {
	 	margin-top: 20px;
	 }

	 .input:focus, .input.is-focused, .input:active, .input.is-active, .textarea:focus, .textarea.is-focused, .textarea:active, .textarea.is-active {
	    border-color: $brand-color;
	}

	.giveaway-steps {
		margin-top: 10px;

		.step {
			text-align: center;
    		border: 2px solid #ececec;
    		color: #dadada;

			.round {
					display: inline;
				    border-radius: 100%;
				    background-color: transparant;
				    font-size: 16px;
				    padding: 5px 9px 5px 9px;
				    color: #dadada;
				    border: 2px solid #dadada;
				    margin-right: 10px;
			}

			.round.active {
				border: 2px solid #40d2a4;
				color: #40d2a4;
			}

			h3 {
				display: inline;
				color: #dadada;
			}

			h3.active {
				color: #40d2a4;
    			font-weight: bold;
			}

		}

		.step:first-child {
			border-right: 0px solid #ececec !important;
		}
		.step:last-child {
			border-left: 0px solid #ececec !important;
		}

		.col-steps {
			max-width: 900px;
			margin: 0 auto;
		}

		.step-1 {
			text-align: center;
			margin-top: 30px;
			margin-bottom: 30px;	

			.help-text {
				font-size: 14px;
			    color: #c3c3c3;
			    margin-top: 10px;
			}
		}

		.step-2 {
			text-align: center;
			margin-top: 30px;
			margin-bottom: 30px;	

			.help-text {
				font-size: 14px;
			    color: #c3c3c3;
			    margin-top: 10px;
			}

			form {
				max-width: 300px;
			    margin: 0 auto;
			    margin-bottom: 20px;

				input::placeholder {
					text-align: center;
					color:#c3c3c3;
				}

				input {
					text-align: center;
					border: 1px solid #ececec;
				}

			}
		}

		.step-3 {
			text-align: center;
			margin-top: 30px;
			margin-bottom: 30px;

			.sub-text {
				margin-top: 0px;
				font-size: 14px;
			}

			.help-text {
				font-weight: bold;
			}

			.social-icons{
				
				margin-top: 20px;

				 .fa {
					font-size: 30px;
					padding-left: 10px;
					padding-right: 10px;
				}

				.fa-facebook-official {
					color: #3b5998;
				}

				.fa-soundcloud {
					color: #ff8800;
				}

				.fa-instagram {
					  background: -webkit-linear-gradient(#405de6, #833ab4, #c13584, #f56040);
					  -webkit-background-clip: text;
					  -webkit-text-fill-color: transparent;
				}
			}

		}
	}
	.showSM {
		display: none;
	}
	@media screen and (max-width: 480px) {
		.showSM {
			display: block;
			margin-bottom: -20px;
		}

		.giveaway-steps .round {
			margin-right: 0px !important;
			margin-bottom: 0px !important; 
		}

		.giveaway-steps .step h3 {
			margin-top: 0px !important;
		}

		.column.step {
			padding: 1rem .75rem 0.75rem 0.75rem;
		}

	}
	
</style>