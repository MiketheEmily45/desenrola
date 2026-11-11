import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DebtDetailScreen, DebtFormScreen, DebtListScreen, PaymentFormScreen } from '../screens/DebtScreens';
import { HomeScreen } from '../screens/HomeScreen';
import { LearningDetailScreen, LearningListScreen } from '../screens/LearningScreens';
import { SimulationResultScreen, SimulatorScreen } from '../screens/SimulationScreens';
import { colors } from '../theme/colors';
import type {
  AprenderStackParamList,
  AppTabParamList,
  DividasStackParamList,
  SimulacaoStackParamList,
} from './types';

const Tabs = createBottomTabNavigator<AppTabParamList>();
const DividasStack = createNativeStackNavigator<DividasStackParamList>();
const SimulacaoStack = createNativeStackNavigator<SimulacaoStackParamList>();
const AprenderStack = createNativeStackNavigator<AprenderStackParamList>();

function DebtNavigator() {
  return (
    <DividasStack.Navigator screenOptions={{ headerShown: false }}>
      <DividasStack.Screen name="DividaLista" component={DebtListScreen} />
      <DividasStack.Screen name="DividaDetalhe" component={DebtDetailScreen} />
      <DividasStack.Screen name="FormularioDivida" component={DebtFormScreen} />
      <DividasStack.Screen name="RegistrarPagamento" component={PaymentFormScreen} />
    </DividasStack.Navigator>
  );
}

function SimulationNavigator() {
  return (
    <SimulacaoStack.Navigator screenOptions={{ headerShown: false }}>
      <SimulacaoStack.Screen name="Simulacao" component={SimulatorScreen} />
      <SimulacaoStack.Screen name="ResultadoSimulacao" component={SimulationResultScreen} />
    </SimulacaoStack.Navigator>
  );
}

function LearningNavigator() {
  return (
    <AprenderStack.Navigator screenOptions={{ headerShown: false }}>
      <AprenderStack.Screen name="ListaConteudos" component={LearningListScreen} />
      <AprenderStack.Screen name="DetalheConteudo" component={LearningDetailScreen} />
    </AprenderStack.Navigator>
  );
}

export function AppNavigation() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: 66,
          paddingTop: 7,
        },
        tabBarIcon: ({ color }) => (
          <Text style={{ color, fontSize: 18, fontWeight: '800' }}>
            {route.name === 'Inicio' ? '⌂' : route.name === 'Dividas' ? '≡' : route.name === 'Simular' ? '↗' : '✳'}
          </Text>
        ),
      })}
    >
      <Tabs.Screen name="Inicio" component={HomeScreen} options={{ tabBarLabel: 'Início' }} />
      <Tabs.Screen name="Dividas" component={DebtNavigator} options={{ tabBarLabel: 'Dívidas' }} />
      <Tabs.Screen name="Simular" component={SimulationNavigator} options={{ tabBarLabel: 'Simular' }} />
      <Tabs.Screen name="Aprender" component={LearningNavigator} options={{ tabBarLabel: 'Aprender' }} />
    </Tabs.Navigator>
  );
}
