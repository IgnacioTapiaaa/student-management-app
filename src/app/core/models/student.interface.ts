export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
}

export type CreateStudent = Omit<Student, 'id'>;

export type UpdateStudent = Partial<CreateStudent>;
