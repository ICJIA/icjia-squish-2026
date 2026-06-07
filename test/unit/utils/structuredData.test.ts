import { describe, it, expect } from 'vitest'
import { buildSquishGraph } from '~/utils/structuredData'

const BUILD_DATE = '2026-06-07T12:00:00.000Z'

describe('buildSquishGraph', () => {
  const graph = buildSquishGraph({ buildDate: BUILD_DATE })
  const nodes = graph['@graph']
  const node = (type: string) => nodes.find(n => n['@type'] === type)

  it('declares the schema.org context', () => {
    expect(graph['@context']).toBe('https://schema.org')
  })

  it('emits a connected @graph with the five core node types', () => {
    const types = nodes.map(n => n['@type'])
    expect(types).toEqual(
      expect.arrayContaining(['Organization', 'Person', 'WebSite', 'WebPage', 'WebApplication']),
    )
  })

  it('credits ICJIA as the publisher Organization', () => {
    expect(node('Organization')).toMatchObject({
      '@id': 'https://squish.icjia.app/#organization',
      'name': 'Illinois Criminal Justice Information Authority',
      'url': 'https://icjia.illinois.gov/',
    })
  })

  it('credits cschweda as the author Person', () => {
    expect(node('Person')).toMatchObject({
      '@id': 'https://squish.icjia.app/#author',
      'name': 'cschweda',
      'url': 'https://github.com/cschweda',
    })
  })

  it('links the WebApplication to author, creator and publisher by reference', () => {
    const app = node('WebApplication')
    expect(app?.author).toEqual({ '@id': 'https://squish.icjia.app/#author' })
    expect(app?.creator).toEqual({ '@id': 'https://squish.icjia.app/#author' })
    expect(app?.publisher).toEqual({ '@id': 'https://squish.icjia.app/#organization' })
  })

  it('describes the WebApplication as a free MultimediaApplication', () => {
    const app = node('WebApplication')
    expect(app?.applicationCategory).toBe('MultimediaApplication')
    expect(app?.isAccessibleForFree).toBe(true)
    expect(app?.offers).toMatchObject({ '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' })
  })

  it('stamps freshness dates, with dateModified driven by the build date', () => {
    for (const type of ['WebPage', 'WebApplication']) {
      expect(node(type)?.datePublished).toBe('2026-02-04')
      expect(node(type)?.dateModified).toBe(BUILD_DATE)
    }
  })
})
