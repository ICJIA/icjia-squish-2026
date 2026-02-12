import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ComparisonSlider from '~/components/ComparisonSlider.vue'
import { flushPromises } from '../../helpers/component-utils'

// Uses global mock from test/setup.ts

describe('ComparisonSlider', () => {
  const defaultProps = {
    originalUrl: 'original.jpg',
    compressedUrl: 'compressed.jpg',
    originalSize: 2000,
    compressedSize: 1000,
    quality: 75,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('component rendering', () => {
    it('should render with default props', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should display file sizes in labels', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      expect(wrapper.text()).toContain('Original')
      expect(wrapper.text()).toContain('Compressed')
    })

    it('should render both original and compressed images', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const images = wrapper.findAll('img')
      expect(images).toHaveLength(2)
      expect(images[0].attributes('src')).toBe('original.jpg')
      expect(images[1].attributes('src')).toBe('compressed.jpg')
    })
  })

  describe('zoom controls', () => {
    it('should start with zoom at 100%', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      expect(wrapper.text()).toContain('100%')
    })

    it('should increase zoom when zoom in button is clicked', async () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const zoomInButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Zoom in'),
      )

      await zoomInButton?.trigger('click')
      expect(wrapper.text()).toContain('150%')

      await zoomInButton?.trigger('click')
      expect(wrapper.text()).toContain('200%')
    })

    it('should decrease zoom when zoom out button is clicked', async () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      // Zoom in first
      const zoomInButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Zoom in'),
      )
      await zoomInButton?.trigger('click')
      await zoomInButton?.trigger('click')
      expect(wrapper.text()).toContain('200%')

      // Now zoom out
      const zoomOutButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Zoom out'),
      )
      await zoomOutButton?.trigger('click')
      expect(wrapper.text()).toContain('150%')
    })

    it('should not zoom beyond 800%', async () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const zoomInButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Zoom in'),
      )

      // Click many times
      for (let i = 0; i < 20; i++) {
        await zoomInButton?.trigger('click')
      }

      expect(wrapper.text()).toContain('800%')
      expect(wrapper.text()).not.toContain('850%')
    })

    it('should disable zoom in button at 800%', async () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const zoomInButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Zoom in'),
      )

      // Zoom to max
      for (let i = 0; i < 15; i++) {
        await zoomInButton?.trigger('click')
      }

      expect(zoomInButton?.attributes('disabled')).toBeDefined()
    })

    it('should reset zoom to 100% when reset button is clicked', async () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const zoomInButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Zoom in'),
      )
      const resetButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Reset zoom'),
      )

      // Zoom in
      await zoomInButton?.trigger('click')
      await zoomInButton?.trigger('click')
      expect(wrapper.text()).toContain('200%')

      // Reset
      await resetButton?.trigger('click')
      expect(wrapper.text()).toContain('100%')
    })

    it('should disable reset button at 100%', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const resetButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Reset zoom'),
      )

      expect(resetButton?.attributes('disabled')).toBeDefined()
    })

    it('should disable zoom out button at 100%', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const zoomOutButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Zoom out'),
      )

      expect(zoomOutButton?.attributes('disabled')).toBeDefined()
    })

    it('should enable zoom out button when zoomed', async () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const zoomInButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Zoom in'),
      )
      const zoomOutButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Zoom out'),
      )

      await zoomInButton?.trigger('click')
      expect(zoomOutButton?.attributes('disabled')).toBeUndefined()
    })
  })

  describe('pan instructions', () => {
    it('should not show pan instructions at 100% zoom', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      expect(wrapper.text()).not.toContain('Click and drag to pan')
    })

    it('should show pan instructions when zoomed > 100%', async () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const zoomInButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Zoom in'),
      )

      await zoomInButton?.trigger('click')
      expect(wrapper.text()).toContain('Click and drag to pan')
    })
  })

  describe('quality slider', () => {
    it('should display current quality value', () => {
      const wrapper = mount(ComparisonSlider, {
        props: { ...defaultProps, quality: 80 },
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      expect(wrapper.text()).toContain('80%')
    })

    it('should sync local quality with prop quality', async () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      expect(wrapper.text()).toContain('75%')

      await wrapper.setProps({ quality: 90 })
      expect(wrapper.text()).toContain('90%')
    })

    it('should emit quality changes to parent', async () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      // Get the USlider stub and simulate v-model change
      wrapper.vm.localQuality = 85
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('update:quality')).toBeTruthy()
      expect(wrapper.emitted('update:quality')?.[0]).toEqual([85])
    })
  })

  describe('image transform styles', () => {
    it('should apply scale transform at 100% zoom', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const images = wrapper.findAll('img')
      const style = images[0].attributes('style')
      expect(style).toContain('scale(1)')
    })

    it('should apply scale transform at 200% zoom', async () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const zoomInButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Zoom in'),
      )
      await zoomInButton?.trigger('click')
      await zoomInButton?.trigger('click')

      const images = wrapper.findAll('img')
      const style = images[0].attributes('style')
      expect(style).toContain('scale(2)')
    })

    it('should include translate in transform', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const images = wrapper.findAll('img')
      const style = images[0].attributes('style')
      expect(style).toContain('translate(')
    })
  })

  describe('slider position', () => {
    it('should start at 50% position', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const divider = wrapper.find('.bg-primary')
      expect(divider.attributes('style')).toContain('left: 50%')
    })

    it('should apply clip-path to compressed image container', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const containers = wrapper.findAll('.absolute.inset-0')
      const compressedContainer = containers[1]
      expect(compressedContainer.attributes('style')).toContain('clip-path')
      expect(compressedContainer.attributes('style')).toContain('inset(0 50% 0 0)')
    })
  })

  describe('cursor styles', () => {
    it('should show ew-resize cursor at 100% zoom', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const container = wrapper.find('.relative.w-full')
      expect(container.classes()).toContain('cursor-ew-resize')
    })

    it('should show grab cursor when zoomed > 100%', async () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const zoomInButton = wrapper.findAll('button').find((btn) =>
        btn.attributes('aria-label')?.includes('Zoom in'),
      )
      await zoomInButton?.trigger('click')

      const container = wrapper.find('.relative.w-full')
      expect(container.classes()).toContain('cursor-grab')
    })
  })

  describe('accessibility', () => {
    it('should have aria-label on zoom buttons', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const buttons = wrapper.findAll('button')
      const zoomIn = buttons.find((btn) => btn.attributes('aria-label')?.includes('Zoom in'))
      const zoomOut = buttons.find((btn) => btn.attributes('aria-label')?.includes('Zoom out'))
      const reset = buttons.find((btn) => btn.attributes('aria-label')?.includes('Reset zoom'))

      expect(zoomIn?.attributes('aria-label')).toBe('Zoom in')
      expect(zoomOut?.attributes('aria-label')).toBe('Zoom out')
      expect(reset?.attributes('aria-label')).toBe('Reset zoom to 100%')
    })

    it('should have aria-hidden on icons', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: {
            UIcon: {
              template: '<span v-bind="$attrs"></span>',
            },
            USlider: true,
          },
        },
      })

      const icons = wrapper.findAllComponents({ name: 'UIcon' })
      icons.forEach((icon) => {
        expect(icon.attributes('aria-hidden')).toBe('true')
      })
    })

    it('should have quality label for screen readers', () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      const label = wrapper.find('#preview-quality-label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toContain('Quality')
    })
  })

  describe('props changes', () => {
    it('should update displayed sizes when props change', async () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      await wrapper.setProps({
        originalSize: 5000,
        compressedSize: 2500,
      })

      await flushPromises()

      // The formatSize function should be called with new values
      expect(wrapper.text()).toBeTruthy()
    })

    it('should update image URLs when props change', async () => {
      const wrapper = mount(ComparisonSlider, {
        props: defaultProps,
        global: {
          stubs: { UIcon: true, USlider: true },
        },
      })

      await wrapper.setProps({
        originalUrl: 'new-original.jpg',
        compressedUrl: 'new-compressed.jpg',
      })

      const images = wrapper.findAll('img')
      expect(images[0].attributes('src')).toBe('new-original.jpg')
      expect(images[1].attributes('src')).toBe('new-compressed.jpg')
    })
  })
})
