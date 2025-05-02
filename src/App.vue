<script lang="ts">
import { defineComponent } from 'vue';
import CameraComponent from './components/CameraComponent.vue';

export default defineComponent({
  name: 'App',
  components: {
    CameraComponent,
  },
});
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Face Recognition App</h1>
    </header>

    <main class="app-main">
      <CameraComponent />
    </main>

    <footer class="app-footer">
      <p>Voicera.io Intern Project</p>
      <p>Using Vue.js and TensorFlow.js</p>
    </footer>
  </div>
</template>

<style>
@import 'bootstrap/dist/css/bootstrap.min.css';

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
}

.app-main {
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
}

.app-footer {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
