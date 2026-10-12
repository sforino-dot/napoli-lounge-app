// Polyfill standard minimo: l'SDK usa uuid v4 (crypto.getRandomValues), assente in Hermes.
import "react-native-get-random-values";
import { createClient } from "@base44/sdk";

// Nessun serverUrl: l'SDK usa già https://base44.app.
export const base44 = createClient({
  appId: "6aad35cb7e9e89bd6ab72479",
  analytics: { enabled: false },
});
