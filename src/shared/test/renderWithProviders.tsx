import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { Suspense, type ReactElement, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AccessibilityProvider } from '@app/providers/AccessibilityProvider'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', ...options }: RenderWithProvidersOptions = {},
) {
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AccessibilityProvider>
          <MemoryRouter initialEntries={[route]}>
            <Suspense fallback={<p>Carregando…</p>}>{children}</Suspense>
          </MemoryRouter>
        </AccessibilityProvider>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}
