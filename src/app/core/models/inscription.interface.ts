export type InscriptionStatus = 'active' | 'completed' | 'cancelled';

export interface Inscription {
  id: number;
  studentId: number;
  courseId: number;
  enrollmentDate: Date;
  status: InscriptionStatus;
}

export type CreateInscription = Omit<Inscription, 'id'>;

export type UpdateInscription = Partial<CreateInscription>;
