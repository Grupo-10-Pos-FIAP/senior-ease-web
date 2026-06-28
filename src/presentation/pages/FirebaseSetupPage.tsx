import { getMissingFirebaseEnvKeys } from "@infrastructure/firebase/client";
import "./FirebaseSetupPage.css";

export function FirebaseSetupPage() {
  const missingKeys = getMissingFirebaseEnvKeys();

  return (
    <main className="firebase-setup" aria-labelledby="firebase-setup-heading">
      <div className="firebase-setup__card">
        <h1 id="firebase-setup-heading">Configuração necessária</h1>
        <p>
          O Firebase ainda não está configurado neste projeto. Crie um arquivo{" "}
          <code>.env.local</code> na raiz com as variáveis abaixo e reinicie o servidor (
          <code>npm run dev</code>).
        </p>
        <ul className="firebase-setup__list">
          {missingKeys.map((key) => (
            <li key={key}>
              <code>{key}</code>
            </li>
          ))}
        </ul>
        <p className="firebase-setup__hint">
          Use o arquivo <code>.env.example</code> como modelo e copie os valores do Firebase Console
          em Configurações do projeto → Seus apps → SDK.
        </p>
      </div>
    </main>
  );
}
