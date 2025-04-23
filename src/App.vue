// App.vue
<template>
  <div id="app">
    <Navbar @show-signin="openSignIn" />
    <main>
      <router-view></router-view>
      <SignInOverlay v-if="showSignIn" @close="closeSignIn" />
    </main>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import SignInOverlay from './components/SignInOverlay.vue';

export default {
  components: {
    Navbar,
    SignInOverlay,
  },
  data() {
    return {
      showSignIn: false,
    }
  },
  methods: {
    openSignIn() {
      this.showSignIn = true;
    },
    closeSignIn() {
      this.showSignIn = false;
    }
  }
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  background-color: #f4f4f9;
}

</style>