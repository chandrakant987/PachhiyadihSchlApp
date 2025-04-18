<template>
    <transition name="fade">
      <div v-if="visible" :class="['snackbar', typeClass]">{{ message }}</div>
    </transition>
  </template>
  
  <script>
  export default {
    props: ['message', 'visible', 'type'],
    computed: {
      // Dynamically set the background color based on the type (success or error)
      typeClass() {
        return this.type === 'success' ? 'success' : 'error';
      }
    }
  };
  </script>
  
  <style scoped>
  /* Basic styles for snackbar */
  .snackbar {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    width: auto;
    max-width: 300px;
    opacity: 1;
    transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
    transform: translateX(-50%) scale(1);
  }
  
  /* Error - red background */
  .error {
    color: red;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
  }
  
  /* Success - green background */
  .success {
    color:green;
    background: #d4edda;
    border: 1px solid #c3e6cb;
  }
  
  /* Fade transition */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 1s ease-in-out, transform 0.5s ease-in-out;
  }
  
  .fade-enter, .fade-leave-to {
    opacity: 0;
    transform: translateX(-50%) scale(0.8);
  }
  </style>
  