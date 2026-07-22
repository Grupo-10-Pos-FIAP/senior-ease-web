import { GetPreferences } from "@application/accessibility/GetPreferences";
import { ResetPreferences } from "@application/accessibility/ResetPreferences";
import { UpdatePreferences } from "@application/accessibility/UpdatePreferences";
import {
  DeactivateUser,
  GetAccountLifecycle,
  ReactivateUser,
} from "@application/profile/AccountStatus";
import { DeleteUser } from "@application/profile/DeleteUser";
import { GetUser } from "@application/profile/GetUser";
import { UpdateUser } from "@application/profile/UpdateUser";
import { CompleteGuideStep } from "@application/tasks/CompleteGuideStep";
import { CompleteTask } from "@application/tasks/CompleteTask";
import { CompleteTaskStep } from "@application/tasks/CompleteTaskStep";
import { GetTask } from "@application/tasks/GetTask";
import { ListTasks } from "@application/tasks/ListTasks";
import { ResetActivity } from "@application/tasks/ResetActivity";
import { StartActivity } from "@application/tasks/StartActivity";
import { UpdateCurrentStep } from "@application/tasks/UpdateCurrentStep";
import {
  preferencesRepository,
  taskRepository,
  userRepository,
} from "@app/composition/repositories";

export const getPreferences = new GetPreferences(preferencesRepository);
export const updatePreferences = new UpdatePreferences(preferencesRepository);
export const resetPreferences = new ResetPreferences(preferencesRepository);

export const listTasks = new ListTasks(taskRepository);
export const getTask = new GetTask(taskRepository);
export const completeTask = new CompleteTask(taskRepository);
export const startActivity = new StartActivity(taskRepository);
export const completeTaskStep = new CompleteTaskStep(taskRepository);
export const completeGuideStep = new CompleteGuideStep(taskRepository);
export const updateCurrentStep = new UpdateCurrentStep(taskRepository);
export const resetActivity = new ResetActivity(taskRepository);

export const getUser = new GetUser(userRepository);
export const updateUser = new UpdateUser(userRepository);
export const getAccountLifecycle = new GetAccountLifecycle(userRepository);
export const deactivateUser = new DeactivateUser(userRepository);
export const reactivateUser = new ReactivateUser(userRepository);
export const deleteUser = new DeleteUser(userRepository);
