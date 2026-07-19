'use client';

import { motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';

// Placeholder — wire up to /api/v1/notifications when backend route is added
export default function NotificationsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-blue-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground text-sm">Real-time alerts and updates</p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-3 py-2">
          <CheckCheck className="w-4 h-4" aria-hidden="true" />
          Mark all read
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-10 text-center">
        <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
        <p className="text-foreground font-medium">No new notifications</p>
        <p className="text-muted-foreground text-sm mt-1">
          You&apos;ll see incident alerts, assignments, and system messages here.
        </p>
      </div>
    </motion.div>
  );
}
