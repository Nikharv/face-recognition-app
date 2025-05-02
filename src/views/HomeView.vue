<script lang="ts">
import { defineComponent } from 'vue';
import CameraComponent from '../components/CameraComponent.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    CameraComponent,
  },
});
</script>

<template>
  <div class="home">
    <CameraComponent />
  </div>
</template>

<style scoped>
.home {
  padding: 20px;
}
</style>
