import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ConteudoEducativo, Divida, ResultadoSimulacao } from '../types';

export type DividasStackParamList = {
  DividaLista: undefined;
  DividaDetalhe: { id: number };
  FormularioDivida: { id?: number } | undefined;
  RegistrarPagamento: { id: number };
};

export type SimulacaoStackParamList = {
  Simulacao: undefined;
  ResultadoSimulacao: {
    dividas: Divida[];
    resultados: ResultadoSimulacao[];
  };
};

export type AprenderStackParamList = {
  ListaConteudos: undefined;
  DetalheConteudo: { conteudo: ConteudoEducativo };
};

export type AppTabParamList = {
  Inicio: undefined;
  Dividas: NavigatorScreenParams<DividasStackParamList> | undefined;
  Simular: NavigatorScreenParams<SimulacaoStackParamList> | undefined;
  Aprender: NavigatorScreenParams<AprenderStackParamList> | undefined;
};
