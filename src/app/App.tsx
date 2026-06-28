import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@app/router'

export default function App() {
  return (
    <Suspense fallback={<p style={{ padding: '2rem', textAlign: 'center' }}>Carregando…</p>}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
