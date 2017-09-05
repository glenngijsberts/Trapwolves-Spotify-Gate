<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'app'
}

</script>

<style lang="scss">

 @import "~/node_modules/bulma/css/bulma.css";
 @import "~/node_modules/font-awesome/css/font-awesome.css";
 @import "./sass/app.scss";

 $brand-color: #1db954;

 .top20 {
 	margin-top: 20px;
 }

 .input:focus, .input.is-focused, .input:active, .input.is-active, .textarea:focus, .textarea.is-focused, .textarea:active, .textarea.is-active {
    border-color: $brand-color;
}

</style>