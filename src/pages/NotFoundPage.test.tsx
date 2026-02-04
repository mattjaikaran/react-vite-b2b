import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import NotFoundPage from './NotFoundPage'

describe('NotFoundPage', () => {
  it('renders 404 message', () => {
    render(<NotFoundPage />)

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<NotFoundPage />)

    expect(screen.getByRole('link', { name: /go back home/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard')
  })

  it('displays helpful message', () => {
    render(<NotFoundPage />)

    expect(
      screen.getByText(/sorry, we couldn't find the page you're looking for/i)
    ).toBeInTheDocument()
  })
})
