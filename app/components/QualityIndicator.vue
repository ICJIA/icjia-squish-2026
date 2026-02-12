<template>
  <div class="rounded-lg border border-border bg-card/50 p-4">
    <div class="flex items-center justify-between">
      <span
        :class="`text-sm font-semibold ${assessment.color}`"
        :style="assessment.style"
      >
        {{ assessment.label }}
      </span>
      <span
        v-if="savings > 0"
        class="text-sm text-muted-foreground"
      >
        {{ savings }}% smaller
      </span>
    </div>
    <p class="mt-1 text-xs leading-relaxed text-muted-foreground">
      {{ assessment.description }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  quality: number
  savings: number
}>()

const assessment = computed(() => {
  if (props.quality >= 85) {
    return {
      label: 'Excellent',
      description: 'Virtually no visible quality loss. Best for print or high-detail images.',
      color: 'text-primary',
      style: 'color: #4ade80;', // green-400 for high contrast on dark bg (~7:1 ratio)
    }
  }
  if (props.quality >= 70) {
    return {
      label: 'Recommended',
      description: 'Optimal balance of quality and file size. Perfect for web and blogs.',
      color: 'text-primary',
      style: 'color: #4ade80;', // green-400 for high contrast on dark bg (~7:1 ratio)
    }
  }
  if (props.quality >= 50) {
    return {
      label: 'Good',
      description: 'Noticeable compression on close inspection. Good for thumbnails or previews.',
      color: 'text-yellow-400',
      style: '',
    }
  }
  return {
    label: 'Aggressive',
    description: 'Visible artifacts likely. Use only when file size is critical.',
    color: 'text-orange-400',
    style: '',
  }
})
</script>
