<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Button from '@/components/atoms/Button.vue';
import { useI18n } from 'vue-i18n';
import ComponentDummy from '@/components/organisms/ComponentsDummy.vue';

const i18n = useI18n();
</script>

<template>
  <div class="landing-page">
    <section class="landing-page__hero">
      <div class="landing-page__introduction">
        <h1>Can I CAI?</h1>
        <p>
          {{ i18n.t('landingPage.introduction') }}
        </p>
      </div>
      <div class="landing-page__buttons">
        <RouterLink to="/check" :title="i18n.t('landingPage.checkWorkflow')">
          <Button size="l" full-width>{{ i18n.t('landingPage.checkWorkflow') }}</Button>
        </RouterLink>
        <a
          href="https://contentauthenticity.org/"
          referrerpolicy="no-referrer"
          target="_blank"
          rel="noopener noreferrer"
          :title="i18n.t('landingPage.whatIsCAI')"
        >
          <Button size="l" color="secondary" full-width>{{
            i18n.t('landingPage.whatIsCAI')
          }}</Button>
        </a>
      </div>
    </section>
    <aside class="landing-page__dummy">
      <ComponentDummy />
    </aside>
  </div>
</template>

<style lang="scss">
.landing-page {
  display: grid;
  grid-template-columns: repeat($grid-columns, 1fr);
  gap: $grid-gap;
  align-items: center;
  height: 100%;
  margin: 0 $grid-margin;

  &__hero {
    display: flex;
    flex-flow: column;
    grid-column: 3 / 6;
    gap: $l;

    @media screen and (width <= $bp-tablet) {
      grid-column: 1 / 4;
    }

    @media screen and (width <= $bp-mobile) {
      grid-column: 1 / -1;
    }
  }

  &__dummy {
    display: flex;
    flex-flow: column;
    grid-column: 8 / 10;

    @media screen and (width <= $bp-tablet) {
      grid-column: 5 / 8;
    }

    @media screen and (width <= $bp-mobile) {
      display: none;
    }
  }

  &__introduction,
  &__buttons {
    display: flex;
    flex-flow: column;
    gap: $s;
  }
}
</style>
