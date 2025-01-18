<template>
  <slot />
</template>

<script lang="ts">
import { defineComponent, provide } from 'vue';
import { AssistantService } from '../services/AssistantService';
import { AssistantConfig } from '@foisit/core';

export default defineComponent({
  name: 'AssistantProvider',
  props: {
    config: {
      type: Object as () => AssistantConfig,
      required: true,
    },
  },
  setup(props, { slots }) {
    const assistantService = new AssistantService(props.config);
    provide('assistantService', assistantService);

    return () => slots.default?.();
  },
});
</script>
