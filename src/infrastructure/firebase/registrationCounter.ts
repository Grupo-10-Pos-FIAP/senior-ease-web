import {
  formatRegistrationId,
  REGISTRATION_COUNTER_COLLECTION,
  REGISTRATION_COUNTER_DOC,
} from "@domain/registrationId";
import { doc, type Firestore, type Transaction } from "firebase/firestore";

export { REGISTRATION_COUNTER_COLLECTION, REGISTRATION_COUNTER_DOC };

function readCurrentSequence(data: Record<string, unknown> | undefined): number {
  const current = data?.current;
  if (typeof current === "number" && Number.isInteger(current) && current >= 0) {
    return current;
  }
  return 0;
}

/**
 * Reserva o próximo número de matrícula dentro de uma transação Firestore.
 * Garante unicidade mesmo com cadastros simultâneos.
 */
export async function allocateNextRegistrationId(
  firestore: Firestore,
  transaction: Transaction,
): Promise<string> {
  const counterRef = doc(firestore, REGISTRATION_COUNTER_COLLECTION, REGISTRATION_COUNTER_DOC);
  const snapshot = await transaction.get(counterRef);
  const next = readCurrentSequence(snapshot.data()) + 1;

  transaction.set(counterRef, { current: next }, { merge: true });

  return formatRegistrationId(next);
}
