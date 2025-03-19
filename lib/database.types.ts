export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            // ... existing tables ...
            classes: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    capacity: number
                    age_group: string
                    organization_id: string
                    created_at: string
                    updated_at: string
                    teacher_id: string | null
                    assistant_teacher_ids: string[] | null
                    schedule: Json | null
                    room_number: string | null
                    status: 'active' | 'inactive'
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    capacity: number
                    age_group: string
                    organization_id: string
                    created_at?: string
                    updated_at?: string
                    teacher_id?: string | null
                    assistant_teacher_ids?: string[] | null
                    schedule?: Json | null
                    room_number?: string | null
                    status?: 'active' | 'inactive'
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    capacity?: number
                    age_group?: string
                    organization_id?: string
                    created_at?: string
                    updated_at?: string
                    teacher_id?: string | null
                    assistant_teacher_ids?: string[] | null
                    schedule?: Json | null
                    room_number?: string | null
                    status?: 'active' | 'inactive'
                }
            }
            student_class: {
                Row: {
                    id: string
                    student_id: string
                    class_id: string
                    start_date: string
                    end_date: string | null
                    status: 'active' | 'inactive' | 'completed'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    student_id: string
                    class_id: string
                    start_date: string
                    end_date?: string | null
                    status?: 'active' | 'inactive' | 'completed'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    student_id?: string
                    class_id?: string
                    start_date?: string
                    end_date?: string | null
                    status?: 'active' | 'inactive' | 'completed'
                    created_at?: string
                    updated_at?: string
                }
            }
            staff_schedules: {
                Row: {
                    id: string
                    staff_id: string
                    date: string
                    shift_start: string
                    shift_end: string
                    class_id: string | null
                    organization_id: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    staff_id: string
                    date: string
                    shift_start: string
                    shift_end: string
                    class_id?: string | null
                    organization_id: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    staff_id?: string
                    date?: string
                    shift_start?: string
                    shift_end?: string
                    class_id?: string | null
                    organization_id?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            students: {
                Row: {
                    id: string
                    first_name: string
                    last_name: string
                    date_of_birth: string
                    age_group: string
                    guardian_id: string | null
                    organization_id: string
                    status: 'active' | 'inactive' | 'waitlist'
                    created_at: string
                    updated_at: string
                    start_date: string | null
                }
                Insert: {
                    id?: string
                    first_name: string
                    last_name: string
                    date_of_birth: string
                    age_group: string
                    guardian_id?: string | null
                    organization_id: string
                    status?: 'active' | 'inactive' | 'waitlist'
                    created_at?: string
                    updated_at?: string
                    start_date?: string | null
                }
                Update: {
                    id?: string
                    first_name?: string
                    last_name?: string
                    date_of_birth?: string
                    age_group?: string
                    guardian_id?: string | null
                    organization_id?: string
                    status?: 'active' | 'inactive' | 'waitlist'
                    created_at?: string
                    updated_at?: string
                    start_date?: string | null
                }
            }
            // ... existing tables ...
        }
        // ... rest of the types ...
    }
} 