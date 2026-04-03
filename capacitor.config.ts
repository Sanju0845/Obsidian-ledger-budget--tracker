import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.obsidian.ledger',
  appName: 'Obsidian Ledger',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
