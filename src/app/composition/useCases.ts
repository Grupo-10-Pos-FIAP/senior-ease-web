import { GetPreferences } from "@application/accessibility/GetPreferences";
import { ResetPreferences } from "@application/accessibility/ResetPreferences";
import { UpdatePreferences } from "@application/accessibility/UpdatePreferences";
import { preferencesRepository } from "@app/composition/repositories";

export const getPreferences = new GetPreferences(preferencesRepository);
export const updatePreferences = new UpdatePreferences(preferencesRepository);
export const resetPreferences = new ResetPreferences(preferencesRepository);
