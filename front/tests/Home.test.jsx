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

describe('Сторінка Home', () => {
  const renderHome = () => render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )

  it('показує товари, завантажені з API', async () => {
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

  it('залишає перехід до каталогу, якщо популярних товарів немає', async () => {
    fetch.mockResolvedValueOnce(jsonResponse({ products: [] }))

    renderHome()

    expect(await screen.findByRole('link', { name: 'Дивитися весь каталог →' })).toHaveAttribute(
      'href',
      '/catalog',
    )
  })
})
