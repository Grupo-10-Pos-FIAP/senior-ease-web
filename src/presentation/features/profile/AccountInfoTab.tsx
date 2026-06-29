import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, formatUserAge, formatUserDisability, type User } from "@domain/entities/User";
import type { UserUpdateInput } from "@domain/repositories/IUserRepository";
import { formatPhoneMask } from "@shared/lib/formatPhone";
import {
  birthDateDisplayToIso,
  formatBirthDateMask,
  isoToBirthDateDisplay,
} from "@shared/lib/formatBirthDate";
import { Button, ConfirmDialog, SuccessDialog } from "@shared/ui";
import { useConfirmCriticalAction } from "@presentation/hooks/useConfirmCriticalAction";
import { useUserMutations, useUserQuery } from "@presentation/hooks/useUserProfile";
import "./AccountInfoTab.css";

type FormFeedback = { type: "success"; message: string } | { type: "error"; message: string };

interface UserFormState {
  fullName: string;
  birthDate: string;
  registrationId: string;
  disability: string;
  email: string;
  phone: string;
}

type FieldErrors = Partial<Record<keyof UserFormState, string>>;

function userToFormState(user: User): UserFormState {
  return {
    fullName: user.fullName,
    birthDate: isoToBirthDateDisplay(user.birthDate),
    registrationId: user.registrationId,
    disability: user.disability ?? "",
    email: user.email,
    phone: formatPhoneMask(user.phone),
  };
}

