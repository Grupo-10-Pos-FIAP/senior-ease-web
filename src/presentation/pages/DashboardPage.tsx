import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { TaskListPanel } from '@presentation/features/tasks/TaskListPanel'
import './DashboardPage.css'

export function DashboardPage() {
  const location = useLocation()
  const [deletedMessage, setDeletedMessage] = useState<string | null>(null)

  useEffect(() => {
    const state = location.state as { accountDeleted?: boolean } | null
    if (state?.accountDeleted) {
      setDeletedMessage('Conta excluída com sucesso.')
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  return (
    <div className="dashboard-page">
      {deletedMessage ? (
        <p className="dashboard-page__feedback" role="status" aria-live="polite">
          {deletedMessage}
        </p>
      ) : null}
      <TaskListPanel />
    </div>
  )
}
