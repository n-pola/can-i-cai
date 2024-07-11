<template>
  <div class="legal">
    <slot></slot>
  </div>
</template>

<style lang="scss">
.legal {
  box-sizing: border-box;
  height: calc(100vh - ($s * 2) - $l - 1px);
  padding: $grid-margin;
  overflow-y: auto;

  h1,
  h2,
  h3,
  h4,
  p {
    margin-bottom: $xxs;
  }
}
</style>
