export type Role = "student" | "teacher";

export type User = {
  id: string;
  uid: string;
  email: string;
  phone_number?: string | null;
  role: Role;
  name?: string | null;
  photo_url?: string | null;
  state?: string | null;
  city?: string | null;
  country?: string | null;
  institute?: string | null;
  is_active: boolean;
  is_staff: boolean;
};

export type Classroom = {
  id: number;
  class_name: string;
  class_code: string;
  teacher: User;
  created_at: string;
  updated_at: string;
};

export type Test = {
  id: number;
  classroom: number;
  title: string;
  duration: number;
  total_marks: number;
  category: "objective" | "subjective" | "mixed";
  file_url?: string | null;
  schedule_type: "instant" | "scheduled";
  start_time?: string | null;
  end_time?: string | null;
  status: "upcoming" | "live" | "missed" | "completed";
};
