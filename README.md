# Squish

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.3.x-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5.x-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Nuxt UI](https://img.shields.io/badge/Nuxt_UI-3.0.x-00DC82)](https://ui.nuxt.com/)
[![Nuxt SEO](https://img.shields.io/badge/Nuxt_SEO-3.4.x-00DC82)](https://nuxtseo.com/)

> **Image compression for writers and designers**

A modern, privacy-focused image compression tool built with Nuxt 4. Squish helps writers and designers optimize their images with a beautiful, interactive preview comparison slider and real-time quality adjustments.

![Squish Screenshot](documentation/screenshot.jpg)

## ✨ Features

- **🔒 Privacy First**: All processing happens locally in your browser - your images never leave your device
- **👁️ Live Preview Comparison**: Interactive side-by-side slider to compare original vs compressed images
- **⚡ Real-time Updates**: See compression effects instantly as you adjust quality settings
- **📏 Large Preview Window**: Optimized for wide screens with up to 2000px layout for detailed inspection
- **🎨 Modern UI**: Dark theme with clean, intuitive interface using Nuxt UI components
- **📱 Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **🎯 Smart Quality Control**: Visual indicators and recommendations for optimal compression
- **📦 Batch Processing**: Compress multiple images at once
- **💾 Easy Download**: Download individual images or all at once

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (see `.nvmrc` for exact version)
- yarn or npm

> **Note**: This is a **Nuxt 4** application. Make sure you're using compatible tooling.

### Installation

```bash
# Clone the repository
git clone https://github.com/ICJIA/icjia-squish-2026.git
cd icjia-squish-2026

# Install dependencies
yarn install

# Start development server
yarn dev
```

The app will be available at `http://localhost:3000`

## 📦 Building for Production

```bash
# Generate static site
yarn generate

# Preview production build
yarn preview

# Or build for SSR
yarn build
```

## 🛠️ Tech Stack

- **[Nuxt 4](https://nuxt.com/)** - Latest version of The Intuitive Vue Framework
- **[Vue 3](https://vuejs.org/)** - Progressive JavaScript Framework
- **[Nuxt UI](https://ui.nuxt.com/)** - Fully styled and customizable components
- **[Nuxt SEO](https://nuxtseo.com/)** - Complete SEO solution with sitemap, robots, and meta tags
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **Canvas API** - Client-side image processing
- **Sharp** - High-performance image processing for OG image generation

## 📖 How It Works

1. **Drop or Upload**: Drag and drop images or click to browse
2. **Adjust Quality**: Use the slider to set compression level (10-100%)
3. **Preview Comparison**: Drag the comparison slider to see the difference
4. **Download**: Save individual images or download all at once

### Compression Process

- Images are processed using the HTML5 Canvas API
- Converts to JPEG format with adjustable quality
- Original images remain untouched - new compressed versions are created
- All processing happens client-side for maximum privacy

## 🎨 UI Features

### Preview Comparison Window
- **Large viewing area**: Up to 1630px width on wide screens
- **3:2 aspect ratio**: Optimal for most images
- **Min height**: 700px for comfortable viewing
- **Interactive slider**: Smooth drag-to-compare experience

### Quality Control
- **Visual slider**: Clear track with current value display
- **Quality indicators**: Recommendations based on your settings
- **Real-time stats**: See file size savings instantly
- **Smart defaults**: Starts at 75% quality for optimal balance

## 📁 Project Structure

```
icjia-squish-2026/
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css          # Global styles and theme
│   ├── components/
│   │   ├── ComparisonSlider.vue  # Interactive image comparison
│   │   ├── ImageCompressor.vue   # Main app component
│   │   └── QualityIndicator.vue  # Quality recommendations
│   ├── composables/
│   │   └── useImageCompression.ts # Compression logic
│   ├── pages/
│   │   └── index.vue             # Home page
│   ├── app.config.ts             # App configuration
│   └── app.vue                   # Root component
├── documentation/                # Original Next.js reference code
├── nuxt.config.ts               # Nuxt configuration
├── package.json                 # Dependencies
└── netlify.toml                 # Netlify deployment config
```

## 🎯 Key Components

### `ImageCompressor.vue`
Main component handling image upload, compression, and state management.

### `ComparisonSlider.vue`
Interactive slider for comparing original and compressed images side-by-side.

### `useImageCompression.ts`
Composable providing image compression functionality using Canvas API.

## 🌐 Deployment

This project is configured for deployment on Netlify with Nuxt 4:

```bash
# Build command
yarn generate

# Publish directory
dist
```

The `netlify.toml` file is pre-configured with:
- **Nitro preset**: `netlify-static` for optimal static site generation
- **Output directory**: `dist` (Nuxt 4 custom configuration)
- **Security headers**: X-Frame-Options, CSP, Referrer-Policy
- **Cache headers**: 1-year cache for `/_nuxt/*` assets with immutable flag

### Environment Variables

Set `NODE_VERSION=20` and `NITRO_PRESET=netlify-static` in your Netlify build settings (already configured in `netlify.toml`).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Nuxt](https://nuxt.com/) and [Nuxt UI](https://ui.nuxt.com/)
- Inspired by the need for privacy-focused image tools
- Original Next.js implementation available in `documentation/` folder

## 📧 Contact

ICJIA - Illinois Criminal Justice Information Authority

---

**Made with ❤️ for writers and designers who care about image quality and file size**