function validateForm(state: UserFormState): { data: UserUpdateInput | null; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const birthDateIso = birthDateDisplayToIso(state.birthDate.trim());

  try {
    if (!state.birthDate.trim()) {
      errors.birthDate = "Informe sua data de nascimento.";
    } else if (!birthDateIso) {
      errors.birthDate = "Informe uma data válida no formato DD/MM/AAAA.";
    }

    if (birthDateIso) {
      createUser({
        id: "validation",
        fullName: state.fullName,
        birthDate: birthDateIso,
        registrationId: state.registrationId,
        disability: state.disability.trim() || null,
        email: state.email,
        phone: state.phone,
      });
    }

    if (Object.keys(errors).length > 0) {
      return { data: null, errors };
    }

    return {
      data: {
        fullName: state.fullName.trim(),
        birthDate: birthDateIso!,
        registrationId: state.registrationId.trim(),
        disability: state.disability.trim() || null,
        email: state.email.trim(),
        phone: formatPhoneMask(state.phone),
      },
      errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dados inválidos.";

    if (/nome/i.test(message)) errors.fullName = message;
    else if (/data de nascimento|idade/i.test(message)) errors.birthDate = message;
    else if (/matrícula/i.test(message)) errors.registrationId = message;
    else if (/e-mail/i.test(message)) errors.email = message;
    else if (/telefone/i.test(message)) errors.phone = message;
    else errors.fullName = message;

    return { data: null, errors };
  }
}

function TrashIcon() {
  return (
    <svg
      className="account-info-tab__icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      className="account-info-tab__icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg
      className="account-info-tab__icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg
      className="account-info-tab__icon"
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

export function AccountInfoTab() {
  const { data: user, isLoading, isError } = useUserQuery();
  const { updateMutation, deleteMutation } = useUserMutations();
  const { pending, runIfAllowed, confirm, cancel, isOpen } = useConfirmCriticalAction();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<UserFormState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  useEffect(() => {
    if (user) {
      setFormState(userToFormState(user));
    }
  }, [user]);

  const updateField = useCallback((field: keyof UserFormState, value: string) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFeedback(null);
    setFormState((current) => (current ? { ...current, [field]: value } : current));
  }, []);

  const handleEdit = () => {
    if (!user) return;
    setFormState(userToFormState(user));
    setFieldErrors({});
    setFeedback(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!user) return;
    setFormState(userToFormState(user));
    setFieldErrors({});
    setFeedback(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!formState) return;

    const { data, errors } = validateForm(formState);
    if (!data) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    updateMutation.mutate(data, {
      onSuccess: () => {
        setIsEditing(false);
        setFeedback({ type: "success", message: "Informações salvas com sucesso." });
      },
      onError: (error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível salvar suas informações. Tente novamente.";
        setFeedback({ type: "error", message });
      },
    });
  };

  const handleDelete = () => {
    runIfAllowed(
      () => {
        deleteMutation.mutate(undefined, {
          onSuccess: () => {
            navigate("/", { state: { accountDeleted: true }, replace: true });
          },
          onError: () => {
            setFeedback({
              type: "error",
              message: "Não foi possível excluir a conta. Tente novamente.",
            });
          },
        });
      },
      {
        title: "Excluir conta permanentemente?",
        description:
          "Todos os seus dados serão removidos e não poderão ser recuperados. Esta ação é irreversível.",
        confirmLabel: "Sim, excluir minha conta",
        cancelLabel: "Não, manter minha conta",
        confirmVariant: "danger",
        alwaysConfirm: true,
      },
    );
  };

  if (isLoading) {
    return <p className="account-info-tab__loading">Carregando informações…</p>;
  }

  if (isError || !user || !formState) {
    return (
      <p className="account-info-tab__error" role="alert">
        Não foi possível carregar suas informações. Tente novamente mais tarde.
      </p>
    );
  }

  return (
    <section className="account-info-tab" aria-labelledby="account-info-heading">
      <header className="account-info-tab__header">
        <h2 id="account-info-heading" className="account-info-tab__title">
          Informações da conta
        </h2>
        <p className="account-info-tab__intro">
          Consulte e atualize seus dados pessoais. A idade é calculada a partir da data de nascimento.
        </p>
      </header>

      {isEditing ? (
        <form
          className="account-info-tab__form"
          onSubmit={(event) => {
            event.preventDefault();
            handleSave();
          }}
          noValidate
        >
          <div className="account-info-tab__form-field account-info-tab__form-field--full">
            <label className="account-info-tab__label" htmlFor="account-full-name">
              Nome completo
            </label>
            <input
              id="account-full-name"
              className={`account-info-tab__input ${fieldErrors.fullName ? "account-info-tab__input--error" : ""}`}
              type="text"
              value={formState.fullName}
              onChange={(event) => {
                updateField("fullName", event.target.value);
              }}
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={fieldErrors.fullName ? "account-full-name-error" : undefined}
              autoComplete="name"
            />
            {fieldErrors.fullName ? (
              <p id="account-full-name-error" className="account-info-tab__field-error" role="alert">
                {fieldErrors.fullName}
              </p>
            ) : null}
          </div>

          <div className="account-info-tab__form-field account-info-tab__form-field--full">
            <label className="account-info-tab__label" htmlFor="account-birth-date">
              Data de nascimento
            </label>
            <input
              id="account-birth-date"
              className={`account-info-tab__input ${fieldErrors.birthDate ? "account-info-tab__input--error" : ""}`}
              type="text"
              value={formState.birthDate}
              onChange={(event) => {
                updateField("birthDate", formatBirthDateMask(event.target.value));
              }}
              aria-invalid={Boolean(fieldErrors.birthDate)}
              aria-describedby={
                fieldErrors.birthDate ? "account-birth-date-error" : "account-birth-date-hint"
              }
              inputMode="numeric"
              autoComplete="bday"
              placeholder="DD/MM/AAAA"
              maxLength={10}
            />
            {fieldErrors.birthDate ? (
              <p id="account-birth-date-error" className="account-info-tab__field-error" role="alert">
                {fieldErrors.birthDate}
              </p>
            ) : (
              <p id="account-birth-date-hint" className="account-info-tab__field-hint">
                Digite dia, mês e ano. Sua idade será calculada automaticamente.
              </p>
            )}
          </div>

          <div className="account-info-tab__form-field account-info-tab__form-field--full">
            <label className="account-info-tab__label" htmlFor="account-registration">
              Matrícula
            </label>
            <input
              id="account-registration"
              className={`account-info-tab__input ${fieldErrors.registrationId ? "account-info-tab__input--error" : ""}`}
              type="text"
              value={formState.registrationId}
              onChange={(event) => {
                updateField("registrationId", event.target.value);
              }}
              aria-invalid={Boolean(fieldErrors.registrationId)}
              aria-describedby={
                fieldErrors.registrationId ? "account-registration-error" : undefined
              }
            />
            {fieldErrors.registrationId ? (
              <p
                id="account-registration-error"
                className="account-info-tab__field-error"
                role="alert"
              >
                {fieldErrors.registrationId}
              </p>
            ) : null}
          </div>

          <div className="account-info-tab__form-field account-info-tab__form-field--full">
            <label className="account-info-tab__label" htmlFor="account-disability">
              Possui alguma deficiência?
            </label>
            <input
              id="account-disability"
              className="account-info-tab__input"
              type="text"
              value={formState.disability}
              onChange={(event) => {
                updateField("disability", event.target.value);
              }}
              placeholder="Ex.: Baixa visão"
            />
          </div>

          <div className="account-info-tab__form-field account-info-tab__form-field--full">
            <label className="account-info-tab__label" htmlFor="account-email">
              E-mail
            </label>
            <input
              id="account-email"
              className={`account-info-tab__input ${fieldErrors.email ? "account-info-tab__input--error" : ""}`}
              type="email"
              value={formState.email}
              onChange={(event) => {
                updateField("email", event.target.value);
              }}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "account-email-error" : undefined}
              autoComplete="email"
            />
            {fieldErrors.email ? (
              <p id="account-email-error" className="account-info-tab__field-error" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="account-info-tab__form-field account-info-tab__form-field--full">
            <label className="account-info-tab__label" htmlFor="account-phone">
              Telefone
            </label>
            <input
              id="account-phone"
              className={`account-info-tab__input ${fieldErrors.phone ? "account-info-tab__input--error" : ""}`}
              type="tel"
              value={formState.phone}
              onChange={(event) => {
                updateField("phone", formatPhoneMask(event.target.value));
              }}
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "account-phone-error" : "account-phone-hint"}
              autoComplete="tel"
              inputMode="numeric"
              placeholder="(00) 00000-0000"
            />
            {fieldErrors.phone ? (
              <p id="account-phone-error" className="account-info-tab__field-error" role="alert">
                {fieldErrors.phone}
              </p>
            ) : (
              <p id="account-phone-hint" className="account-info-tab__field-hint">
                Digite apenas os números — a formatação é aplicada automaticamente.
              </p>
            )}
          </div>
        </form>
      ) : (
        <dl className="account-info-tab__grid">
          <div className="account-info-tab__field account-info-tab__field--full">
            <dt>Nome completo</dt>
            <dd>{user.fullName}</dd>
          </div>
          <div className="account-info-tab__field">
            <dt>Idade</dt>
            <dd>{formatUserAge(user.birthDate)}</dd>
          </div>
          <div className="account-info-tab__field account-info-tab__field--full">
            <dt>Matrícula</dt>
            <dd>{user.registrationId}</dd>
          </div>
          <div className="account-info-tab__field account-info-tab__field--full">
            <dt>Possui alguma deficiência?</dt>
            <dd>{formatUserDisability(user.disability)}</dd>
          </div>
          <div className="account-info-tab__field">
            <dt>E-mail</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="account-info-tab__field">
            <dt>Telefone</dt>
            <dd>{formatPhoneMask(user.phone) || "Não informado"}</dd>
          </div>
        </dl>
      )}

      {feedback?.type === "error" ? (
        <p
          className="account-info-tab__feedback account-info-tab__feedback--error"
          role="alert"
          aria-live="polite"
        >
          {feedback.message}
        </p>
      ) : null}

      <SuccessDialog
        open={feedback?.type === "success"}
        description={feedback?.type === "success" ? feedback.message : ""}
        onClose={() => {
          setFeedback(null);
        }}
      />

      <footer
        className={`account-info-tab__footer ${isEditing ? "account-info-tab__footer--editing" : "account-info-tab__footer--view"}`}
      >
        {isEditing ? (
          <>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              <CancelIcon />
              Não, manter como está
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              <SaveIcon />
              {updateMutation.isPending ? "Salvando…" : "Salvar informações"}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <TrashIcon />
              {deleteMutation.isPending ? "Excluindo…" : "Excluir minha conta"}
            </Button>
            <Button variant="primary" onClick={handleEdit}>
              <PencilIcon />
              Editar informações
            </Button>
          </>
        )}
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
    </section>
  );
}
