import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  it('показує товари, завантажені з API', async () => {
    fetch.mockResolvedValueOnce(jsonResponse([
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'Каблучка тестова',
        price: 2500,
        category: 'Каблучки',
        image: '',
        stock: 2,
      },
    ]))

    render(<Home />)

    expect(await screen.findByText('Каблучка тестова')).toBeInTheDocument()
    expect(screen.getByText('Знайдено товарів: 1')).toBeInTheDocument()
    expect(screen.getByText('2 500 ₴')).toBeInTheDocument()
  })

  it('показує результат 404 у панелі пошуку товару', async () => {
    fetch.mockImplementation((url) => {
      if (url === '/api/products') {
        return Promise.resolve(jsonResponse([]))
      }

      return Promise.resolve(jsonResponse(
        { message: 'Product not found' },
        { ok: false, status: 404 },
      ))
    })

    render(<Home />)

    const user = userEvent.setup()
    const input = await screen.findByPlaceholderText('MongoDB ObjectId (24 hex-символи)')

    await user.clear(input)
    await user.type(input, '507f1f77bcf86cd799439011')
    await user.click(screen.getByRole('button', { name: /Знайти/ }))

    expect(await screen.findByText('404 — Товар не знайдено', { selector: 'b' })).toBeInTheDocument()
    expect(screen.getByText(/Жодного запису з ID/)).toBeInTheDocument()
  })
})
