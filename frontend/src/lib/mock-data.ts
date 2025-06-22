export interface PortalData {
  id: string
  name: string
  type: string
  description: string
  status: "active" | "inactive" | "maintenance"
  phoneNumber: string
  businessHours: {
    start: string
    end: string
    timezone: string
  }
  stats: {
    totalCalls: number
    avgDuration: string
    satisfaction: number
    lastCall: string
  }
  features: string[]
  icon: string
  color: string
}

export const mockPortals: PortalData[] = [
  {
    id: "1",
    name: "Customer Support Hub",
    type: "FAQ & Support",
    description: "24/7 customer support agent handling common questions and issues",
    status: "active",
    phoneNumber: "+1 (555) 123-4567",
    businessHours: {
      start: "00:00",
      end: "23:59",
      timezone: "EST"
    },
    stats: {
      totalCalls: 1247,
      avgDuration: "3:45",
      satisfaction: 4.8,
      lastCall: "2 minutes ago"
    },
    features: ["FAQ Database", "Ticket Creation", "Live Transfer", "Multi-language"],
    icon: "🎧",
    color: "bg-blue-500"
  },
  {
    id: "2",
    name: "Restaurant Reservations",
    type: "Booking Agent",
    description: "Automated restaurant reservation system with table management",
    status: "active",
    phoneNumber: "+1 (555) 234-5678",
    businessHours: {
      start: "09:00",
      end: "22:00",
      timezone: "EST"
    },
    stats: {
      totalCalls: 892,
      avgDuration: "2:30",
      satisfaction: 4.6,
      lastCall: "15 minutes ago"
    },
    features: ["Table Booking", "Menu Information", "Special Requests", "Confirmation SMS"],
    icon: "🍽️",
    color: "bg-green-500"
  },
  {
    id: "3",
    name: "Tech Support Desk",
    type: "Technical Support",
    description: "IT support agent for troubleshooting and technical assistance",
    status: "active",
    phoneNumber: "+1 (555) 345-6789",
    businessHours: {
      start: "08:00",
      end: "20:00",
      timezone: "EST"
    },
    stats: {
      totalCalls: 567,
      avgDuration: "8:15",
      satisfaction: 4.4,
      lastCall: "1 hour ago"
    },
    features: ["Remote Desktop", "Knowledge Base", "Escalation", "Ticket Tracking"],
    icon: "💻",
    color: "bg-purple-500"
  },
  {
    id: "4",
    name: "Order Management",
    type: "E-commerce",
    description: "Order processing and tracking for online retail business",
    status: "active",
    phoneNumber: "+1 (555) 456-7890",
    businessHours: {
      start: "06:00",
      end: "23:00",
      timezone: "EST"
    },
    stats: {
      totalCalls: 2034,
      avgDuration: "4:20",
      satisfaction: 4.7,
      lastCall: "5 minutes ago"
    },
    features: ["Order Status", "Returns", "Payment Issues", "Inventory Check"],
    icon: "📦",
    color: "bg-orange-500"
  },
  {
    id: "5",
    name: "Healthcare Assistant",
    type: "Medical Support",
    description: "Healthcare information and appointment scheduling system",
    status: "active",
    phoneNumber: "+1 (555) 567-8901",
    businessHours: {
      start: "07:00",
      end: "21:00",
      timezone: "EST"
    },
    stats: {
      totalCalls: 445,
      avgDuration: "5:30",
      satisfaction: 4.9,
      lastCall: "30 minutes ago"
    },
    features: ["Appointment Booking", "Health Info", "Prescription Refills", "Emergency Routing"],
    icon: "🏥",
    color: "bg-red-500"
  },
  {
    id: "6",
    name: "Travel Booking Agent",
    type: "Travel & Tourism",
    description: "Flight and hotel booking assistant with travel recommendations",
    status: "active",
    phoneNumber: "+1 (555) 678-9012",
    businessHours: {
      start: "00:00",
      end: "23:59",
      timezone: "EST"
    },
    stats: {
      totalCalls: 1234,
      avgDuration: "6:45",
      satisfaction: 4.5,
      lastCall: "10 minutes ago"
    },
    features: ["Flight Booking", "Hotel Reservations", "Travel Insurance", "Itinerary Management"],
    icon: "✈️",
    color: "bg-cyan-500"
  },
  {
    id: "7",
    name: "Financial Advisor",
    type: "Banking & Finance",
    description: "Personal finance assistant for account management and advice",
    status: "active",
    phoneNumber: "+1 (555) 789-0123",
    businessHours: {
      start: "08:00",
      end: "18:00",
      timezone: "EST"
    },
    stats: {
      totalCalls: 789,
      avgDuration: "7:20",
      satisfaction: 4.6,
      lastCall: "45 minutes ago"
    },
    features: ["Account Balance", "Transaction History", "Investment Advice", "Fraud Protection"],
    icon: "💰",
    color: "bg-emerald-500"
  },
  {
    id: "8",
    name: "Real Estate Agent",
    type: "Property Management",
    description: "Property search and real estate consultation assistant",
    status: "inactive",
    phoneNumber: "+1 (555) 890-1234",
    businessHours: {
      start: "09:00",
      end: "17:00",
      timezone: "EST"
    },
    stats: {
      totalCalls: 234,
      avgDuration: "9:15",
      satisfaction: 4.3,
      lastCall: "2 hours ago"
    },
    features: ["Property Search", "Virtual Tours", "Mortgage Calculator", "Agent Connect"],
    icon: "🏠",
    color: "bg-yellow-500"
  },
  {
    id: "9",
    name: "Legal Assistant",
    type: "Legal Services",
    description: "Legal information and consultation scheduling system",
    status: "maintenance",
    phoneNumber: "+1 (555) 901-2345",
    businessHours: {
      start: "09:00",
      end: "17:00",
      timezone: "EST"
    },
    stats: {
      totalCalls: 156,
      avgDuration: "12:30",
      satisfaction: 4.7,
      lastCall: "1 day ago"
    },
    features: ["Legal Consultation", "Document Review", "Case Status", "Appointment Booking"],
    icon: "⚖️",
    color: "bg-indigo-500"
  },
  {
    id: "10",
    name: "Education Tutor",
    type: "Educational Support",
    description: "Homework help and educational resource assistant",
    status: "active",
    phoneNumber: "+1 (555) 012-3456",
    businessHours: {
      start: "14:00",
      end: "22:00",
      timezone: "EST"
    },
    stats: {
      totalCalls: 678,
      avgDuration: "15:45",
      satisfaction: 4.8,
      lastCall: "20 minutes ago"
    },
    features: ["Homework Help", "Study Resources", "Progress Tracking", "Parent Updates"],
    icon: "📚",
    color: "bg-pink-500"
  }
] 