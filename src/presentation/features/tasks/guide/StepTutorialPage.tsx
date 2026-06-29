import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTaskQuery } from "@app/hooks/useTasks";
import type { TaskStep } from "@domain/entities/Task";
import { Button } from "@shared/ui/components/Button";
import { BackToTasksLink } from "./BackToTasksLink";
import { CheckIcon } from "./TutorialActionIcons";
import { TutorialContinueDialog } from "./TutorialContinueDialog";
import { StepTutorialRenderer } from "./tutorials/StepTutorialRenderer";
import "@shared/ui/components/Button/Button.css";
import "./StepTutorialPage.css";

interface StepActionConfig {
  label: string;
  ariaLabel: string;
  showIcon: boolean;
}

function isActionAlwaysEnabled(type: TaskStep["type"]): boolean {
  return type === "content_reading" || type === "watch_content";
}

function getStepActionConfig(type: TaskStep["type"]): StepActionConfig | null {
  switch (type) {
    case "content_reading":
      return {
        label: "Terminei de ler",
        ariaLabel: "Confirmar que terminou de ler o texto",
        showIcon: true,
      };
    case "watch_content":
      return {
        label: "Terminei de assistir",
        ariaLabel: "Confirmar que terminou de assistir ao vídeo",
        showIcon: true,
      };
    case "multiple_choice":
      return {
        label: "Já aprendi a escolher uma resposta",
        ariaLabel: "Confirmar que já aprendeu a escolher uma resposta",
        showIcon: true,
      };
    case "open_question":
      return {
        label: "Enviar resposta",
        ariaLabel: "Enviar resposta de exemplo",
        showIcon: true,
      };
    default:
      return null;
  }
}

export function StepTutorialPage() {
  const { id = "", stepId = "" } = useParams();
  const navigate = useNavigate();
  const { data: task, isLoading, isError } = useTaskQuery(id);
  const [continueDialogOpen, setContinueDialogOpen] = useState(false);
  const [canComplete, setCanComplete] = useState(false);

  const step = task?.steps.find((item) => item.id === stepId);
  const actionConfig = step ? getStepActionConfig(step.type) : null;
  const actionAlwaysEnabled = step ? isActionAlwaysEnabled(step.type) : false;

  useEffect(() => {
    setCanComplete(actionAlwaysEnabled);
  }, [stepId, actionAlwaysEnabled]);

  if (isLoading) {
    return <p className="step-tutorial__status">Carregando tutorial…</p>;
  }

  if (isError || !task) {
    return (
      <section className="step-tutorial" aria-labelledby="step-tutorial-error">
        <h1 id="step-tutorial-error" className="step-tutorial__title">
          Atividade não encontrada
        </h1>
        <div className="step-tutorial__footer">
          <BackToTasksLink to="/" label="Voltar para Minhas atividades" />
        </div>
      </section>
    );
  }

  if (!step) {
    return (
      <section className="step-tutorial" aria-labelledby="step-tutorial-not-found">
        <h1 id="step-tutorial-not-found" className="step-tutorial__title">
          Tarefa não encontrada
        </h1>
        <p className="tutorial-sim__instruction">
          Esta tarefa não faz parte da atividade. Volte para a lista do guia.
        </p>
        <div className="step-tutorial__footer">
          <Link
            to={`/tarefas/${id}/guia`}
            className="se-button se-button--secondary step-tutorial__back"
          >
            Voltar para o guia
          </Link>
        </div>
      </section>
    );
  }

  const sortedSteps = [...task.steps].sort((a, b) => a.order - b.order);
  const currentIndex = sortedSteps.findIndex((item) => item.id === stepId);
  const nextStep = currentIndex >= 0 ? (sortedSteps[currentIndex + 1] ?? null) : null;
  const guideListPath = `/tarefas/${id}/guia`;

  function handleBackToList() {
    setContinueDialogOpen(false);
    void navigate(guideListPath);
  }

  function handleNextStep() {
    if (!nextStep) return;
    setContinueDialogOpen(false);
    void navigate(`/tarefas/${id}/guia/${nextStep.id}`);
  }

  return (
    <section
      className="step-tutorial step-tutorial--immersive"
      aria-labelledby="step-tutorial-title"
    >
      <h1 id="step-tutorial-title" className="visually-hidden">
        {step.label}
      </h1>

      <div className="step-tutorial__content">
        <StepTutorialRenderer
          type={step.type}
          stepLabel={step.label}
          backToTasksPath={guideListPath}
          onCanCompleteChange={(ready) => {
            if (!actionAlwaysEnabled) {
              setCanComplete(ready);
            }
          }}
        />
      </div>

      <div className="step-tutorial__bottom-bar">
        <BackToTasksLink to={guideListPath} />
        {actionConfig ? (
          <Button
            variant="primary"
            className="step-tutorial__complete"
            disabled={!canComplete}
            onClick={() => {
              setContinueDialogOpen(true);
            }}
            aria-label={actionConfig.ariaLabel}
          >
            {actionConfig.showIcon ? <CheckIcon /> : null}
            {actionConfig.label}
          </Button>
        ) : null}
      </div>

      <TutorialContinueDialog
        open={continueDialogOpen}
        hasNextStep={nextStep !== null}
        nextStepLabel={nextStep?.label}
        onBackToList={handleBackToList}
        onNextStep={handleNextStep}
        onClose={() => {
          setContinueDialogOpen(false);
        }}
      />
    </section>
  );
}
