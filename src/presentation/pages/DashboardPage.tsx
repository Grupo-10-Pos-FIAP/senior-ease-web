import { TaskListPanel } from '@presentation/features/tasks/TaskListPanel'
import './DashboardPage.css'

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <TaskListPanel />
    </div>
  )
}
