<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <header>
    <RouterLink to="/">
      <img alt="Can I CAI? Logo" class="logo" src="@/assets/logo.svg" />
    </RouterLink>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style lang="scss">
#app {
  display: flex;
  flex-flow: column;
  width: 100vw;
  height: 100vh;
}

header {
  padding: $s $l;
  border-bottom: 1px solid $lighter;

  .logo {
    height: $l;
  }
}

main {
  flex: 1;
  transform: translate3d(0, 0, 0);
}
</style>
