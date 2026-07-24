import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAccessibility } from "@app/providers/accessibilityContext";
import {
  useCompleteStepMutation,
  useStartActivityMutation,
  useTaskQuery,
  useUpdateCurrentStepMutation,
} from "@app/hooks/useTasks";
import { canNavigateToStep, getSortedSteps } from "@domain/entities/taskProgress";
import type { Task, TaskStep } from "@domain/entities/Task";
import type { InterfaceMode } from "@domain/value-objects/InterfaceMode";
import { BackToTasksLink } from "@presentation/features/tasks/guide/BackToTasksLink";
import { ActivityExitAction } from "./ActivityExitAction";
import { NextIcon, PreviousIcon } from "@presentation/features/tasks/guide/TutorialActionIcons";
import { useConfirmCriticalAction } from "@presentation/hooks/useConfirmCriticalAction";
import { ActivityProgressHeader } from "./ActivityProgressHeader";
import { StepExecutionRenderer } from "./StepExecutionRenderer";
import { Button, ConfirmDialog } from "@shared/ui";
import "@shared/ui/components/Button/Button.css";
import "../guide/StepTutorialPage.css";
import "./ActivityExecutionPage.css";

interface StepActionConfig {
  label: string;
  ariaLabel: string;
}

function isActionAlwaysEnabled(type: TaskStep["type"]): boolean {
  return type === "content_reading" || type === "watch_content";
}

function getForwardActionConfig(
  stepType: TaskStep["type"],
  isLastStep: boolean,
  interfaceMode: InterfaceMode,
): StepActionConfig {
  if (isLastStep) {
    return {
      label: "Concluir atividade",
      ariaLabel: "Salvar resposta e concluir a atividade",
    };
  }

  if (interfaceMode === "standard") {
    return {
      label: "Próximo",
      ariaLabel: "Próximo",
    };
  }

  switch (stepType) {
    case "content_reading":
      return {
        label: "Próxima pergunta",
        ariaLabel: "Marcar leitura como concluída e ir para a próxima pergunta",
      };
    case "watch_content":
      return {
        label: "Próxima pergunta",
        ariaLabel: "Marcar vídeo como assistido e ir para a próxima pergunta",
      };
    case "multiple_choice":
      return {
        label: "Próxima pergunta",
        ariaLabel: "Salvar resposta escolhida e ir para a próxima pergunta",
      };
    case "open_question":
      return {
        label: "Próxima pergunta",
        ariaLabel: "Salvar sua resposta e ir para a próxima pergunta",
      };
    default:
      return {
        label: "Próxima pergunta",
        ariaLabel: "Salvar e ir para a próxima pergunta",
      };
  }
}

interface ActivityStepContentProps {
  task: Task;
  step: TaskStep;
  taskId: string;
  stepId: string;
}

