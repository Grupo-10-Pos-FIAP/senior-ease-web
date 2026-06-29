import { GetPreferences } from "@application/accessibility/GetPreferences";
import { ResetPreferences } from "@application/accessibility/ResetPreferences";
import { UpdatePreferences } from "@application/accessibility/UpdatePreferences";
import { DeleteUser } from "@application/profile/DeleteUser";
import { GetUser } from "@application/profile/GetUser";
import { UpdateUser } from "@application/profile/UpdateUser";
import { CompleteTask } from "@application/tasks/CompleteTask";
import { GetTask } from "@application/tasks/GetTask";
import { ListTasks } from "@application/tasks/ListTasks";
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

export const getUser = new GetUser(userRepository);
export const updateUser = new UpdateUser(userRepository);
export const deleteUser = new DeleteUser(userRepository);
