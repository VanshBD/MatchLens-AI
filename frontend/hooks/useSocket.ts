'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/auth';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socketInstance: Socket | null = null;

export function useSocket() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    // Reuse existing socket if connected
    if (socketInstance?.connected) {
      socketRef.current = socketInstance;
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.info('Socket connected');
    });

    socket.on('disconnect', (reason) => {
      console.info('Socket disconnected:', reason);
    });

    socket.on('notification', (data: { title: string; message: string; type?: string }) => {
      toast(data.message, { icon: '🔔' });
    });

    socket.on('incident:created', (data: { title: string }) => {
      toast(`New incident: ${data.title}`, { icon: '🚨', duration: 6000 });
    });

    socket.on('alert:security', (data: { title: string }) => {
      toast(`Security Alert: ${data.title}`, {
        icon: '🛡️',
        duration: 8000,
        style: { background: '#fef2f2', color: '#dc2626' },
      });
    });

    socket.on('alert:medical', (data: { title: string }) => {
      toast(`Medical Alert: ${data.title}`, {
        icon: '🏥',
        duration: 8000,
        style: { background: '#fef2f2', color: '#dc2626' },
      });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socketInstance = socket;
    socketRef.current = socket;

    return () => {
      // Don't disconnect on component unmount — keep alive for session
    };
  }, [isAuthenticated, accessToken]);

  return socketRef.current;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
