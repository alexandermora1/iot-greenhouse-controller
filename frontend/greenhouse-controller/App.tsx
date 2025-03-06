import * as React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import StatusScreen from "./src/pages/StatusScreen";
import { theme } from "./src/themes/theme";

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <StatusScreen />
    </PaperProvider>
  );
}
