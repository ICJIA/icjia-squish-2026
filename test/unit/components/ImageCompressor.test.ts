import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageCompressor from '~/components/ImageCompressor.vue'
import { useImageCompression } from '~/composables/useImageCompression'
import { mockPngFile, mockJpgFile, createMockBlob } from '../../fixtures/mock-files'
import { mockCanvasToBlob, createMockImage, mockImageConstructor } from '../../helpers/canvas-mock'
import { flushPromises } from '../../helpers/component-utils'

// Get references to the mocked functions from the global mock (defined in test/setup.ts)
const { compressImage: mockCompressImage, formatSize: mockFormatSize, getSavings: mockGetSavings, getFileExtension: mockGetFileExtension, validateFile: mockValidateFile } = useImageCompression()

const stubs = {
  UIcon: true,
  USlider: true,
  LazyComparisonSlider: true,
  QualityIndicator: true,
  NuxtLink: true,
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

    it('should accept PNG, JPG, WebP, AVIF and HEIC files', () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const input = wrapper.find('input[type="file"]')
      expect(input.attributes('accept')).toBe('image/png,image/jpeg,image/webp,image/avif,image/heic,image/heif,.heic,.heif')
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

      expect(mockCompressImage).toHaveBeenCalledWith(file, 75, 'original', { maxDimension: 0 })
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

      expect(mockCompressImage).toHaveBeenCalledWith(file, 75, 'original', { maxDimension: 0 })
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

    it('should remove an image that failed to compress', async () => {
      mockCompressImage.mockRejectedValue(new Error('Compression failed'))

      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const input = wrapper.find('input[type="file"]')
      Object.defineProperty(input.element, 'files', {
        value: [mockJpgFile('photo.jpg')],
        writable: false,
      })

      await input.trigger('change')
      await flushPromises()

      const vm = wrapper.vm as unknown as { images: unknown[], selectedImageId: string | null }
      expect(vm.images).toHaveLength(0)
      expect(vm.selectedImageId).toBeNull()
    })

    it('should pass the chosen format and size limit to the compressor', async () => {
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const file = mockPngFile('diagram.png')
      const input = wrapper.find('input[type="file"]')
      Object.defineProperty(input.element, 'files', { value: [file], writable: false })
      await input.trigger('change')
      await flushPromises()

      await wrapper.find('#output-format').setValue('image/webp')
      await wrapper.find('#max-dimension').setValue('1600')
      await new Promise(resolve => setTimeout(resolve, 250))

      expect(mockCompressImage).toHaveBeenLastCalledWith(file, 75, 'image/webp', { maxDimension: 1600 })
    })

    it('should explain that the quality slider does not change PNG output', async () => {
      mockCompressImage.mockResolvedValue({
        blob: createMockBlob(800, 'image/png'),
        url: 'blob:compressed-url',
        format: 'image/png',
      })
      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const input = wrapper.find('input[type="file"]')
      Object.defineProperty(input.element, 'files', { value: [mockPngFile('diagram.png')], writable: false })
      await input.trigger('change')
      await flushPromises()

      expect(wrapper.text()).toContain('the quality slider does not change PNG files')
    })

    it('should add a pasted picture', async () => {
      const wrapper = mount(ImageCompressor, { global: { stubs }, attachTo: document.body })
      const file = mockPngFile('image.png')
      const event = new Event('paste') as Event & { clipboardData: unknown }
      event.clipboardData = { files: [file] }
      window.dispatchEvent(event)
      await flushPromises()

      const vm = wrapper.vm as unknown as { images: unknown[] }
      expect(vm.images).toHaveLength(1)
      wrapper.unmount()
    })

    it('should never add a file that fails validation', async () => {
      mockValidateFile.mockImplementationOnce(() => {
        throw new Error('photo.heic has unsupported type "image/heic". Use PNG, JPG, or WebP.')
      })

      const wrapper = mount(ImageCompressor, { global: { stubs } })
      const input = wrapper.find('input[type="file"]')
      Object.defineProperty(input.element, 'files', {
        value: [mockJpgFile('photo.heic')],
        writable: false,
      })

      await input.trigger('change')
      await flushPromises()

      const vm = wrapper.vm as unknown as { images: unknown[] }
      expect(vm.images).toHaveLength(0)
      expect(mockCompressImage).not.toHaveBeenCalled()
      expect(wrapper.find('[role="alert"]').text()).toContain('unsupported type')
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
