import * as React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import StatusScreen from "./src/pages/StatusScreen";

export default function App() {
  return (
    <PaperProvider>
      <StatusScreen />
    </PaperProvider>
  );
}
