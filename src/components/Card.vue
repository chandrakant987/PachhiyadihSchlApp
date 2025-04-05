<template>
    <div class="card" @mouseover="onHover" @mouseleave="onLeave">
      <h3>{{ title }}</h3>
      <slot></slot>
      <a v-if="link" :href="link" target="_blank">Click Here</a>
    </div>
  </template>
  
  <script scoped>
  export default {
    props: {
      title: String,
      link: String
    },
    methods: {
      onHover() {
        this.$emit("hover");
      },
      onLeave() {
        this.$emit("leave");
      }
    }
  };
  </script>
  
  <style>
  .card {
    border: 1px solid #ccc;
    padding: 10px;
    text-align: center;
    cursor: pointer;
  }
  </style>
  