import { describe, expect, it } from '@jest/globals';
import { simularQuitacao } from './simulacaoService';
import type { Divida } from '../types';

function divida(
  id: number,
  saldo: number,
  taxa: number,
  minimo: number,
): Divida {
  return {
    id,
    descricao: `Dívida ${id}`,
    valorInicialCentavos: saldo,
    saldoAtualCentavos: saldo,
    taxaJurosMensal: taxa,
    vencimento: `2026-12-${String(id).padStart(2, '0')}`,
    pagamentoMinimoCentavos: minimo,
    criadoEm: '2026-11-11T00:00:00.000Z',
    atualizadoEm: '2026-11-11T00:00:00.000Z',
  };
}

describe('simularQuitacao', () => {
  it('calcula juros mensais e contabiliza o pagamento do primeiro mês', () => {
    const resultado = simularQuitacao(
      {
        dividas: [divida(1, 100_000, 2, 10_000)],
        orcamentoMensalCentavos: 12_000,
        limiteMeses: 1,
      },
      'bolaDeNeve',
    );

    expect(resultado.totalJurosCentavos).toBe(2_000);
    expect(resultado.totalPagoCentavos).toBe(12_000);
    expect(resultado.prazoMeses).toBeNull();
    expect(resultado.motivo).toContain('limite de 1 mês');
  });

  it('prioriza o menor saldo na bola de neve e a maior taxa na avalanche', () => {
    const dividas = [
      divida(1, 30_000, 1, 1_000),
      divida(2, 100_000, 3, 1_000),
    ];
    const parametros = { dividas, orcamentoMensalCentavos: 150_000 };

    const neve = simularQuitacao(parametros, 'bolaDeNeve');
    const avalanche = simularQuitacao(parametros, 'avalanche');

    expect(neve.quitado).toBe(true);
    expect(avalanche.quitado).toBe(true);
    expect(neve.ordemQuitacao).toEqual([1, 2]);
    expect(avalanche.ordemQuitacao).toEqual([2, 1]);
  });

  it('limita o pagamento ao saldo quando a dívida não tem juros', () => {
    const resultado = simularQuitacao(
      {
        dividas: [divida(1, 10_000, 0, 1_000)],
        orcamentoMensalCentavos: 15_000,
      },
      'avalanche',
    );

    expect(resultado.quitado).toBe(true);
    expect(resultado.prazoMeses).toBe(1);
    expect(resultado.totalPagoCentavos).toBe(10_000);
    expect(resultado.totalJurosCentavos).toBe(0);
  });

  it('rejeita orçamento abaixo da soma dos pagamentos mínimos', () => {
    expect(() =>
      simularQuitacao(
        {
          dividas: [divida(1, 100_000, 0, 10_000)],
          orcamentoMensalCentavos: 9_999,
        },
        'bolaDeNeve',
      ),
    ).toThrow('O orçamento precisa cobrir os pagamentos mínimos');
  });

  it('sinaliza quando o orçamento não reduz o saldo total', () => {
    const resultado = simularQuitacao(
      {
        dividas: [divida(1, 100_000, 5, 1_000)],
        orcamentoMensalCentavos: 1_000,
      },
      'avalanche',
    );

    expect(resultado.quitado).toBe(false);
    expect(resultado.prazoMeses).toBeNull();
    expect(resultado.motivo).toContain('saldo total não diminui');
  });
});
