export type Divida = {
  id: number;
  descricao: string;
  valorInicialCentavos: number;
  saldoAtualCentavos: number;
  taxaJurosMensal: number;
  vencimento: string;
  pagamentoMinimoCentavos: number;
  criadoEm: string;
  atualizadoEm: string;
};

export type Pagamento = {
  id: number;
  dividaId: number;
  valorCentavos: number;
  dataPagamento: string;
  criadoEm: string;
};

export type DadosDivida = Omit<
  Divida,
  'id' | 'saldoAtualCentavos' | 'criadoEm' | 'atualizadoEm'
>;

export type ConteudoEducativo = {
  id: string;
  titulo: string;
  texto: string;
  fontes: string[];
};

export type MetodoSimulacao = 'bolaDeNeve' | 'avalanche';

export type ParametrosSimulacao = {
  dividas: Divida[];
  orcamentoMensalCentavos: number;
  limiteMeses?: number;
};

export type ResultadoSimulacao = {
  metodo: MetodoSimulacao;
  prazoMeses: number | null;
  totalJurosCentavos: number;
  totalPagoCentavos: number;
  ordemQuitacao: number[];
  quitado: boolean;
  motivo: string | null;
};
