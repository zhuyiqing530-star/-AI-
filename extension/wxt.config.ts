import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'AI Listing Optimizer',
    description: 'One-click AI-powered Amazon listing optimization',
    permissions: ['activeTab', 'sidePanel', 'storage'],
    host_permissions: ['*://sellercentral.amazon.com/*', '*://sellercentral.amazon.co.jp/*', '*://sellercentral.amazon.de/*', '*://sellercentral.amazon.fr/*', '*://sellercentral.amazon.es/*', '*://sellercentral.amazon.co.uk/*'],
    side_panel: {
      default_path: 'sidepanel/index.html',
    },
  },
});
