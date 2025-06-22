import { createClient } from './client';

export interface Appointment {
  id: number;
  created_at: string;
  name: string;
  AppointmentDateTime: string;
  Reason?: string;
}

export interface CreateAppointmentData {
  name: string;
  AppointmentDateTime: string;
  Reason?: string;
}

export interface UpdateAppointmentData {
  name?: string;
  AppointmentDateTime?: string;
  Reason?: string;
}

export class AppointmentService {
  private supabase = createClient();

  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await this.supabase
      .from('appointments_table')
      .select('*')
      .order('AppointmentDateTime', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }

    return data || [];
  }

  async getAppointmentsForDate(date: string): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await this.supabase
      .from('appointments_table')
      .select('*')
      .gte('AppointmentDateTime', startOfDay.toISOString())
      .lte('AppointmentDateTime', endOfDay.toISOString())
      .order('AppointmentDateTime', { ascending: true });

    if (error) {
      console.error('Error fetching appointments for date:', error);
      throw error;
    }

    return data || [];
  }

  async createAppointment(appointmentData: CreateAppointmentData): Promise<Appointment> {
    const { data, error } = await this.supabase
      .from('appointments_table')
      .insert([appointmentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }

    return data;
  }

  async updateAppointment(id: number, appointmentData: UpdateAppointmentData): Promise<Appointment> {
    const { data, error } = await this.supabase
      .from('appointments_table')
      .update(appointmentData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }

    return data;
  }

  async deleteAppointment(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('appointments_table')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  async getAppointmentStats(): Promise<{
    total: number;
    today: number;
    upcoming: number;
    past: number;
  }> {
    const { data, error } = await this.supabase
      .from('appointments_table')
      .select('AppointmentDateTime');

    if (error) {
      console.error('Error fetching appointment stats:', error);
      throw error;
    }

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: data?.length || 0,
      today: data?.filter(a => {
        const appointmentDate = new Date(a.AppointmentDateTime);
        return appointmentDate >= today && appointmentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }).length || 0,
      upcoming: data?.filter(a => new Date(a.AppointmentDateTime) > now).length || 0,
      past: data?.filter(a => new Date(a.AppointmentDateTime) < now).length || 0,
    };

    return stats;
  }
}

export const appointmentService = new AppointmentService();