"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Phone, Clock, User, Plus, Edit, Trash, Users, TrendingUp } from "lucide-react";
import { format, isToday, isSameDay, addDays, parseISO } from "date-fns";
import { appointmentService, Appointment, CreateAppointmentData, UpdateAppointmentData } from "@/lib/supabase/booking-service";

interface BookingCalendarProps {
  businessId?: string;
  businessPhone: string;
}

export function BookingCalendar({ businessId, businessPhone }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingAppointment, setEditingAppointment] = React.useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = React.useState({
    name: '',
    date: '',
    time: '',
    reason: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [stats, setStats] = React.useState({
    total: 0,
    today: 0,
    upcoming: 0,
    past: 0
  });

  // Load appointments from database
  React.useEffect(() => {
    loadAppointments();
    loadStats();
  }, []);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await appointmentService.getAppointmentStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.AppointmentDateTime);
      return isSameDay(appointmentDate, date);
    });
  };

  const handleAddAppointment = async () => {
    if (!selectedDate || !newAppointment.name || !newAppointment.time) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Combine date and time into a single datetime
      const dateTimeString = `${format(selectedDate, 'yyyy-MM-dd')}T${newAppointment.time}:00`;
      
      const appointmentData: CreateAppointmentData = {
        name: newAppointment.name,
        AppointmentDateTime: dateTimeString,
        Reason: newAppointment.reason || undefined
      };

      await appointmentService.createAppointment(appointmentData);
      await loadAppointments();
      await loadStats();
      
      setNewAppointment({ name: '', date: '', time: '', reason: '' });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAppointment = async () => {
    if (!editingAppointment) return;

    try {
      setIsLoading(true);
      
      // If date or time changed, update the AppointmentDateTime
      let appointmentDateTime = editingAppointment.AppointmentDateTime;
      if (newAppointment.date || newAppointment.time) {
        const currentDate = new Date(editingAppointment.AppointmentDateTime);
        const newDate = newAppointment.date ? new Date(newAppointment.date) : currentDate;
        const [hours, minutes] = newAppointment.time ? newAppointment.time.split(':') : [currentDate.getHours().toString(), currentDate.getMinutes().toString()];
        
        newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        appointmentDateTime = newDate.toISOString();
      }

      const updateData: UpdateAppointmentData = {
        name: editingAppointment.name,
        AppointmentDateTime: appointmentDateTime,
        Reason: editingAppointment.Reason
      };

      await appointmentService.updateAppointment(editingAppointment.id, updateData);
      await loadAppointments();
      await loadStats();
      
      setEditingAppointment(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      setIsLoading(true);
      await appointmentService.deleteAppointment(appointmentId);
      await loadAppointments();
      await loadStats();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Appointment Calendar</h2>
          <p className="text-slate-300 text-lg">Manage appointments and customer bookings</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 bg-slate-800 rounded-lg px-4 py-2 border border-slate-700">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <Phone className="w-4 h-4 text-slate-300" />
            <span className="text-slate-300 font-medium">{businessPhone}</span>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200" disabled={isLoading}>
                <Plus className="w-5 h-5 mr-2" />
                Add Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white text-xl font-bold">Add New Appointment</DialogTitle>
                <DialogDescription className="text-slate-300">
                  Schedule a new appointment for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'selected date'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white font-medium">Customer Name</Label>
                  <Input
                    id="name"
                    value={newAppointment.name}
                    onChange={(e) => setNewAppointment({ ...newAppointment, name: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white mt-1"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-white font-medium">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="reason" className="text-white font-medium">Reason (Optional)</Label>
                  <Input
                    id="reason"
                    value={newAppointment.reason}
                    onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white mt-1"
                    placeholder="Appointment reason..."
                  />
                </div>
                <Button onClick={handleAddAppointment} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Appointment"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Appointments</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Today</p>
              <p className="text-2xl font-bold">{stats.today}</p>
            </div>
            <Clock className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Upcoming</p>
              <p className="text-2xl font-bold">{stats.upcoming}</p>
            </div>
            <Users className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm font-medium">Past</p>
              <p className="text-2xl font-bold">{stats.past}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card className="bg-slate-900 border-slate-700 shadow-xl">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* Appointments for Selected Date */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-700 shadow-xl h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''} for this date
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-400 font-medium">Loading appointments...</p>
                </div>
              ) : selectedDateAppointments.length === 0 ? (
                <div className="text-center py-20 px-6">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CalendarIcon className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-2">No Appointments</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    No appointments scheduled for this date.
                  </p>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-6">
                  {selectedDateAppointments.map((appointment) => {
                    const appointmentDate = new Date(appointment.AppointmentDateTime);
                    const timeString = format(appointmentDate, 'h:mm a');
                    
                    return (
                      <div key={appointment.id} className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-5 border border-slate-600 shadow-lg hover:shadow-xl transition-all duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                              <Clock className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-white text-lg">{timeString}</span>
                          </div>
                          <Badge className="bg-blue-500 text-white font-semibold px-3 py-1">
                            Scheduled
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-slate-600 rounded-md">
                              <User className="w-4 h-4 text-slate-300" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{appointment.name}</p>
                              <p className="text-slate-400 text-sm">Customer</p>
                            </div>
                          </div>
                          {appointment.Reason && (
                            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                              <p className="text-slate-300 text-sm italic">"{appointment.Reason}"</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-5 pt-4 border-t border-slate-600">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingAppointment(appointment);
                              setNewAppointment({
                                name: appointment.name,
                                date: format(appointmentDate, 'yyyy-MM-dd'),
                                time: format(appointmentDate, 'HH:mm'),
                                reason: appointment.Reason || ''
                              });
                              setIsEditDialogOpen(true);
                            }}
                            className="flex-1 bg-slate-700 border-slate-600 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
                            disabled={isLoading}
                          >
                            <Edit className="w-3 h-3 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            className="flex-1 bg-slate-700 border-slate-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                            disabled={isLoading}
                          >
                            <Trash className="w-3 h-3 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Appointments List */}
      <div className="mt-8">
        <Card className="bg-slate-900 border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold">All Appointments</CardTitle>
            <CardDescription className="text-slate-300">A complete list of all your scheduled appointments.</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="p-4 text-slate-300 font-semibold">Customer</th>
                  <th className="p-4 text-slate-300 font-semibold">Date & Time</th>
                  <th className="p-4 text-slate-300 font-semibold">Reason</th>
                  <th className="p-4 text-slate-300 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((appointment) => {
                    const appointmentDate = new Date(appointment.AppointmentDateTime);
                    const isPast = appointmentDate < new Date();
                    
                    return (
                      <tr key={appointment.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="p-4">
                          <p className="font-medium text-white">{appointment.name}</p>
                        </td>
                        <td className="p-4 text-slate-300">
                          {format(appointmentDate, 'MMM d, yyyy')} at {format(appointmentDate, 'h:mm a')}
                        </td>
                        <td className="p-4">
                          <p className="text-slate-400 text-sm">{appointment.Reason || 'No reason specified'}</p>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingAppointment(appointment);
                                setNewAppointment({
                                  name: appointment.name,
                                  date: format(appointmentDate, 'yyyy-MM-dd'),
                                  time: format(appointmentDate, 'HH:mm'),
                                  reason: appointment.Reason || ''
                                });
                                setIsEditDialogOpen(true);
                              }}
                              className="bg-slate-700 border-slate-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                              disabled={isLoading}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className="bg-slate-700 border-slate-600 text-red-400 hover:bg-red-600 hover:text-white"
                              disabled={isLoading}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-16">
                      <p className="text-slate-400">You have no appointments scheduled yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Appointment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Edit Appointment</DialogTitle>
            <DialogDescription className="text-slate-300">
              Update appointment details
            </DialogDescription>
          </DialogHeader>
          {editingAppointment && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-white font-medium">Customer Name</Label>
                <Input
                  id="edit-name"
                  value={editingAppointment.name}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, name: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-time" className="text-white font-medium">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-reason" className="text-white font-medium">Reason</Label>
                <Input
                  id="edit-reason"
                  value={editingAppointment.Reason || ''}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, Reason: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>
              <Button onClick={handleEditAppointment} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Appointment"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}