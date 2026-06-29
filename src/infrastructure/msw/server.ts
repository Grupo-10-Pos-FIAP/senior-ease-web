import { setupServer } from "msw/node";
import { preferencesHandlers } from "@infrastructure/msw/handlers/preferences.handlers";
import { tasksHandlers } from "@infrastructure/msw/handlers/tasks.handlers";
import { userHandlers } from "@infrastructure/msw/handlers/user.handlers";

export const server = setupServer(...preferencesHandlers, ...tasksHandlers, ...userHandlers);
