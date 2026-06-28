import { Link } from "react-router-dom";
import "./DashboardPage.css";

export function DashboardPage() {
  return (
    <section className="dashboard-page">
      <h1>Bem-vindo ao SeniorEASE</h1>
      <p className="dashboard-page__subtitle">Plataforma de acessibilidade digital para idosos.</p>
      <Link to="/perfil" className="dashboard-page__link">
        Ir para Meu perfil
      </Link>
    </section>
  );
}
