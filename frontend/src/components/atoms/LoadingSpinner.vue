<template>
  <span class="spinner"></span>
</template>

<style scoped lang="scss">
// https://cssloaders.github.io/
.spinner {
  box-sizing: border-box;
  display: inline-block;
  width: 48px;
  height: 48px;
  border: 5px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
