import React from 'react';
import { Provider as PaperProvider, useTheme } from 'react-native-paper';
import { Button, View, Text } from 'react-native';

// Custom Light Theme
const lightTheme = {
  colors: {
    primary: '#6200ee',
    accent: '#03dac6',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#000000',
    error: '#b00020',
    disabled: '#a0a0a0',
    placeholder: '#808080',
    backdrop: '#00000080',
  },
};

// Custom Dark Theme
const darkTheme = {
  colors: {
    primary: '#bb86fc',
    accent: '#03dac6',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    error: '#cf6679',
    disabled: '#a0a0a0',
    placeholder: '#808080',
    backdrop: '#00000080',
  },
};

function HomeScreen() {
  const theme = useTheme(); // Access the current theme
  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1, padding: 20 }}>
      <Text style={{ color: theme.colors.text }}>Hello, this is the Home Screen!</Text>
    </View>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  return (
    <PaperProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <HomeScreen />
      <Button
        title="Toggle Theme"
        onPress={() => setIsDarkMode(!isDarkMode)}
      />
    </PaperProvider>
  );
}