function ActivityStepContent({ task, step, taskId, stepId }: ActivityStepContentProps) {
  const navigate = useNavigate();
  const { preferences } = useAccessibility();
  const completeStep = useCompleteStepMutation();
  const updateCurrentStep = useUpdateCurrentStepMutation();
  const { pending, runIfAllowed, confirm, cancel, isOpen } = useConfirmCriticalAction();
  const [tutorialReady, setTutorialReady] = useState(false);
  const [answer, setAnswer] = useState(step.answer ?? "");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const isAdvancedMode = preferences.interfaceMode === "standard";
  const actionAlwaysEnabled = isActionAlwaysEnabled(step.type);
  const canComplete = actionAlwaysEnabled || tutorialReady;
  const sortedSteps = getSortedSteps(task);
  const currentIndex = sortedSteps.findIndex((item) => item.id === stepId);
  const previousStep = currentIndex > 0 ? sortedSteps[currentIndex - 1] : null;
  const nextStep =
    currentIndex >= 0 && currentIndex < sortedSteps.length - 1
      ? sortedSteps[currentIndex + 1]
      : null;
  const canGoPrevious = previousStep ? canNavigateToStep(task, previousStep.id) : false;
  const isLastStep = nextStep === null;
  const forwardAction = getForwardActionConfig(step.type, isLastStep, preferences.interfaceMode);
  const previousLabel = isAdvancedMode ? "Anterior" : "Pergunta anterior";
  const previousAriaLabel = isAdvancedMode ? "Anterior" : "Ir para a pergunta anterior";
  const isSaving = completeStep.isPending || updateCurrentStep.isPending;

  function navigateToStep(targetStepId: string) {
    updateCurrentStep.mutate(
      { taskId, stepId: targetStepId },
      {
        onSuccess: () => {
          void navigate(`/tarefas/${taskId}/passo/${targetStepId}`);
        },
      },
    );
  }

  function handleForward() {
    if (!canComplete) return;

    const payload =
      step.type === "multiple_choice" || step.type === "open_question"
        ? { answer: answer.trim() }
        : undefined;

    completeStep.mutate(
      { taskId, stepId, payload },
      {
        onSuccess: (updatedTask) => {
          setSaveMessage("Resposta salva com sucesso!");

          if (updatedTask.status === "completed") {
            void navigate(`/tarefas/${taskId}/concluida`);
            return;
          }

          if (nextStep) {
            navigateToStep(nextStep.id);
          }
        },
      },
    );
  }

  function handleForwardClick() {
    if (!canComplete) return;

    if (!isLastStep) {
      handleForward();
      return;
    }

    if (isAdvancedMode) {
      handleForward();
      return;
    }

    runIfAllowed(handleForward, {
      title: "Concluir esta atividade?",
      description: `Ao concluir "${task.title}", você não poderá refazer esta atividade. Deseja continuar?`,
      confirmLabel: "Sim, concluir atividade",
      cancelLabel: "Não, continuar na atividade",
      confirmVariant: "success",
    });
  }

  return (
    <section
      className="activity-execution activity-execution--step"
      aria-labelledby="activity-step-title"
    >
      <h1 id="activity-step-title" className="visually-hidden">
        {task.title} — {step.label}
      </h1>

      <ActivityProgressHeader task={task} stepId={stepId} />

      <div className="activity-execution__body">
        <StepExecutionRenderer
          step={step}
          onCanCompleteChange={(ready) => {
            if (!actionAlwaysEnabled) {
              setTutorialReady(ready);
            }
          }}
          onAnswerChange={setAnswer}
        />

        {saveMessage ? (
          <p className="activity-execution__save-message" role="status">
            {saveMessage}
          </p>
        ) : null}
      </div>

      <div className="activity-execution__bottom-bar">
        <div className="activity-execution__secondary-actions">
          <ActivityExitAction />

          {canGoPrevious ? (
            <Button
              variant="secondary"
              className="activity-execution__nav-button"
              disabled={isSaving}
              onClick={() => {
                if (previousStep) {
                  navigateToStep(previousStep.id);
                }
              }}
              aria-label={previousAriaLabel}
            >
              <PreviousIcon />
              {previousLabel}
            </Button>
          ) : null}

          <Button
            variant="primary"
            className="activity-execution__forward-button"
            disabled={!canComplete || isSaving}
            onClick={handleForwardClick}
            aria-label={forwardAction.ariaLabel}
          >
            {forwardAction.label}
            {!isLastStep ? <NextIcon /> : null}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={isOpen}
        title={pending?.options.title ?? ""}
        description={pending?.options.description ?? ""}
        confirmLabel={pending?.options.confirmLabel}
        cancelLabel={pending?.options.cancelLabel}
        confirmVariant={pending?.options.confirmVariant}
        onConfirm={confirm}
        onCancel={cancel}
      />
    </section>
  );
}

export function ActivityStepPage() {
  const { id = "", stepId = "" } = useParams();
  const navigate = useNavigate();
  const { data: task, isLoading, isError } = useTaskQuery(id);
  const startActivity = useStartActivityMutation();
  const startedRef = useRef(false);

  const step = task?.steps.find((item) => item.id === stepId);

  useEffect(() => {
    if (!task || task.status !== "active" || task.startedAt || startedRef.current) {
      return;
    }

    startedRef.current = true;
    startActivity.mutate({ taskId: id, stepId });
  }, [id, startActivity, stepId, task]);

  if (isLoading) {
    return <p className="activity-execution__status">Carregando atividade…</p>;
  }

  if (isError || !task) {
    return (
      <section className="activity-execution" aria-labelledby="activity-step-error">
        <h1 id="activity-step-error" className="activity-execution__title">
          Atividade não encontrada
        </h1>
        <BackToTasksLink to="/" label="Voltar para Minhas atividades" />
      </section>
    );
  }

  if (task.status === "completed") {
    void navigate(`/tarefas/${id}/concluida`, { replace: true });
    return null;
  }

  if (!step) {
    return (
      <section className="activity-execution" aria-labelledby="activity-step-not-found">
        <h1 id="activity-step-not-found" className="activity-execution__title">
          Questão não encontrada
        </h1>
        <p className="activity-execution__message">
          Esta questão não faz parte da atividade. Volte e tente novamente.
        </p>
        <Link to={`/tarefas/${id}`} className="se-button se-button--secondary">
          Voltar para a atividade
        </Link>
      </section>
    );
  }

  return <ActivityStepContent key={stepId} task={task} step={step} taskId={id} stepId={stepId} />;
}
