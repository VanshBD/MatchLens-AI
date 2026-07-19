'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { incidentApi, getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const schema = z.object({
  description: z.string().min(15, 'Please describe the emergency in detail'),
  location: z.string().min(3, 'Location is required'),
  section: z.string().optional(),
  patientAge: z.string().optional(),
  patientGender: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface MedicalAiAnalysis {
  emergencyType: string;
  severity: string;
  immediateActions: string[];
  doNotDo: string[];
  nearestMedicalStation: string;
  crowdDiversionPlan: string;
  requiredEquipment: string[];
  protocol: string[];
  volunteerInstructions: string;
  escalationRequired: boolean;
  estimatedResponseTime: string;
}

export default function MedicalEmergencyPage() {
  const [step, setStep] = useState<'form' | 'protocol'>('form');
  const [aiAnalysis, setAiAnalysis] = useState<MedicalAiAnalysis | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate: createIncident, isPending } = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        patientAge: data.patientAge ? parseInt(data.patientAge, 10) : undefined,
      };
      return incidentApi.createMedical(payload);
    },
    onSuccess: (response) => {
      const { aiAnalysis: ai } = response.data.data;
      setAiAnalysis(ai);
      setStep('protocol');
      toast.success('Medical incident reported. Protocol generated.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const { data: activeEmergencies } = useQuery({
    queryKey: ['medical-emergencies'],
    queryFn: () => incidentApi.getMedicalEmergencies().then((r) => r.data.data),
    refetchInterval: 15000,
  });

  const severityColors: Record<string, string> = {
    low: 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300',
    medium: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
    high: 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300',
    critical: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <HeartPulse className="w-6 h-6 text-red-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medical Emergency</h1>
          <p className="text-muted-foreground text-sm">AI-powered medical response protocol</p>
        </div>
        {aiAnalysis?.escalationRequired && (
          <div className="ml-auto bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 animate-pulse" role="alert">
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            Escalation Required
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-4">Report Medical Emergency</h2>
                <form onSubmit={handleSubmit((data) => createIncident(data))} noValidate>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
                        Emergency Description <span aria-label="required">*</span>
                      </label>
                      <textarea
                        id="description"
                        {...register('description')}
                        rows={4}
                        placeholder="Describe the patient's condition, symptoms, and what happened..."
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
                        <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1.5">
                          Location <span aria-label="required">*</span>
                        </label>
                        <input
                          id="location"
                          type="text"
                          {...register('location')}
                          className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
                          placeholder="e.g., Section 7, Row 15"
                          aria-required="true"
                          aria-invalid={!!errors.location}
                        />
                        {errors.location && (
                          <p className="text-sm text-red-500 mt-1" role="alert">{errors.location.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="section" className="block text-sm font-medium text-foreground mb-1.5">
                          Stadium Section
                        </label>
                        <input
                          id="section"
                          type="text"
                          {...register('section')}
                          className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
                          placeholder="e.g., North Stand"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="patientAge" className="block text-sm font-medium text-foreground mb-1.5">
                          Patient Age (approx.)
                        </label>
                        <input
                          id="patientAge"
                          type="number"
                          min={0}
                          max={150}
                          {...register('patientAge')}
                          className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label htmlFor="patientGender" className="block text-sm font-medium text-foreground mb-1.5">
                          Patient Gender
                        </label>
                        <select
                          id="patientGender"
                          {...register('patientGender')}
                          className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
                        >
                          <option value="">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                    >
                      {isPending ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                          Generating Protocol...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                          Report &amp; Get AI Protocol
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4" aria-hidden="true" />
                    Active Emergencies ({Array.isArray(activeEmergencies) ? activeEmergencies.length : 0})
                  </h3>
                  {Array.isArray(activeEmergencies) && activeEmergencies.length > 0 ? (
                    <div className="space-y-2">
                      {activeEmergencies.slice(0, 5).map((e: { _id: string; emergencyType: string; location: string }) => (
                        <div key={e._id} className="p-3 bg-card border border-border rounded-xl text-sm">
                          <p className="font-medium text-red-600 dark:text-red-400 capitalize">{e.emergencyType?.replace(/_/g, ' ')}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">{e.location}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">No active emergencies</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'protocol' && aiAnalysis && (
          <motion.div key="protocol" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className={cn('border rounded-2xl p-4 flex items-start gap-3', severityColors[aiAnalysis.severity] || severityColors.medium)}>
              <HeartPulse className="w-6 h-6 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-lg capitalize">{aiAnalysis.emergencyType?.replace(/_/g, ' ')}</p>
                  <span className="text-sm font-medium px-2 py-0.5 bg-foreground/10 rounded-full capitalize">{aiAnalysis.severity}</span>
                </div>
                <p className="text-sm mt-1"><strong>Nearest Station:</strong> {aiAnalysis.nearestMedicalStation}</p>
                <p className="text-sm"><strong>Est. Response:</strong> {aiAnalysis.estimatedResponseTime}</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
              <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">📢 Volunteer Instructions</h3>
              <p className="text-foreground text-sm">{aiAnalysis.volunteerInstructions}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
                  Immediate Actions (DO)
                </h3>
                <ol className="space-y-2">
                  {aiAnalysis.immediateActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      {a}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
                  Do NOT Do
                </h3>
                <ul className="space-y-2">
                  {aiAnalysis.doNotDo.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                      <span className="text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true">✗</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold mb-3">Required Equipment</h3>
                <ul className="space-y-1.5">
                  {aiAnalysis.requiredEquipment.map((e, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" aria-hidden="true" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold mb-3">Crowd Diversion Plan</h3>
                <p className="text-sm text-muted-foreground">{aiAnalysis.crowdDiversionPlan}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 border border-border py-2.5 rounded-xl hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Report Another
              </button>
              <button
                onClick={() => (window.location.href = '/incidents')}
                className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                All Incidents
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
