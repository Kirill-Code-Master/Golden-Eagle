import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Home from '../src/pages/Home.jsx'

const jsonResponse = (body, options = {}) => ({
  ok: options.ok ?? true,
  status: options.status ?? 200,
  json: async () => body,
})

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Головна сторінка Home', () => {
  const renderHome = () => render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )

  it('показує товар з головної добірки API з назвою, ціною та посиланням на сторінку деталей', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({
      products: [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'Каблучка тестова',
          price: 2500,
          category: 'Каблучки',
          image: '',
          stock: 2,
        },
      ],
    }))

    renderHome()

    expect(await screen.findByText('Каблучка тестова')).toBeInTheDocument()
    expect(screen.getByText('2 500 ₴')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Переглянути' })).toHaveAttribute(
      'href',
      '/product/507f1f77bcf86cd799439011',
    )
  })

  it('показує посилання на повний каталог, коли API повертає порожній список товарів для головної сторінки', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ products: [] }))

    renderHome()

    expect(await screen.findByRole('link', { name: 'Дивитися весь каталог →' })).toHaveAttribute(
      'href',
      '/catalog',
    )
  })
})
