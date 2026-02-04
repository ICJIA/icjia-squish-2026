'use client'

import React, { useCallback, useState, useRef, useEffect } from 'react'
import { Download, X, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

interface CompressedImage {
  id: string
  originalFile: File
  originalSize: number
  compressedBlob: Blob | null
  compressedSize: number
  previewUrl: string
  compressedUrl: string | null
}

function ComparisonSlider({ originalUrl, compressedUrl, originalSize, compressedSize }: {
  originalUrl: string
  compressedUrl: string
  originalSize: number
  compressedSize: number
}) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
  }

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(percentage)
  }, [])

  const handleMouseDown = useCallback(() => {
    isDragging.current = true
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX)
    }
  }, [handleMove])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }, [handleMove])

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full cursor-ew-resize select-none overflow-hidden rounded-lg bg-muted"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* Original Image (full, underneath) */}
      <img
        src={originalUrl || '/placeholder.svg'}
        alt="Original"
        className="absolute inset-0 h-full w-full object-contain"
        draggable={false}
      />

      {/* Compressed Image (clipped, on top) - using clip-path for precise reveal */}
      <img
        src={compressedUrl || '/placeholder.svg'}
        alt="Compressed"
        className="absolute inset-0 h-full w-full object-contain"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        draggable={false}
      />

      {/* Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary bg-background shadow-lg">
          <ChevronLeft className="h-4 w-4 -mr-1 text-primary" />
          <ChevronRight className="h-4 w-4 -ml-1 text-primary" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 rounded bg-background/90 px-2 py-1 text-xs font-medium text-primary backdrop-blur-sm">
        Compressed:
        {' '}
        {formatSize(compressedSize)}
      </div>
      <div className="absolute top-3 right-3 rounded bg-background/90 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
        Original:
        {' '}
        {formatSize(originalSize)}
      </div>
    </div>
  )
}

function QualityIndicator({ quality, savings }: { quality: number, savings: number }) {
  const getQualityAssessment = () => {
    if (quality >= 85) {
      return {
        label: 'Excellent',
        description: 'Virtually no visible quality loss. Best for print or high-detail images.',
        color: 'text-primary',
      }
    }
    if (quality >= 70) {
      return {
        label: 'Recommended',
        description: 'Optimal balance of quality and file size. Perfect for web and blogs.',
        color: 'text-primary',
      }
    }
    if (quality >= 50) {
      return {
        label: 'Good',
        description: 'Noticeable compression on close inspection. Good for thumbnails or previews.',
        color: 'text-yellow-400',
      }
    }
    return {
      label: 'Aggressive',
      description: 'Visible artifacts likely. Use only when file size is critical.',
      color: 'text-orange-400',
    }
  }

  const assessment = getQualityAssessment()

  return (
    <div className="rounded-lg border border-border bg-card/50 p-4">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${assessment.color}`}>
          {assessment.label}
        </span>
        {savings > 0 && (
          <span className="text-sm text-muted-foreground">
            {savings}
            % smaller
          </span>
        )}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {assessment.description}
      </p>
    </div>
  )
}

export function ImageCompressor() {
  const [images, setImages] = useState<CompressedImage[]>([])
  const [quality, setQuality] = useState([75])
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)

  const compressImage = useCallback(
    async (file: File, compressionQuality: number): Promise<{ blob: Blob, url: string }> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob)
                resolve({ blob, url })
              }
              else {
                reject(new Error('Could not compress image'))
              }
            },
            'image/jpeg',
            compressionQuality / 100,
          )
        }

        img.onerror = () => reject(new Error('Could not load image'))
        img.src = URL.createObjectURL(file)
      })
    },
    [],
  )

  const processImages = useCallback(
    async (files: File[]) => {
      setIsCompressing(true)

      const newImages: CompressedImage[] = []

      for (const file of files) {
        if (!file.type.startsWith('image/')) continue

        const id = crypto.randomUUID()
        const previewUrl = URL.createObjectURL(file)

        try {
          const { blob, url } = await compressImage(file, quality[0])
          newImages.push({
            id,
            originalFile: file,
            originalSize: file.size,
            compressedBlob: blob,
            compressedSize: blob.size,
            previewUrl,
            compressedUrl: url,
          })
        }
        catch {
          newImages.push({
            id,
            originalFile: file,
            originalSize: file.size,
            compressedBlob: null,
            compressedSize: 0,
            previewUrl,
            compressedUrl: null,
          })
        }
      }

      setImages(prev => [...prev, ...newImages])
      if (newImages.length > 0 && !selectedImageId) {
        setSelectedImageId(newImages[0].id)
      }
      setIsCompressing(false)
    },
    [compressImage, quality, selectedImageId],
  )

  const recompressAll = useCallback(async () => {
    if (images.length === 0) return

    setIsCompressing(true)

    const recompressed = await Promise.all(
      images.map(async (img) => {
        try {
          if (img.compressedUrl) {
            URL.revokeObjectURL(img.compressedUrl)
          }
          const { blob, url } = await compressImage(img.originalFile, quality[0])
          return {
            ...img,
            compressedBlob: blob,
            compressedSize: blob.size,
            compressedUrl: url,
          }
        }
        catch {
          return img
        }
      }),
    )

    setImages(recompressed)
    setIsCompressing(false)
  }, [images, compressImage, quality])

  // Real-time recompression when quality changes (debounced)
  const qualityRef = useRef(quality[0])
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const imagesRef = useRef(images)

  // Keep imagesRef in sync
  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    // Skip if quality hasn't actually changed or no images
    if (qualityRef.current === quality[0]) {
      return
    }

    if (imagesRef.current.length === 0) {
      qualityRef.current = quality[0]
      return
    }

    console.log('[v0] Quality changed from', qualityRef.current, 'to', quality[0])
    qualityRef.current = quality[0]

    // Clear any pending recompression
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Debounce recompression for 150ms to allow smooth slider interaction
    debounceTimerRef.current = setTimeout(async () => {
      console.log('[v0] Starting recompression at quality:', quality[0])
      setIsCompressing(true)

      const currentImages = imagesRef.current
      const recompressed = await Promise.all(
        currentImages.map(async (img) => {
          try {
            if (img.compressedUrl) {
              URL.revokeObjectURL(img.compressedUrl)
            }
            const { blob, url } = await compressImage(img.originalFile, quality[0])
            console.log('[v0] Recompressed', img.originalFile.name, 'new size:', blob.size)
            return {
              ...img,
              compressedBlob: blob,
              compressedSize: blob.size,
              compressedUrl: url,
            }
          }
          catch {
            return img
          }
        }),
      )

      setImages(recompressed)
      setIsCompressing(false)
      console.log('[v0] Recompression complete')
    }, 150)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [quality, compressImage])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files).filter(f =>
        f.type.startsWith('image/'),
      )
      if (files.length > 0) {
        processImages(files)
      }
    },
    [processImages],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files) {
        processImages(Array.from(files))
      }
      e.target.value = ''
    },
    [processImages],
  )

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find(i => i.id === id)
      if (img) {
        URL.revokeObjectURL(img.previewUrl)
        if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl)
      }
      const filtered = prev.filter(i => i.id !== id)
      if (selectedImageId === id) {
        setSelectedImageId(filtered[0]?.id || null)
      }
      return filtered
    })
  }, [selectedImageId])

  const clearAll = useCallback(() => {
    for (const img of images) {
      URL.revokeObjectURL(img.previewUrl)
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl)
    }
    setImages([])
    setSelectedImageId(null)
  }, [images])

  const downloadImage = useCallback((img: CompressedImage) => {
    if (!img.compressedUrl || !img.compressedBlob) return

    const link = document.createElement('a')
    const originalName = img.originalFile.name
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName
    link.download = `${baseName}-squished.jpg`
    link.href = img.compressedUrl
    link.click()
  }, [])

  const downloadAll = useCallback(() => {
    for (const img of images) {
      if (img.compressedUrl && img.compressedBlob) {
        downloadImage(img)
      }
    }
  }, [images, downloadImage])

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
  }

  const getSavings = (original: number, compressed: number) => {
    if (original === 0) return 0
    return Math.round(((original - compressed) / original) * 100)
  }

  const totalOriginal = images.reduce((acc, img) => acc + img.originalSize, 0)
  const totalCompressed = images.reduce((acc, img) => acc + img.compressedSize, 0)
  const totalSavings = getSavings(totalOriginal, totalCompressed)

  const selectedImage = images.find(img => img.id === selectedImageId)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
            Squish
          </h1>
          <span className="hidden text-sm tracking-wide text-muted-foreground sm:block">
            Image compression for writers
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        {/* Intro Section */}
        <div className="mb-16 max-w-xl">
          <p className="text-xl leading-relaxed text-muted-foreground">
            Drop your images below to compress them instantly. Drag the slider on the preview
            to compare original and compressed versions side by side.
          </p>
        </div>

        <div className="grid gap-16 xl:grid-cols-[1fr,400px]">
          {/* Left Column */}
          <div className="space-y-10">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed transition-all duration-200 ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Select images to compress"
              />
              <div className="flex flex-col items-center gap-4 px-8 text-center">
                <ImageIcon className={`h-8 w-8 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className={`text-lg font-medium transition-colors ${isDragging ? 'text-primary' : 'text-foreground'}`}>
                    {isDragging ? 'Release to squish' : 'Drop images here'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or click to browse — PNG and JPG supported
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison Preview */}
            {selectedImage && selectedImage.compressedUrl && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Preview Comparison</h2>
                  <p className="text-sm text-muted-foreground">Drag slider to compare</p>
                </div>
                <ComparisonSlider
                  originalUrl={selectedImage.previewUrl}
                  compressedUrl={selectedImage.compressedUrl}
                  originalSize={selectedImage.originalSize}
                  compressedSize={selectedImage.compressedSize}
                />
              </div>
            )}

            {/* Image Thumbnails */}
            {images.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    {images.length}
                    {' '}
                    {images.length === 1 ? 'image' : 'images'}
                  </h2>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Clear all
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {images.map((img) => {
                    const savings = getSavings(img.originalSize, img.compressedSize)
                    const isSelected = selectedImageId === img.id
                    return (
                      <div
                        key={img.id}
                        className={`group relative cursor-pointer overflow-hidden rounded border-2 transition-all ${
                          isSelected ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
                        }`}
                        onClick={() => setSelectedImageId(img.id)}
                        onKeyDown={e => e.key === 'Enter' && setSelectedImageId(img.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="aspect-square bg-muted">
                          <img
                            src={img.compressedUrl || img.previewUrl}
                            alt={img.originalFile.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Savings Badge */}
                        {savings > 0 && (
                          <div className="absolute top-2 left-2 rounded bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
                            -
                            {savings}
                            %
                          </div>
                        )}

                        {/* Hover Actions */}
                        <div className="absolute inset-0 flex items-center justify-center gap-1 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              downloadImage(img)
                            }}
                            disabled={!img.compressedBlob}
                            className="rounded p-2 text-foreground transition-colors hover:bg-muted"
                            aria-label="Download"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(img.id)
                            }}
                            className="rounded p-2 text-foreground transition-colors hover:bg-muted"
                            aria-label="Remove"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        {/* File info */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-2 pt-6">
                          <p className="truncate text-xs text-foreground">
                            {formatSize(img.compressedSize)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-8">
            {/* Quality Control */}
            <div className="space-y-6 rounded border border-border bg-card p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Quality
                </h3>
                <span className="text-4xl font-black tabular-nums text-primary">
                  {quality[0]}
                  %
                </span>
              </div>

              <Slider
                value={quality}
                onValueChange={setQuality}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>

              <QualityIndicator
                quality={quality[0]}
                savings={totalSavings}
              />
            </div>

            {/* Stats */}
            {images.length > 0 && (
              <div className="space-y-6 rounded border border-border bg-card p-6">
                <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Original</span>
                    <span className="font-medium text-foreground">{formatSize(totalOriginal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Compressed</span>
                    <span className="font-medium text-foreground">{formatSize(totalCompressed)}</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">Saved</span>
                      <div className="text-right">
                        <span className="text-3xl font-black text-primary">
                          {totalSavings}
                          %
                        </span>
                        <p className="text-sm text-muted-foreground">
                          {formatSize(totalOriginal - totalCompressed)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={downloadAll}
                  className="flex w-full items-center justify-center gap-2 rounded bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Download className="h-5 w-5" />
                  Download all
                </button>
              </div>
            )}

            {/* Loading */}
            {isCompressing && (
              <div className="flex items-center justify-center gap-3 rounded border border-border bg-card p-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
                <span className="text-sm text-muted-foreground">Compressing...</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <p className="text-sm text-muted-foreground">
            All processing happens locally in your browser. Your images never leave your device.
          </p>
        </div>
      </footer>
    </div>
  )
}
