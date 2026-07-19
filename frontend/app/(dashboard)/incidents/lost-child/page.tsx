'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, AlertTriangle, Search, CheckCircle, Globe } from 'lucide-react';
import { incidentApi, getErrorMessage } from '@/lib/api';
import { cn, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

const schema = z.object({
  description: z.string().min(20, 'Please provide more details'),
  guardianName: z.string().min(2, 'Guardian name is required'),
  guardianContact: z.string().min(5, 'Contact number is required'),
  lastSeenLocation: z.string().min(3, 'Last seen location is required'),
  childName: z.string().optional(),
  childAge: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AiAnalysis {
  severity: string;
  severityReason: string;
  searchProtocol: string[];
  nearbyCheckpoints: string[];
  searchRadius: string;
  immediateActions: string[];
  announcementTemplate: string;
  timeline: Array<{ time: string; action: string }>;
}

export default function LostChildPage() {
  const [step, setStep] = useState<'form' | 'analysis'>('form');
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [announcements, setAnnouncements] = useState<Record<string, string> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const description = watch('description', '');

  const { mutate: createIncident, isPending: isCreating } = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        childAge: data.childAge ? parseInt(data.childAge, 10) : undefined,
      };
      return incidentApi.createLostChild(payload);
    },
    onSuccess: (response) => {
      const { aiAnalysis: ai } = response.data.data;
      setAiAnalysis(ai);
      setStep('analysis');
      toast.success('Incident reported. AI protocol generated.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const { mutate: genAnnouncements, isPending: isGenAnn } = useMutation({
    mutationFn: (desc: string) =>
      incidentApi.generateAnnouncements({
        childDescription: desc,
        languages: ['en', 'es', 'fr', 'pt', 'ar', 'hi'],
      }).then((r) => r.data.data),
    onSuccess: (data) => {
      setAnnouncements(data);
      toast.success('Multilingual announcements generated');
    },
  });

  const { data: activeCases } = useQuery({
    queryKey: ['lost-child-cases'],
    queryFn: () => incidentApi.getLostChildCases().then((r) => r.data.data),
    refetchInterval: 10000,
  });

  const severityColors: Record<string, string> = {
    low: 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30',
    medium: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
    high: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30',
    critical: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Baby className="w-6 h-6 text-amber-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lost Child Assistant</h1>
          <p className="text-muted-foreground text-sm">
            AI-powered search protocol and multilingual announcements
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-4">Report Lost Child</h2>
                <form onSubmit={handleSubmit((data) => createIncident(data))} noValidate>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                        Describe the situation <span aria-label="required">*</span>
                      </label>
                      <textarea
                        id="description"
                        {...register('description')}
                        rows={4}
                        placeholder="Include: child appearance, clothing, last seen time and location, distinguishing features..."
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm placeholder-muted-foreground resize-none bg-background"
                        aria-required="true"
                        aria-invalid={!!errors.description}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500 mt-1" role="alert">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="childName" className="block text-sm font-medium text-foreground mb-1.5">
                          Child&apos;s Name (if known)
                        </label>
                        <input
                          id="childName"
                          type="text"
                          {...register('childName')}
                          className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label htmlFor="childAge" className="block text-sm font-medium text-foreground mb-1.5">
                          Age (if known)
                        </label>
                        <input
                          id="childAge"
                          type="number"
                          min={0}
                          max={17}
                          {...register('childAge')}
                          className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
                          placeholder="0–17"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="lastSeenLocation" className="block text-sm font-medium text-foreground mb-1.5">
                        Last Seen Location <span aria-label="required">*</span>
                      </label>
                      <input
                        id="lastSeenLocation"
                        type="text"
                        {...register('lastSeenLocation')}
                        className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
                        placeholder="e.g., Gate B, Section 12, Food Court"
                        aria-required="true"
                        aria-invalid={!!errors.lastSeenLocation}
                      />
                      {errors.lastSeenLocation && (
                        <p className="text-sm text-red-500 mt-1" role="alert">{errors.lastSeenLocation.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="guardianName" className="block text-sm font-medium text-foreground mb-1.5">
                          Guardian Name <span aria-label="required">*</span>
                        </label>
                        <input
                          id="guardianName"
                          type="text"
                          {...register('guardianName')}
                          className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
                          aria-required="true"
                          aria-invalid={!!errors.guardianName}
                        />
                        {errors.guardianName && (
                          <p className="text-sm text-red-500 mt-1" role="alert">{errors.guardianName.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="guardianContact" className="block text-sm font-medium text-foreground mb-1.5">
                          Guardian Contact <span aria-label="required">*</span>
                        </label>
                        <input
                          id="guardianContact"
                          type="tel"
                          {...register('guardianContact')}
                          className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
                          aria-required="true"
                          aria-invalid={!!errors.guardianContact}
                        />
                        {errors.guardianContact && (
                          <p className="text-sm text-red-500 mt-1" role="alert">{errors.guardianContact.message}</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCreating}
                      className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                    >
                      {isCreating ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                          Report &amp; Generate AI Protocol
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-card border border-border rounded-2xl p-4">
                  <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4" aria-hidden="true" />
                    Active Searches ({Array.isArray(activeCases) ? activeCases.length : 0})
                  </h3>
                  {Array.isArray(activeCases) && activeCases.length > 0 ? (
                    <div className="space-y-2">
                      {activeCases.map((c: { _id: string; childName?: string; childDescription: string; status: string; createdAt: string }) => (
                        <div key={c._id} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{c.childName || 'Unknown child'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.childDescription}</p>
                          <p className="text-xs text-amber-500 mt-1">{formatRelativeTime(c.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No active searches</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'analysis' && aiAnalysis && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className={cn('border rounded-xl p-4 flex items-start gap-3', severityColors[aiAnalysis.severity] || severityColors.medium)}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold capitalize">Severity: {aiAnalysis.severity}</p>
                <p className="text-sm mt-0.5">{aiAnalysis.severityReason}</p>
                <p className="text-sm font-medium mt-1">Search Radius: {aiAnalysis.searchRadius}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" aria-hidden="true" />
                  Immediate Actions
                </h3>
                <ol className="space-y-2">
                  {aiAnalysis.immediateActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">{i + 1}</span>
                      {action}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-500" aria-hidden="true" />
                  Search Protocol
                </h3>
                <ol className="space-y-2">
                  {aiAnalysis.searchProtocol.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold mb-3">Nearby Checkpoints</h3>
                <ul className="space-y-1.5">
                  {aiAnalysis.nearbyCheckpoints.map((cp, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" aria-hidden="true" />
                      {cp}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold mb-3">Action Timeline</h3>
                <div className="space-y-3">
                  {aiAnalysis.timeline.map((t, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="text-xs font-mono text-primary font-bold w-16 flex-shrink-0 mt-0.5">{t.time}</span>
                      <span className="text-foreground">{t.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-500" aria-hidden="true" />
                  Public Announcement Template
                </h3>
                <button
                  onClick={() => genAnnouncements(description)}
                  disabled={isGenAnn}
                  className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {isGenAnn ? 'Generating...' : 'Translate All Languages'}
                </button>
              </div>
              <div className="bg-muted rounded-xl p-4 text-sm">{aiAnalysis.announcementTemplate}</div>
              {announcements && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(announcements).map(([lang, text]) => (
                    <div key={lang} className="bg-background border border-border rounded-lg p-3">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{lang}</p>
                      <p className="text-sm">{text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 border border-border text-foreground py-2.5 rounded-xl hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Report Another
              </button>
              <button
                onClick={() => (window.location.href = '/incidents')}
                className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                View All Incidents
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
