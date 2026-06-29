export interface Course {
  id: string;
  title: string;
}

export function createCourse(input: { id: string; title: string }): Course {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Título do curso é obrigatório");
  }

  return {
    id: input.id,
    title,
  };
}
