'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, Search, Shield, CheckCircle, XCircle,
  RefreshCw, BarChart3, Activity, Settings,
} from 'lucide-react';
import { userApi, incidentApi, getErrorMessage } from '@/lib/api';
import { ROLE_COLORS, ROLE_LABELS, UserRole } from '@/lib/auth';
import { formatRelativeTime, cn } from '@/lib/utils';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import toast from 'react-hot-toast';

const ROLES: UserRole[] = ['admin', 'organizer', 'security', 'medical', 'volunteer'];

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['incident-stats'],
    queryFn: () => incidentApi.getStats().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  // Users
  const { data: userData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-users', { search, roleFilter, page }],
    queryFn: () =>
      userApi
        .getAll({ search: search || undefined, role: roleFilter || undefined, page, limit: 15 })
        .then((r) => r.data),
    refetchInterval: 30000,
  });

  const users: User[] = userData?.data || [];
  const pagination = userData?.pagination;

  const { mutate: updateRole } = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => userApi.updateRole(id, role),
    onSuccess: () => {
      toast.success('Role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: (id: string) => userApi.toggleActive(id),
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <RoleGuard allowedRoles={['admin']}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-purple-500" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">User management and system overview</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Users" value={pagination?.total ?? '–'} icon={Users} iconColor="text-blue-500" />
          <StatsCard title="Total Incidents" value={stats?.total ?? 0} icon={BarChart3} iconColor="text-purple-500" />
          <StatsCard title="Open" value={stats?.byStatus?.open ?? 0} icon={Activity} iconColor="text-orange-500" />
          <StatsCard title="Resolved" value={stats?.byStatus?.resolved ?? 0} icon={CheckCircle} iconColor="text-green-500" />
        </div>

        {/* User Management */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" aria-hidden="true" />
              User Management
              {pagination?.total !== undefined && (
                <span className="text-sm text-muted-foreground font-normal">
                  ({pagination.total} users)
                </span>
              )}
            </h2>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-card border border-border rounded-xl hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              aria-label="Refresh user list"
            >
              <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} aria-hidden="true" />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <label htmlFor="user-search" className="sr-only">Search users</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <input
                id="user-search"
                type="search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name or email…"
                className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
              />
            </div>
            <div>
              <label htmlFor="role-filter" className="sr-only">Filter by role</label>
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="w-full sm:w-44 px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
              >
                <option value="">All Roles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="space-y-0" role="status" aria-label="Loading users">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 border-b border-border last:border-0 bg-muted/30 animate-pulse" aria-hidden="true" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table" aria-label="Users">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th scope="col" className="text-left px-4 py-3 font-semibold text-foreground">User</th>
                      <th scope="col" className="text-left px-4 py-3 font-semibold text-foreground">Role</th>
                      <th scope="col" className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Last Login</th>
                      <th scope="col" className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                      <th scope="col" className="text-left px-4 py-3 font-semibold text-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className={cn(
                          'border-b border-border last:border-0 hover:bg-muted/30 transition-colors',
                          !user.isActive && 'opacity-50'
                        )}
                      >
                        {/* Name + Email */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0"
                              aria-hidden="true"
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role dropdown */}
                        <td className="px-4 py-3">
                          <label htmlFor={`role-${user._id}`} className="sr-only">
                            Change role for {user.name}
                          </label>
                          <select
                            id={`role-${user._id}`}
                            value={user.role}
                            onChange={(e) => updateRole({ id: user._id, role: e.target.value })}
                            className={cn(
                              'text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary',
                              ROLE_COLORS[user.role]
                            )}
                            aria-label={`Role for ${user.name}`}
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                        </td>

                        {/* Last login */}
                        <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                          {user.lastLogin ? (
                            <time dateTime={user.lastLogin}>{formatRelativeTime(user.lastLogin)}</time>
                          ) : 'Never'}
                        </td>

                        {/* Status badge */}
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
                              user.isActive
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                            )}
                          >
                            {user.isActive ? (
                              <CheckCircle className="w-3 h-3" aria-hidden="true" />
                            ) : (
                              <XCircle className="w-3 h-3" aria-hidden="true" />
                            )}
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Toggle active */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActive(user._id)}
                            className={cn(
                              'text-xs px-3 py-1.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
                              user.isActive
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 focus:ring-red-500'
                                : 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 focus:ring-green-500'
                            )}
                            aria-label={`${user.isActive ? 'Deactivate' : 'Activate'} ${user.name}`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" aria-hidden="true" />
                          <p>No users found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {pagination.totalPages} · {pagination.total} total
                </p>
                <nav className="flex gap-2" aria-label="Pagination">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </section>

      </motion.div>
    </RoleGuard>
  );
}
