export interface Course {
  id: number;
  name: string;
  code: string;
  instructor: string;
  duration: number; // Duration in hours
  startDate: Date;
  endDate: Date;
  capacity: number;
  enrolled: number;
}

export type CreateCourse = Omit<Course, 'id'>;

export type UpdateCourse = Partial<CreateCourse>;
