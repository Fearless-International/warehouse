'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface License {
  type: 'basic' | 'professional' | 'enterprise';
  features: {
    anomalyDetection: boolean;
    advancedAnalytics: boolean;
    customReports: boolean;
    querySystem: boolean;
    mobilePWA: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
    smsNotifications: boolean;
    multiWarehouse: boolean;
  };
  maxBranches: number;
  maxUsers: number;
  expiryDate?: string;
  clientName: string;
}

export function useLicense() {
  const { data: session } = useSession();
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);

  useEffect(() => {
    // ✅ ADMIN BYPASS
    if (session?.user.role === 'admin') {
      setLicense({
        type: 'enterprise',
        features: {
          anomalyDetection: true,
          advancedAnalytics: true,
          customReports: true,
          querySystem: true,
          mobilePWA: true,
          apiAccess: true,
          whiteLabel: true,
          smsNotifications: true,
          multiWarehouse: true,
        },
        maxBranches: 999,
        maxUsers: 999,
        clientName: 'System Administrator'
      });
      setActive(true);
      setLoading(false);
      return;
    }

    // For other roles, fetch license from server
    const fetchLicense = async () => {
      try {
        const res = await fetch('/api/license/check', {
          cache: 'no-store'
        });
        
        const data = await res.json();
        
        if (data.active && data.license) {
          setLicense(data.license);
          setActive(true);
        } else {
          // ✅ NO LICENSE - Don't set Basic, just set as inactive
          setLicense(null);
          setActive(false);
        }
      } catch (error) {
        console.error('Failed to fetch license:', error);
        setActive(false);
        setLicense(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLicense();
  }, [session]);

  const hasFeature = (featureName: keyof License['features']): boolean => {
    if (!license || !active) return false;
    return license.features[featureName] === true;
  };

  const canAddBranch = (currentBranches: number): boolean => {
    if (!license) return false;
    return currentBranches < license.maxBranches;
  };

  const canAddUser = (currentUsers: number): boolean => {
    if (!license) return false;
    return currentUsers < license.maxUsers;
  };

  const isExpired = (): boolean => {
    if (!license || !license.expiryDate) return false;
    return new Date() > new Date(license.expiryDate);
  };

  return {
    license,
    loading,
    active,
    hasFeature,
    canAddBranch,
    canAddUser,
    isExpired
  };
}