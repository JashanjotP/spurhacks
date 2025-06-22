import { createClient } from './client';

export interface Booking {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  business_id: string;
  customer_name: string;
  customer_phone: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

export interface UpdateBookingData {
  customer_name?: string;
  customer_phone?: string;
  appointment_date?: string;
  appointment_time?: string;
  status?: Booking['status'];
  notes?: string;
}

export class BookingService {
  private supabase = createClient();

  async getBookings(businessId: string): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('business_id', businessId)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }

    return data || [];
  }

  async getBookingsForDate(businessId: string, date: string): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('business_id', businessId)
      .eq('appointment_date', date)
      .order('appointment_time', { ascending: true });

    if (error) {
      console.error('Error fetching bookings for date:', error);
      throw error;
    }

    return data || [];
  }

  async createBooking(bookingData: CreateBookingData): Promise<Booking> {
    const { data, error } = await this.supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    return data;
  }

  async updateBooking(id: string, bookingData: UpdateBookingData): Promise<Booking> {
    const { data, error } = await this.supabase
      .from('bookings')
      .update(bookingData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      throw error;
    }

    return data;
  }

  async deleteBooking(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }

  async getBookingStats(businessId: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  }> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('status')
      .eq('business_id', businessId);

    if (error) {
      console.error('Error fetching booking stats:', error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      pending: data?.filter(b => b.status === 'pending').length || 0,
      confirmed: data?.filter(b => b.status === 'confirmed').length || 0,
      cancelled: data?.filter(b => b.status === 'cancelled').length || 0,
      completed: data?.filter(b => b.status === 'completed').length || 0,
    };

    return stats;
  }
}

export const bookingService = new BookingService(); 