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
    // Fetch license from server (not localStorage)
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
          // No license or inactive - set to basic
          setLicense({
            type: 'basic',
            features: {
              anomalyDetection: false,
              advancedAnalytics: false,
              customReports: false,
              querySystem: false,
              mobilePWA: false,
              apiAccess: false,
              whiteLabel: false,
              smsNotifications: false,
              multiWarehouse: false,
            },
            maxBranches: 5,
            maxUsers: 10,
            clientName: 'Unlicensed'
          });
          setActive(true);
        }
      } catch (error) {
        console.error('Failed to fetch license:', error);
        setActive(false);
      } finally {
        setLoading(false);
      }
    };

    fetchLicense();
  }, []);

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