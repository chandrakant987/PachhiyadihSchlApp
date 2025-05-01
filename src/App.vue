// App.vue
<template>
  <div id="app">
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else>
      <Navbar @show-signin="openSignIn" />
      <main>
        <router-view></router-view>
        <SignInOverlay v-if="showSignIn" @close="closeSignIn" />
      </main>
    </div>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
import SignInOverlay from './components/SignInOverlay.vue';
import { authService } from './services/auth';

export default {
  components: {
    Navbar,
    SignInOverlay,
  },
  data() {
    return {
      showSignIn: false,
      isLoading: true,
    }
  },
  methods: {
    openSignIn() {
      this.showSignIn = true;
    },
    closeSignIn() {
      this.showSignIn = false;
    }
  },
  async created() {
    await authService.initialize(); // Wait for auth state to resolve
    this.isLoading = false;
  },
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  background-color: #f4f4f9;
}

</style>