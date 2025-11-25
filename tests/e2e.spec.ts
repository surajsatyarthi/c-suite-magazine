import { test, expect } from '@playwright/test'

const routes = {
  home: '/',
  studio: '/studio',
  category: '/category/cxo-interview',
}

const articles = [
  'angelina-usanova',
  'olga-denysiuk',
  'stoyana-natseva',
  'brianne-howey',
  'dr-basma-ghandourah',
  'erin-krueger',
  'bill-faruki',
  'pankaj-bansal',
  'supreet-nagi',
  'swami-aniruddha',
  'bryce-tully',
  'cal-riley',
  'john-zangardi',
  'bryan-smeltzer',
  'dean-fealk',
  'benjamin-borketey',
]

test.describe('Global smoke', () => {
  test('homepage loads without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto(routes.home, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('body')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('category hub loads', async ({ page }) => {
    await page.goto(routes.category, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /CXO Interview/i })).toBeVisible()
  })
})

test('test-ad route loads', async ({ page }) => {
  await page.goto('/test-ad', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('body')).toBeVisible()
})

test.describe('Articles', () => {
  for (const slug of articles) {
    test(`article ${slug} loads and Trending section renders`, async ({ page }) => {
      const errors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      await page.goto(`/category/cxo-interview/${slug}`, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('article')).toBeVisible()
      await expect(page.locator('text=Trending Now')).toBeVisible()
      expect(errors).toEqual([])
    })
  }
})
