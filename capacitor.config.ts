import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.honeysucklepub.warehouse',
  appName: 'Warehouse Management',
  webDir: 'out', // Changed from 'public' to 'out' for Next.js export
  server: {
    url: 'http://192.168.1.100:3000', // Replace with your PC's local IP
    cleartext: true, // Allow HTTP for testing
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000ff",
      showSpinner: false,
    },
  },
};

export default config;