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
import { format, isToday, isSameDay, addDays } from "date-fns";

interface BookingSlot {
  id: string;
  date: Date;
  time: string;
  customerName: string;
  customerPhone: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

interface BookingCalendarProps {
  businessId: string;
  businessPhone: string;
}

export function BookingCalendar({ businessId, businessPhone }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [bookings, setBookings] = React.useState<BookingSlot[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingBooking, setEditingBooking] = React.useState<BookingSlot | null>(null);
  const [newBooking, setNewBooking] = React.useState({
    time: '',
    customerName: '',
    customerPhone: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);

  // Mock data - in real app, this would come from API
  React.useEffect(() => {
    const mockBookings: BookingSlot[] = [
      {
        id: '1',
        date: new Date(),
        time: '10:00 AM',
        customerName: 'John Doe',
        customerPhone: '+1 (555) 123-4567',
        status: 'confirmed',
        notes: 'First time customer'
      },
      {
        id: '2',
        date: addDays(new Date(), 1),
        time: '2:30 PM',
        customerName: 'Jane Smith',
        customerPhone: '+1 (555) 987-6543',
        status: 'pending',
        notes: 'Follow-up appointment'
      },
      {
        id: '3',
        date: addDays(new Date(), 2),
        time: '11:15 AM',
        customerName: 'Mike Johnson',
        customerPhone: '+1 (555) 456-7890',
        status: 'confirmed'
      }
    ];
    setBookings(mockBookings);
  }, []);

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => isSameDay(booking.date, date));
  };

  const getStatusColor = (status: BookingSlot['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAddBooking = () => {
    if (!selectedDate || !newBooking.time || !newBooking.customerName || !newBooking.customerPhone) {
      return;
    }

    const booking: BookingSlot = {
      id: Date.now().toString(),
      date: selectedDate,
      time: newBooking.time,
      customerName: newBooking.customerName,
      customerPhone: newBooking.customerPhone,
      status: 'pending',
      notes: newBooking.notes
    };

    setBookings([...bookings, booking]);
    setNewBooking({ time: '', customerName: '', customerPhone: '', notes: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditBooking = () => {
    if (!editingBooking) return;

    setBookings(bookings.map(booking => 
      booking.id === editingBooking.id ? editingBooking : booking
    ));
    setEditingBooking(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteBooking = (bookingId: string) => {
    setBookings(bookings.filter(booking => booking.id !== bookingId));
  };

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Booking Calendar</h2>
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
                Add Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white text-xl font-bold">Add New Booking</DialogTitle>
                <DialogDescription className="text-slate-300">
                  Schedule a new appointment for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'selected date'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="time" className="text-white font-medium">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newBooking.time}
                    onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customerName" className="text-white font-medium">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={newBooking.customerName}
                    onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white mt-1"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone" className="text-white font-medium">Customer Phone</Label>
                  <Input
                    id="customerPhone"
                    value={newBooking.customerPhone}
                    onChange={(e) => setNewBooking({ ...newBooking, customerPhone: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white mt-1"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="notes" className="text-white font-medium">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                    className="bg-slate-800 border-slate-600 text-white mt-1"
                    placeholder="Any special notes..."
                  />
                </div>
                <Button onClick={handleAddBooking} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Booking"}
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
              <p className="text-blue-100 text-sm font-medium">Total Bookings</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Confirmed</p>
              <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</p>
            </div>
            <Users className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Cancelled</p>
              <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'cancelled').length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-200" />
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

        {/* Bookings for Selected Date */}
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
                {selectedDateBookings.length} booking{selectedDateBookings.length !== 1 ? 's' : ''} for this date
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-400 font-medium">Loading bookings...</p>
                </div>
              ) : selectedDateBookings.length === 0 ? (
                <div className="text-center py-20 px-6">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CalendarIcon className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-2">No Bookings</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    No appointments scheduled for this date.
                  </p>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Booking
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-6">
                  {selectedDateBookings.map((booking) => (
                    <div key={booking.id} className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-5 border border-slate-600 shadow-lg hover:shadow-xl transition-all duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-600 rounded-lg">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-bold text-white text-lg">{booking.time}</span>
                        </div>
                        <Badge className={`${getStatusColor(booking.status)} text-white font-semibold px-3 py-1`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-slate-600 rounded-md">
                            <User className="w-4 h-4 text-slate-300" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{booking.customerName}</p>
                            <p className="text-slate-400 text-sm">Customer</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-slate-600 rounded-md">
                            <Phone className="w-4 h-4 text-slate-300" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{booking.customerPhone}</p>
                            <p className="text-slate-400 text-sm">Phone Number</p>
                          </div>
                        </div>
                        {booking.notes && (
                          <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                            <p className="text-slate-300 text-sm italic">"{booking.notes}"</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-5 pt-4 border-t border-slate-600">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingBooking(booking);
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
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="flex-1 bg-slate-700 border-slate-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                          disabled={isLoading}
                        >
                          <Trash className="w-3 h-3 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Bookings List */}
      <div className="mt-8">
        <Card className="bg-slate-900 border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-xl font-bold">All Appointments</CardTitle>
            <CardDescription className="text-slate-300">A complete list of all your scheduled bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="p-4 text-slate-300 font-semibold">Customer</th>
                  <th className="p-4 text-slate-300 font-semibold">Date & Time</th>
                  <th className="p-4 text-slate-300 font-semibold">Status</th>
                  <th className="p-4 text-slate-300 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4">
                        <p className="font-medium text-white">{booking.customerName}</p>
                        <p className="text-sm text-slate-400">{booking.customerPhone}</p>
                      </td>
                      <td className="p-4 text-slate-300">
                        {format(booking.date, 'MMM d, yyyy')} at {booking.time}
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(booking.status)} text-white`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingBooking(booking);
                              setIsEditDialogOpen(true);
                            }}
                            className="bg-slate-700 border-slate-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="bg-slate-700 border-slate-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-16">
                      <p className="text-slate-400">You have no appointments booked yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Edit Booking</DialogTitle>
            <DialogDescription className="text-slate-300">
              Update booking details
            </DialogDescription>
          </DialogHeader>
          {editingBooking && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-time" className="text-white font-medium">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editingBooking.time}
                  onChange={(e) => setEditingBooking({ ...editingBooking, time: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-customerName" className="text-white font-medium">Customer Name</Label>
                <Input
                  id="edit-customerName"
                  value={editingBooking.customerName}
                  onChange={(e) => setEditingBooking({ ...editingBooking, customerName: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-customerPhone" className="text-white font-medium">Customer Phone</Label>
                <Input
                  id="edit-customerPhone"
                  value={editingBooking.customerPhone}
                  onChange={(e) => setEditingBooking({ ...editingBooking, customerPhone: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-status" className="text-white font-medium">Status</Label>
                <select
                  id="edit-status"
                  value={editingBooking.status}
                  onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value as BookingSlot['status'] })}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-notes" className="text-white font-medium">Notes</Label>
                <Input
                  id="edit-notes"
                  value={editingBooking.notes || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, notes: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>
              <Button onClick={handleEditBooking} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Booking"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 