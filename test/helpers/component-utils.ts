import { mount, VueWrapper } from '@vue/test-utils'
import type { Component } from 'vue'

/**
 * Mount a Vue component with common options
 */
export function mountComponent(
  component: Component,
  options: Record<string, any> = {},
): VueWrapper {
  return mount(component, {
    global: {
      stubs: {
        UIcon: true,
        USlider: true,
      },
    },
    ...options,
  })
}

/**
 * Wait for all pending promises and Vue updates
 */
export async function flushPromises() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

/**
 * Trigger an event and wait for updates
 */
export async function triggerAndWait(
  wrapper: VueWrapper,
  selector: string,
  event: string,
  payload?: any,
) {
  await wrapper.find(selector).trigger(event, payload)
  await wrapper.vm.$nextTick()
  await flushPromises()
}
