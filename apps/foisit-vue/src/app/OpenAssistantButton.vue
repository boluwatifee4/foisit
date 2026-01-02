<script setup lang="ts">
import { useAssistant } from '@foisit/vue-wrapper';

const props = defineProps<{
  label: string;
  variant?: 'primary' | 'secondary';
}>();

const assistant = useAssistant();

const handleClick = () => {
  assistant.toggle();
};
</script>

<template>
  <button
    class="demo-btn"
    :class="{ secondary: variant === 'secondary' }"
    @click="handleClick"
  >
    {{ label }}
  </button>
</template>
