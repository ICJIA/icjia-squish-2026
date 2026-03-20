import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QualityIndicator from '~/components/QualityIndicator.vue'

describe('QualityIndicator', () => {
  describe('assessment logic', () => {
    it('should show "Excellent" for quality >= 85', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 85, savings: 15 },
      })

      expect(wrapper.text()).toContain('Excellent')
      expect(wrapper.text()).toContain('Virtually no visible quality loss')
      expect(wrapper.text()).toContain('Best for print or high-detail images')
    })

    it('should show "Excellent" for quality 100', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 100, savings: 5 },
      })

      expect(wrapper.text()).toContain('Excellent')
    })

    it('should show "Recommended" for quality 70-84', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 75, savings: 30 },
      })

      expect(wrapper.text()).toContain('Recommended')
      expect(wrapper.text()).toContain('Optimal balance of quality and file size')
      expect(wrapper.text()).toContain('Perfect for web and blogs')
    })

    it('should show "Recommended" for quality 70 (boundary)', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 70, savings: 35 },
      })

      expect(wrapper.text()).toContain('Recommended')
    })

    it('should show "Recommended" for quality 84 (boundary)', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 84, savings: 20 },
      })

      expect(wrapper.text()).toContain('Recommended')
    })

    it('should show "Good" for quality 50-69', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 60, savings: 50 },
      })

      expect(wrapper.text()).toContain('Good')
      expect(wrapper.text()).toContain('Noticeable compression on close inspection')
      expect(wrapper.text()).toContain('Good for thumbnails or previews')
    })

    it('should show "Good" for quality 50 (boundary)', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 50, savings: 60 },
      })

      expect(wrapper.text()).toContain('Good')
    })

    it('should show "Good" for quality 69 (boundary)', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 69, savings: 40 },
      })

      expect(wrapper.text()).toContain('Good')
    })

    it('should show "Aggressive" for quality < 50', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 30, savings: 75 },
      })

      expect(wrapper.text()).toContain('Aggressive')
      expect(wrapper.text()).toContain('Visible artifacts likely')
      expect(wrapper.text()).toContain('Use only when file size is critical')
    })

    it('should show "Aggressive" for quality 10 (minimum)', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 10, savings: 90 },
      })

      expect(wrapper.text()).toContain('Aggressive')
    })

    it('should show "Aggressive" for quality 49 (boundary)', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 49, savings: 65 },
      })

      expect(wrapper.text()).toContain('Aggressive')
    })
  })

  describe('color and styling', () => {
    it('should apply green color for "Excellent"', () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 90, savings: 10 },
      })

      const label = wrapper.find('span[class*="font-semibold"]')
      expect(label.attributes('class')).toContain('text-primary')
    })

    it('should apply green color for "Recommended"', () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 75, savings: 30 },
      })

      const label = wrapper.find('span[class*="font-semibold"]')
      expect(label.attributes('class')).toContain('text-primary')
    })

    it('should apply yellow color for "Good"', () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 60, savings: 50 },
      })

      const label = wrapper.find('span[class*="font-semibold"]')
      expect(label.attributes('class')).toContain('text-yellow-400')
    })

    it('should apply orange color for "Aggressive"', () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 30, savings: 75 },
      })

      const label = wrapper.find('span[class*="font-semibold"]')
      expect(label.attributes('class')).toContain('text-orange-400')
    })
  })

  describe('savings display', () => {
    it('should display savings when > 0', () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 75, savings: 45 },
      })

      expect(wrapper.text()).toContain('45% smaller')
    })

    it('should display savings of 1%', () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 75, savings: 1 },
      })

      expect(wrapper.text()).toContain('1% smaller')
    })

    it('should not display savings when 0', () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 75, savings: 0 },
      })

      expect(wrapper.text()).not.toContain('smaller')
    })

    it('should not display savings when negative', () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 75, savings: -10 },
      })

      expect(wrapper.text()).not.toContain('smaller')
    })
  })

  describe('props reactivity', () => {
    it('should update assessment when quality changes', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 90, savings: 10 },
      })

      expect(wrapper.text()).toContain('Excellent')

      await wrapper.setProps({ quality: 60 })
      expect(wrapper.text()).toContain('Good')

      await wrapper.setProps({ quality: 30 })
      expect(wrapper.text()).toContain('Aggressive')
    })

    it('should update savings display when savings changes', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 75, savings: 25 },
      })

      expect(wrapper.text()).toContain('25% smaller')

      await wrapper.setProps({ savings: 50 })
      expect(wrapper.text()).toContain('50% smaller')

      await wrapper.setProps({ savings: 0 })
      expect(wrapper.text()).not.toContain('smaller')
    })

    it('should update both quality and savings simultaneously', async () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 90, savings: 10 },
      })

      expect(wrapper.text()).toContain('Excellent')
      expect(wrapper.text()).toContain('10% smaller')

      await wrapper.setProps({ quality: 50, savings: 60 })
      expect(wrapper.text()).toContain('Good')
      expect(wrapper.text()).toContain('60% smaller')
    })
  })

  describe('component structure', () => {
    it('should render with correct class structure', () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 75, savings: 30 },
      })

      expect(wrapper.find('.rounded-lg').exists()).toBe(true)
      expect(wrapper.find('.border-border').exists()).toBe(true)
      expect(wrapper.find('.bg-card\\/50').exists()).toBe(true)
    })

    it('should have label and description in separate elements', () => {
      const wrapper = mount(QualityIndicator, {
        props: { quality: 75, savings: 30 },
      })

      const label = wrapper.find('span[class*="font-semibold"]')
      const description = wrapper.find('p[class*="text-xs"]')

      expect(label.exists()).toBe(true)
      expect(description.exists()).toBe(true)
    })
  })
})
