import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { AppDataProvider, useAppData } from './src/context/AppDataContext';
import { AppNavigation } from './src/navigation/AppNavigation';
import { Button, ErrorMessage } from './src/components/UI';
import { colors } from './src/theme/colors';

export default function App() {
  return (
    <AppDataProvider>
      <AppShell />
    </AppDataProvider>
  );
}

function AppShell() {
  const { carregando, erroInicializacao, atualizar } = useAppData();
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      primary: colors.green,
      text: colors.ink,
      border: colors.line,
    },
  };

  if (carregando) {
    return (
      <View style={{ alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.green} size="large" />
        <Text style={{ color: colors.muted, marginTop: 12 }}>Preparando seus dados locais…</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (erroInicializacao) {
    return (
      <View style={{ backgroundColor: colors.background, flex: 1, justifyContent: 'center', padding: 24 }}>
        <ErrorMessage>{erroInicializacao}</ErrorMessage>
        <View style={{ marginTop: 14 }}>
          <Button title="Tentar novamente" onPress={() => { void atualizar().catch(() => undefined); }} />
        </View>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <AppNavigation />
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}
