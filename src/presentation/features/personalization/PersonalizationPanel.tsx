import { Button, ConfirmDialog, PreferenceRow, SegmentedControl, SuccessDialog } from "@shared/ui";
import type { InterfaceMode } from "@domain/value-objects/InterfaceMode";
import { UnsavedChangesLeaveGuard } from "@presentation/features/personalization/UnsavedChangesLeaveGuard";
import { useConfirmCriticalAction } from "@presentation/hooks/useConfirmCriticalAction";
import { usePersonalizationForm } from "@presentation/hooks/usePersonalizationForm";
import { useContext } from "react";
import { UNSAFE_DataRouterContext } from "react-router-dom";
import { getContrastLevelDescription } from "@shared/lib/accessibilityTokens";
import {
  getContrastOptions,
  getFontSizeOptions,
  getSpacingOptions,
  PANEL_INTRO,
  PREFERENCE_DESCRIPTIONS,
  YES_NO_OPTIONS,
  booleanToYesNo,
  yesNoToBoolean,
} from "@shared/lib/preferenceLabels";
import "./PersonalizationPanel.css";

const FONT_SIZE_OPTIONS = getFontSizeOptions();
const SPACING_OPTIONS = getSpacingOptions();
const CONTRAST_OPTIONS = getContrastOptions();

const INTERFACE_MODE_OPTIONS: { value: InterfaceMode; label: string; ariaLabel: string }[] = [
  { value: "simplified", label: "Básico", ariaLabel: "Modo básico — interface simplificada" },
  { value: "standard", label: "Avançado", ariaLabel: "Modo avançado — todas as opções visíveis" },
];

function RestoreIcon() {
  return (
    <svg
      className="personalization-panel__icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg
      className="personalization-panel__icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}

export function PersonalizationPanel() {
  const {
    draft,
    isDirty,
    isLoading,
    isSaving,
    isResetting,
    feedback,
    updateDraft,
    save,
    resetPersisted,
    clearFeedback,
  } = usePersonalizationForm();

  const { pending, runIfAllowed, confirm, cancel, isOpen } = useConfirmCriticalAction();
  const dataRouter = useContext(UNSAFE_DataRouterContext);

  const isBasicMode = draft.interfaceMode === "simplified";

  const handleResetClick = () => {
    runIfAllowed(
      () => {
        resetPersisted();
      },
      {
        title: "Restaurar configurações padrões?",
        description:
          "Todas as preferências de personalização serão restauradas aos valores iniciais. Esta ação não pode ser desfeita.",
        confirmLabel: "Sim, restaurar padrões",
        cancelLabel: "Não, manter como está",
        alwaysConfirm: true,
      },
    );
  };

  if (isLoading) {
    return <p className="personalization-panel__loading">Carregando preferências…</p>;
  }

  return (
    <section className="personalization-panel" aria-labelledby="personalization-heading">
      <header className="personalization-panel__header">
        <h2 id="personalization-heading" className="personalization-panel__title">
          Personalização da experiência
        </h2>
        <p className="personalization-panel__intro">{PANEL_INTRO}</p>
      </header>

      {isDirty ? (
        <div className="personalization-panel__dirty-banner" role="status" aria-live="polite">
          <p className="personalization-panel__dirty-text">Você tem alterações não salvas.</p>
          <Button
            variant="primary"
            className="personalization-panel__dirty-save"
            onClick={save}
            disabled={isSaving}
          >
            <SaveIcon />
            {isSaving ? "Salvando…" : "Salvar agora"}
          </Button>
        </div>
      ) : null}

      <div className="personalization-panel__controls">
        <PreferenceRow
          icon="Aa"
          label="Tamanho da letra"
          description={PREFERENCE_DESCRIPTIONS.fontSize}
          control={(legendId) => (
            <SegmentedControl
              name="font-size"
              value={draft.fontSize}
              options={FONT_SIZE_OPTIONS}
              onChange={(fontSize) => {
                updateDraft({ fontSize });
              }}
              labelledBy={legendId}
            />
          )}
        />
        <PreferenceRow
          icon="◐"
          label="Nível de contraste"
          description={getContrastLevelDescription(draft.contrast)}
          control={(legendId) => (
            <SegmentedControl
              name="contrast"
              value={draft.contrast}
              options={CONTRAST_OPTIONS}
              onChange={(contrast) => {
                updateDraft({ contrast });
              }}
              labelledBy={legendId}
            />
          )}
        />
        <PreferenceRow
          icon="☰"
          label="Modo de navegação"
          description={PREFERENCE_DESCRIPTIONS.interfaceMode}
          control={(legendId) => (
            <SegmentedControl
              name="interface-mode"
              value={draft.interfaceMode}
              options={INTERFACE_MODE_OPTIONS}
              onChange={(interfaceMode) => {
                updateDraft({ interfaceMode });
              }}
              labelledBy={legendId}
            />
          )}
        />

        <PreferenceRow
          icon="↔"
          label="Espaçamento entre elementos"
          description={PREFERENCE_DESCRIPTIONS.spacing}
          control={(legendId) => (
            <SegmentedControl
              name="spacing"
              value={draft.spacing}
              options={SPACING_OPTIONS}
              onChange={(spacing) => {
                updateDraft({ spacing });
              }}
              labelledBy={legendId}
            />
          )}
        />

        {!isBasicMode ? (
          <div className="personalization-panel__advanced">
            <PreferenceRow
              icon="✦"
              label="Feedback visual reforçado"
              description={PREFERENCE_DESCRIPTIONS.reinforcedVisualFeedback}
              control={(legendId) => (
                <SegmentedControl
                  name="reinforced-feedback"
                  value={booleanToYesNo(draft.reinforcedVisualFeedback)}
                  options={YES_NO_OPTIONS}
                  onChange={(value) => {
                    updateDraft({ reinforcedVisualFeedback: yesNoToBoolean(value) });
                  }}
                  labelledBy={legendId}
                />
              )}
            />
            <PreferenceRow
              icon="!"
              label="Confirmação em ações críticas"
              description={PREFERENCE_DESCRIPTIONS.confirmCriticalActions}
              control={(legendId) => (
                <SegmentedControl
                  name="confirm-critical"
                  value={booleanToYesNo(draft.confirmCriticalActions)}
                  options={YES_NO_OPTIONS}
                  onChange={(value) => {
                    updateDraft({ confirmCriticalActions: yesNoToBoolean(value) });
                  }}
                  labelledBy={legendId}
                />
              )}
            />
          </div>
        ) : null}
      </div>

      {feedback?.type === "error" ? (
        <p
          className="personalization-panel__feedback personalization-panel__feedback--error"
          role="alert"
          aria-live="polite"
        >
          {feedback.message}
        </p>
      ) : null}

      <SuccessDialog
        open={feedback?.type === "success"}
        description={feedback?.type === "success" ? feedback.message : ""}
        onClose={clearFeedback}
      />

      <footer className="personalization-panel__footer">
        <Button variant="secondary" onClick={handleResetClick} disabled={isResetting || isSaving}>
          <RestoreIcon />
          Retornar configurações padrões
        </Button>
        <Button variant="primary" onClick={save} disabled={!isDirty || isSaving}>
          <SaveIcon />
          {isSaving ? "Salvando…" : "Salvar mudanças"}
        </Button>
      </footer>

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

      {dataRouter ? <UnsavedChangesLeaveGuard isDirty={isDirty} /> : null}
    </section>
  );
}
