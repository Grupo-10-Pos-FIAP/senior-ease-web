import { Link } from "react-router-dom";
import { BackIcon } from "./TutorialActionIcons";
import "./BackToTasksLink.css";

interface BackToTasksLinkProps {
  to: string;
  label?: string;
  className?: string;
}

export function BackToTasksLink({
  to,
  label = "Voltar para as tarefas",
  className = "",
}: BackToTasksLinkProps) {
  return (
    <Link to={to} className={`se-button se-button--secondary back-link ${className}`.trim()}>
      <BackIcon />
      {label}
    </Link>
  );
}
