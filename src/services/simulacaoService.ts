import type {
  Divida,
  MetodoSimulacao,
  ParametrosSimulacao,
  ResultadoSimulacao,
} from '../types';

type SaldoProjetado = {
  id: number;
  saldo: number;
  taxa: number;
  minimo: number;
  vencimento: string;
};

export function simularQuitacao(
  parametros: ParametrosSimulacao,
  metodo: MetodoSimulacao,
): ResultadoSimulacao {
  const { dividas, orcamentoMensalCentavos } = parametros;
  const limiteMeses = parametros.limiteMeses ?? 600;

  validarParametros(dividas, orcamentoMensalCentavos, limiteMeses);
  const saldos: SaldoProjetado[] = dividas
    .filter((divida) => divida.saldoAtualCentavos > 0)
    .map((divida) => ({
      id: divida.id,
      saldo: divida.saldoAtualCentavos,
      taxa: divida.taxaJurosMensal,
      minimo: divida.pagamentoMinimoCentavos,
      vencimento: divida.vencimento,
    }));

  if (saldos.length === 0) throw new Error('Selecione ao menos uma dívida ativa.');

  const minimoTotal = saldos.reduce(
    (total, divida) => total + Math.min(divida.minimo, divida.saldo),
    0,
  );
  if (orcamentoMensalCentavos < minimoTotal) {
    throw new Error(
      `O orçamento precisa cobrir os pagamentos mínimos de ${formatCents(minimoTotal)}.`,
    );
  }

  let totalJurosCentavos = 0;
  let totalPagoCentavos = 0;
  let prazoMeses = 0;
  const ordemQuitacao: number[] = [];

  for (let mes = 1; mes <= limiteMeses; mes += 1) {
    const saldoAntesDoMes = somarSaldos(saldos);

    for (const divida of saldos) {
      const juros = Math.round((divida.saldo * divida.taxa) / 100);
      divida.saldo += juros;
      totalJurosCentavos += juros;
      if (!Number.isSafeInteger(divida.saldo) || !Number.isSafeInteger(totalJurosCentavos)) {
        throw new Error('Os valores da projeção ultrapassam o limite numérico suportado.');
      }
    }

    const prioritarias = [...saldos].sort((a, b) =>
      compararPrioridade(a, b, metodo),
    );
    const minimosDoMes = prioritarias.reduce(
      (total, divida) => total + Math.min(divida.minimo, divida.saldo),
      0,
    );
    if (minimosDoMes > orcamentoMensalCentavos) {
      return resultadoIncompleto(
        metodo,
        totalJurosCentavos,
        totalPagoCentavos,
        ordemQuitacao,
        'Os juros elevaram os pagamentos mínimos acima do orçamento informado.',
      );
    }

    for (const divida of prioritarias) {
      const pagamento = Math.min(divida.minimo, divida.saldo);
      divida.saldo -= pagamento;
      totalPagoCentavos += pagamento;
      if (divida.saldo === 0) adicionarQuitacao(ordemQuitacao, divida.id);
    }

    let restante = orcamentoMensalCentavos - minimosDoMes;
    for (const divida of prioritarias) {
      if (restante <= 0) break;
      const pagamento = Math.min(restante, divida.saldo);
      divida.saldo -= pagamento;
      restante -= pagamento;
      totalPagoCentavos += pagamento;
      if (divida.saldo === 0) adicionarQuitacao(ordemQuitacao, divida.id);
    }

    prazoMeses = mes;
    if (somarSaldos(saldos) === 0) {
      return {
        metodo,
        prazoMeses,
        totalJurosCentavos,
        totalPagoCentavos,
        ordemQuitacao,
        quitado: true,
        motivo: null,
      };
    }

    if (somarSaldos(saldos) >= saldoAntesDoMes) {
      return resultadoIncompleto(
        metodo,
        totalJurosCentavos,
        totalPagoCentavos,
        ordemQuitacao,
        'Com esse orçamento, o saldo total não diminui após considerar os juros.',
      );
    }
  }

  return resultadoIncompleto(
    metodo,
    totalJurosCentavos,
    totalPagoCentavos,
    ordemQuitacao,
    `A projeção atingiu o limite de ${limiteMeses} ${limiteMeses === 1 ? 'mês' : 'meses'} sem quitar todas as dívidas.`,
  );
}

function validarParametros(
  dividas: Divida[],
  orcamento: number,
  limiteMeses: number,
): void {
  if (!Array.isArray(dividas) || dividas.length === 0) {
    throw new Error('Selecione ao menos uma dívida ativa.');
  }
  if (!Number.isSafeInteger(orcamento) || orcamento <= 0) {
    throw new Error('Informe um orçamento mensal maior que zero.');
  }
  if (!Number.isInteger(limiteMeses) || limiteMeses < 1 || limiteMeses > 600) {
    throw new Error('O limite da projeção deve estar entre 1 e 600 meses.');
  }
  for (const divida of dividas) {
    if (
      !Number.isSafeInteger(divida.saldoAtualCentavos) ||
      divida.saldoAtualCentavos < 0 ||
      !Number.isSafeInteger(divida.pagamentoMinimoCentavos) ||
      divida.pagamentoMinimoCentavos <= 0 ||
      !Number.isFinite(divida.taxaJurosMensal) ||
      divida.taxaJurosMensal < 0
    ) {
      throw new Error('Os dados das dívidas selecionadas são inválidos.');
    }
  }
}

function compararPrioridade(
  a: SaldoProjetado,
  b: SaldoProjetado,
  metodo: MetodoSimulacao,
): number {
  const criterio =
    metodo === 'bolaDeNeve' ? a.saldo - b.saldo : b.taxa - a.taxa;
  return criterio || a.vencimento.localeCompare(b.vencimento) || a.id - b.id;
}

function somarSaldos(saldos: SaldoProjetado[]): number {
  return saldos.reduce((total, divida) => total + divida.saldo, 0);
}

function adicionarQuitacao(ordem: number[], id: number): void {
  if (!ordem.includes(id)) ordem.push(id);
}

function resultadoIncompleto(
  metodo: MetodoSimulacao,
  totalJurosCentavos: number,
  totalPagoCentavos: number,
  ordemQuitacao: number[],
  motivo: string,
): ResultadoSimulacao {
  return {
    metodo,
    prazoMeses: null,
    totalJurosCentavos,
    totalPagoCentavos,
    ordemQuitacao,
    quitado: false,
    motivo,
  };
}

function formatCents(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}
