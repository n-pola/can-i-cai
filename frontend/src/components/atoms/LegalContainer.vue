<template>
  <div class="legal">
    <div class="legal__content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
.legal {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat($grid-columns, 1fr);
  grid-gap: $grid-gap;
  height: calc(100dvh - ($s * 2) - $l - 1px);
  padding: $grid-margin;
  overflow-y: auto;

  h1,
  h2,
  h3,
  h4,
  p {
    margin-bottom: $xs;
    word-break: break-word;
  }

  &__content {
    grid-column: 3 / 9;

    @media screen and (width <= $bp-tablet) {
      grid-column: 1 / 6;
      padding-bottom: calc($s * 2 + $f-xs * $lh-base - $grid-margin);
    }

    @media screen and (width <= $bp-mobile) {
      grid-column: 1 / -1;
    }
  }
}
</style>
