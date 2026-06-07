import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageCompressor from '~/components/ImageCompressor.vue'
import { useImageCompression } from '~/composables/useImageCompression'
import { mockPngFile, mockJpgFile, createMockBlob } from '../../fixtures/mock-files'
import { mockCanvasToBlob, createMockImage, mockImageConstructor } from '../../helpers/canvas-mock'
import { flushPromises } from '../../helpers/component-utils'

// Get references to the mocked functions from the global mock (defined in test/setup.ts)
const { compressImage: mockCompressImage, formatSize: mockFormatSize, getSavings: mockGetSavings, getFileExtension: mockGetFileExtension } = useImageCompression()

const stubs = {
  UIcon: true,
  USlider: true,
  LazyComparisonSlider: true,
  QualityIndicator: true,
}

describe('ImageCompressor', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set up default mock implementations
    mockCompressImage.mockResolvedValue({
      blob: createMockBlob(800, 'image/jpeg'),
      url: 'blob:compressed-url',
      format: 'image/jpeg',
    })

    mockFormatSize.mockImplementation((bytes: number) => `${bytes} B`)
    mockGetSavings.mockImplementation((original: number, compressed: number) =>
      Math.round(((original - compressed) / original) * 100),
    )
    mockGetFileExtension.mockImplementation((format: string) =>
      format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg',
    )

    // Mock canvas and image
    const mockImg = createMockImage()
    mockImageConstructor(mockImg)
    mockCanvasToBlob(createMockBlob(800, 'image/jpeg'))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('component rendering', () => {
    it('should render header with title', () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      expect(wrapper.text()).toContain('Squish')
    })

    it('should render file upload area', () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      expect(wrapper.text()).toContain('Drop images here')
      expect(wrapper.find('input[type="file"]').exists()).toBe(true)
    })

    it('should accept PNG, JPG, and WebP files', () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('accept')).toBe('image/png,image/jpeg,image/jpg,image/webp')
      expect(input.attributes('multiple')).toBeDefined()
    })

    it('should render quality slider with default value of 75', () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      expect(wrapper.text()).toContain('75%')
    })

    it('should render GitHub link', () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const githubLink = wrapper.find('a[href="https://github.com/ICJIA/icjia-squish-2026"]')
      expect(githubLink.exists()).toBe(true)
    })
  })

  describe('file upload via click', () => {
    it('should process file when selected via input', async () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const file = mockJpgFile()
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', {
        value: [file],
        writable: false,
      })

      await input.trigger('change')
      await flushPromises()

      expect(mockCompressImage).toHaveBeenCalledWith(file, 75)
    })
  })

  describe('drag and drop', () => {
    it('should handle drag over event', async () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const dropZone = wrapper.find('[class*="border-dashed"]')
      await dropZone.trigger('dragover')
      expect(wrapper.text()).toContain('Release to squish')
    })

    it('should handle drag leave event', async () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const dropZone = wrapper.find('[class*="border-dashed"]')
      await dropZone.trigger('dragover')
      expect(wrapper.text()).toContain('Release to squish')

      await dropZone.trigger('dragleave')
      expect(wrapper.text()).toContain('Drop images here')
    })

    it('should process files on drop', async () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const file = mockJpgFile()
      const dropZone = wrapper.find('[class*="border-dashed"]')

      await dropZone.trigger('drop', { dataTransfer: { files: [file] } })
      await flushPromises()

      expect(mockCompressImage).toHaveBeenCalledWith(file, 75)
    })
  })

  describe('image state management', () => {
    it('should add image to images array on upload', async () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const file = mockJpgFile('photo.jpg')
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', {
        value: [file],
        writable: false,
      })

      await input.trigger('change')
      await flushPromises()

      expect(wrapper.vm.images).toHaveLength(1)
      expect(wrapper.vm.images[0].originalFile).toStrictEqual(file)
    })

    it('should set first uploaded image as selected', async () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const file = mockJpgFile()
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', {
        value: [file],
        writable: false,
      })

      await input.trigger('change')
      await flushPromises()

      expect(wrapper.vm.selectedImageId).toBeTruthy()
      expect(wrapper.vm.selectedImage).toBeTruthy()
    })

    it('should handle multiple file uploads', async () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const files = [mockJpgFile('photo1.jpg'), mockPngFile('photo2.png')]
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', {
        value: files,
        writable: false,
      })

      await input.trigger('change')
      await flushPromises()

      expect(wrapper.vm.images).toHaveLength(2)
      expect(mockCompressImage).toHaveBeenCalledTimes(2)
    })
  })

  describe('compression', () => {
    it('should show compressing state during compression', async () => {
      let resolveCompression: (value: any) => void
      mockCompressImage.mockReturnValue(
        new Promise((resolve) => {
          resolveCompression = resolve
        }),
      )

      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const file = mockJpgFile()
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', {
        value: [file],
        writable: false,
      })

      await input.trigger('change')
      await flushPromises()

      expect(wrapper.text()).toContain('Compressing...')

      resolveCompression!({
        blob: createMockBlob(800, 'image/jpeg'),
        url: 'blob:compressed-url',
        format: 'image/jpeg',
      })

      await flushPromises()

      expect(wrapper.text()).not.toContain('Compressing...')
    })

    it('should handle compression failure with error message', async () => {
      mockCompressImage.mockRejectedValue(new Error('Compression failed'))

      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const file = mockJpgFile('photo.jpg')
      const input = wrapper.find('input[type="file"]')

      Object.defineProperty(input.element, 'files', {
        value: [file],
        writable: false,
      })

      await input.trigger('change')
      await flushPromises()

      expect(wrapper.text()).toContain('Failed to compress photo.jpg')
    })
  })

  describe('accessibility', () => {
    it('should have aria-label on file input', () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('aria-label')).toBe('Select images to compress')
    })

    it('should have quality heading for screen readers', () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const heading = wrapper.find('#quality-heading')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toContain('Quality')
    })
  })
})
