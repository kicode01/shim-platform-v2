"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Calendar, Loader2, QrCode, Users } from "lucide-react";

interface EventItem {
  id: string;
  name: string;
  date: string | null;
  description: string | null;
  createdAt: string;
  _count: { certificates: number };
  defaultTemplateId?: string | null;
}

interface EventsClientProps {
  initialEvents: EventItem[];
  templates: { id: string; name: string }[];
}

export default function EventsClient({ initialEvents, templates }: EventsClientProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [isCreating, setIsCreating] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [defaultTemplateId, setDefaultTemplateId] = useState("");
  const [defaultRole, setDefaultRole] = useState("Participant");

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newEventName,
          date: newEventDate || null,
          description: newEventDesc,
          defaultTemplateId: defaultTemplateId || null,
          defaultRole: defaultRole
        })
      });

      if (res.ok) {
        const created = await res.json();
        setEvents([{ ...created, _count: { certificates: 0 } }, ...events]);
        setNewEventName("");
        setNewEventDate("");
        setNewEventDesc("");
        setDefaultTemplateId("");
        setDefaultRole("Participant");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating event");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 min-h-0 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-1">
            Events Management
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Organize events and issue batch certificates efficiently.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Event List */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-0">
          <div className="px-6 py-5 border-b border-zinc-100 bg-white shrink-0 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              Your Events
            </h2>
          </div>

          <div className="flex flex-col flex-1 min-h-0">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center mb-4">
                  <Calendar size={20} className="text-zinc-400" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-1">No events found</h3>
                <p className="text-zinc-500 text-sm max-w-sm mb-6">
                  Create your first event to start issuing credentials.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-y-scroll overflow-x-hidden invisible-scrollbar bg-white border-b border-zinc-100 shrink-0">
                  <table className="w-full table-fixed text-sm">
                    <thead>
                      <tr className="bg-zinc-50/50">
                        <th className="w-[40%] px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Event Name</th>
                        <th className="w-[25%] px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                        <th className="w-[20%] px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Issued</th>
                        <th className="w-[15%] px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div className="overflow-y-scroll overflow-x-hidden flex-1 min-h-0 bg-white">
                  <table className="w-full table-fixed text-sm">
                    <tbody className="divide-y divide-zinc-100">
                      {events.map((evt) => (
                        <tr key={evt.id} className="hover:bg-zinc-50/80 transition-colors group">
                          <td className="w-[40%] px-6 py-4 overflow-hidden">
                            <div className="font-medium text-zinc-900 truncate">{evt.name}</div>
                            {evt.description && <div className="text-zinc-500 truncate mt-0.5 text-xs">{evt.description}</div>}
                          </td>
                          <td className="w-[25%] px-6 py-4">
                            <div className="text-zinc-600">
                              {evt.date ? new Date(evt.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "TBA"}
                            </div>
                          </td>
                          <td className="w-[20%] px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
                              {evt._count.certificates}
                            </span>
                          </td>
                          <td className="w-[15%] px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link 
                                href={`/dashboard/events/${evt.id}`}
                                className="inline-flex items-center justify-center p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                                title="View Attendees"
                              >
                                <Users size={18} />
                              </Link>
                              <Link 
                                href={`/kiosk/${evt.id}`}
                                target="_blank"
                                className="inline-flex items-center justify-center p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Launch Kiosk"
                              >
                                <QrCode size={18} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Create Event Form */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col h-full min-h-0 overflow-y-auto">
          <div className="px-6 py-5 border-b border-zinc-100 bg-white shrink-0">
            <h3 className="text-lg font-semibold text-zinc-900">
              Create New Event
            </h3>
          </div>
          <form onSubmit={handleCreateEvent} className="p-6 flex flex-col gap-5 flex-1 min-h-0">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700">Event Name</label>
              <input 
                type="text" 
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors shadow-sm" 
                value={newEventName} 
                onChange={e => setNewEventName(e.target.value)} 
                required 
                placeholder="e.g. Tech Summit 2026" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700">Event Date</label>
              <input 
                type="date" 
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors shadow-sm" 
                value={newEventDate} 
                onChange={e => setNewEventDate(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700">Description (Optional)</label>
              <textarea 
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors shadow-sm resize-none overflow-y-scroll min-h-[80px]" 
                style={{ scrollbarColor: '#cbd5e1 transparent', scrollbarWidth: 'thin' }}
                value={newEventDesc} 
                onChange={e => setNewEventDesc(e.target.value)} 
                placeholder="Brief description of the event..." 
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700">Default Role</label>
              <input 
                type="text" 
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors shadow-sm" 
                value={defaultRole} 
                onChange={e => setDefaultRole(e.target.value)} 
                placeholder="e.g. Participant" 
              />
            </div>
            
            <div className="flex flex-col gap-1.5 pb-2">
              <label className="text-sm font-medium text-zinc-700">Automated Kiosk Template (Optional)</label>
              <select
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors shadow-sm"
                value={defaultTemplateId}
                onChange={e => setDefaultTemplateId(e.target.value)}
              >
                <option value="">None (Deferred Batch Issue)</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <p className="text-xs text-zinc-500">
                If selected, attendees get this certificate instantly when they scan in at the Kiosk.
              </p>
            </div>

            <button 
              type="submit" 
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-md px-4 py-2.5 text-sm font-medium transition-colors flex justify-center items-center gap-2 mt-auto shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={isCreating || !newEventName}
            >
              {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              <span>Create Event</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
