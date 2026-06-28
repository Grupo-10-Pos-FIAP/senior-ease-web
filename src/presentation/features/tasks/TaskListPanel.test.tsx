import { describe, expect, it, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createDefaultPreferences } from '@domain/entities/AccessibilityPreferences'
import { TaskListPanel } from '@presentation/features/tasks/TaskListPanel'
import { resetTasksDb } from '@infrastructure/msw/db/tasks.db'
import { applyAccessibilityTokens } from '@shared/lib/accessibilityTokens'
import { renderWithProviders } from '@shared/test/renderWithProviders'

async function waitForTasksLoaded() {
  await waitFor(() => {
    expect(screen.queryByText(/carregando atividades/i)).not.toBeInTheDocument()
  })
}

describe('TaskListPanel', () => {
  beforeEach(() => {
    resetTasksDb()
    applyAccessibilityTokens(createDefaultPreferences())
  })

  it('exibe abas de filtro por status', async () => {
    renderWithProviders(<TaskListPanel />)
    await waitForTasksLoaded()

    expect(screen.getByRole('tab', { name: /minhas atividades/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /atividades concluídas/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /atividades expiradas/i })).toBeInTheDocument()
  })

  it('lista atividades ativas do mockup', async () => {
    renderWithProviders(<TaskListPanel />)
    await waitForTasksLoaded()

    expect(screen.getByRole('heading', { name: /primeiros passos no digital/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /como usar e-mail/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /videochamadas sem medo/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /segurança digital/i })).toBeInTheDocument()
  })

  it('filtra atividades concluídas na aba correspondente', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TaskListPanel />)
    await waitForTasksLoaded()

    await user.click(screen.getByRole('tab', { name: /atividades concluídas/i }))

    expect(
      await screen.findByRole('heading', { name: /currículo digital/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Atividade concluída').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByRole('link', { name: /ver passo-a-passo/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /primeiros passos no digital/i })).not.toBeInTheDocument()
  })

  it('exibe link ver passo-a-passo para cada atividade ativa', async () => {
    renderWithProviders(<TaskListPanel />)
    await waitForTasksLoaded()

    const links = screen.getAllByRole('link', { name: /ver passo-a-passo/i })
    expect(links.length).toBeGreaterThanOrEqual(4)
    expect(links[0]).toHaveAttribute('href', '/tarefas/task-1')
  })

  it('concluir atividade exige confirmação e remove da lista ativa', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TaskListPanel />)
    await waitForTasksLoaded()

    const completeButtons = screen.getAllByRole('button', { name: /concluir atividade/i })
    await user.click(completeButtons[0])

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/concluir atividade\?/i)).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: /sim, concluir atividade/i }))

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /primeiros passos no digital/i }),
      ).not.toBeInTheDocument()
    })
  })

  it('exibe layout de atividades expiradas com badge e refazer', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TaskListPanel />)
    await waitForTasksLoaded()

    await user.click(screen.getByRole('tab', { name: /atividades expiradas/i }))

    expect(
      await screen.findByRole('heading', { name: /simulação de situações reais/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Atividade expirada!').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('O prazo para essa atividade já se expirou.').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('link', { name: /refazer atividade/i }).length).toBeGreaterThanOrEqual(1)
  })
})
