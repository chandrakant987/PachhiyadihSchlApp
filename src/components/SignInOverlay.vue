<template>
    <div class="overlay">
      <div class="modal">
        <button class="close-button" @click="$emit('close')">✖</button>
        <h2>Sign In</h2>
        <form @submit.prevent="signIn">
          <input v-model="email" type="email" placeholder="EmailId" required />
          <input v-model="password" type="password" placeholder="Password" required />
          <button type="submit" :disabled="loading">
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>
          <p class="error" v-if="error">{{ error }}</p>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { authService } from "../services/auth"
  
  export default {
    name: 'SignInOverlay',
    data() {
      return {
        email: '',
        password: '',
        error: '',
        loading: false,
        showOverlay: true,
      };
    },
    methods: {
      async signIn() {
        this.loading = true;
        this.error = '';
        try {
          const success = await authService.signIn(this.email, this.password);
          if (success) {
            this.showOverlay = false;
            this.error = null;
            const role = authService.currentRole;
            if (role === 'admin') {
              this.$router.push('/admin');
            } else if (role === 'student') {
              this.$router.push('/student-page');
            } else if (role === 'teacher') {
              this.$router.push('/teacher');
            } else {
              this.$router.push('/'); // Default for public or other roles
            }
          } else {
            this.error = authService.error;
          }
          this.$emit('close');
        } catch (err) {
          this.error = err.message;
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>
  
  
  <style scoped>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  }
  
  .close-button {
    position: absolute;
    top: 8px;
    right: 12px;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
  }
  
  form {
    display: flex;
    flex-direction: column;
  }
  
  input {
    padding: 0.8rem;
    margin: 0.5rem 0;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
  }
  
  button[type="submit"] {
    padding: 0.8rem;
    background-color: #004080;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    margin-top: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  button[type="submit"]:hover {
    background-color: #002f5f;
  }
  
  .error {
    color: #e53e3e;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }
  </style>
  