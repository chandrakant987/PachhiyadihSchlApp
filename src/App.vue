// App.vue
<template>
  <div id="app">
    <header>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/admin">Admin</router-link>
      </nav>
    </header>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  background-color: #f4f4f9;
}
nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 15px;
  background: #007bff;
  border-bottom: 3px solid #0056b3;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}
nav a {
  color: white;
  text-decoration: none;
  font-size: 18px;
  padding: 10px 20px;
  border-radius: 5px;
  transition: background 0.3s ease;
}
nav a:hover {
  background: #0056b3;
}
</style>