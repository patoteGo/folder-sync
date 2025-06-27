import { useState, useEffect, useCallback } from 'react';
import { CronSettings, FolderRelationship, SyncLog } from '../types';
import { LocalStorageService } from '../utils/localStorage';

export const useCronScheduler = (
  relationships: FolderRelationship[],
  onSyncRelationship: (id: string) => Promise<void>
) => {
  const [cronSettings, setCronSettings] = useState<CronSettings>({
    enabled: false,
    interval: 30, // default 30 minutes
    lastRun: null,
    nextRun: null,
    isRunning: false
  });

  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Load sync logs from localStorage on init
  useEffect(() => {
    const savedLogs = LocalStorageService.loadSyncLogs();
    setSyncLogs(savedLogs);
  }, []);

  const addSyncLog = useCallback((log: Omit<SyncLog, 'id' | 'timestamp'>) => {
    const newLog: SyncLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setSyncLogs(prev => {
      const updatedLogs = [newLog, ...prev].slice(0, 100); // Keep last 100 logs
      LocalStorageService.saveSyncLogs(updatedLogs);
      return updatedLogs;
    });
  }, []);

  const calculateNextRun = useCallback((intervalMinutes: number): Date => {
    return new Date(Date.now() + intervalMinutes * 60 * 1000);
  }, []);

  const syncOutOfSyncRelationships = useCallback(async (type: 'manual' | 'auto' = 'auto') => {
    if (cronSettings.isRunning) return;

    setCronSettings(prev => ({ ...prev, isRunning: true }));
    
    const outOfSyncRelationships = relationships.filter(
      rel => rel.status === 'out-of-sync' && (type === 'manual' || rel.autoSync !== false)
    );

    if (outOfSyncRelationships.length === 0) {
      setCronSettings(prev => ({
        ...prev,
        isRunning: false,
        lastRun: new Date(),
        nextRun: prev.enabled ? calculateNextRun(prev.interval) : null
      }));
      return;
    }

    const startTime = Date.now();

    for (const relationship of outOfSyncRelationships) {
      try {
        await onSyncRelationship(relationship.id);
        addSyncLog({
          type,
          relationshipId: relationship.id,
          relationshipName: relationship.customName,
          status: 'success',
          message: `Successfully synced ${relationship.customName}`,
          duration: Date.now() - startTime
        });
      } catch (error) {
        addSyncLog({
          type,
          relationshipId: relationship.id,
          relationshipName: relationship.customName,
          status: 'error',
          message: `Failed to sync ${relationship.customName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - startTime
        });
      }
    }

    setCronSettings(prev => ({
      ...prev,
      isRunning: false,
      lastRun: new Date(),
      nextRun: prev.enabled ? calculateNextRun(prev.interval) : null
    }));
  }, [relationships, onSyncRelationship, cronSettings.isRunning, addSyncLog, calculateNextRun]);

  const startCron = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    const newIntervalId = setInterval(() => {
      syncOutOfSyncRelationships('auto');
    }, cronSettings.interval * 60 * 1000);

    setIntervalId(newIntervalId);
    
    setCronSettings(prev => ({
      ...prev,
      enabled: true,
      nextRun: calculateNextRun(prev.interval)
    }));
  }, [cronSettings.interval, syncOutOfSyncRelationships, intervalId, calculateNextRun]);

  const stopCron = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    
    setCronSettings(prev => ({
      ...prev,
      enabled: false,
      nextRun: null
    }));
  }, [intervalId]);

  const updateInterval = useCallback((newInterval: number) => {
    setCronSettings(prev => ({
      ...prev,
      interval: newInterval,
      nextRun: prev.enabled ? calculateNextRun(newInterval) : null
    }));

    if (cronSettings.enabled) {
      stopCron();
      setTimeout(() => startCron(), 100);
    }
  }, [cronSettings.enabled, startCron, stopCron, calculateNextRun]);

  const manualSyncAll = useCallback(() => {
    syncOutOfSyncRelationships('manual');
  }, [syncOutOfSyncRelationships]);

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return {
    cronSettings,
    syncLogs,
    startCron,
    stopCron,
    updateInterval,
    manualSyncAll,
    isRunning: cronSettings.isRunning
  };
};