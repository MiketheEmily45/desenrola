import type { ConteudoEducativo } from '../types';

export const conteudosEducativos: ConteudoEducativo[] = [
  {
    id: 'juros',
    titulo: 'Entenda os juros',
    texto:
      'Juros são o custo de usar dinheiro emprestado. Em uma projeção com juros compostos, a taxa de cada período incide sobre o saldo atualizado do período anterior. Compare a taxa mensal da dívida e pergunte à instituição credora pelo Custo Efetivo Total (CET), que pode incluir tarifas e outros encargos. As projeções deste app são educativas e não substituem o contrato.',
    fontes: [
      'Banco Central do Brasil — Cidadania Financeira: https://www.bcb.gov.br/cidadaniafinanceira',
      'Banco Central do Brasil — Calculadora do Cidadão: https://www.bcb.gov.br/meubc/calculadoradocidadao',
    ],
  },
  {
    id: 'orcamento',
    titulo: 'Monte um orçamento possível',
    texto:
      'Anote a renda líquida e os gastos essenciais antes de definir quanto cabe no pagamento das dívidas. Reserve espaço para despesas que variam e imprevistos. Um valor sustentável, mantido mês a mês, é mais útil do que uma meta que comprometa despesas básicas.',
    fontes: [
      'Banco Central do Brasil — Cidadania Financeira: https://www.bcb.gov.br/cidadaniafinanceira',
    ],
  },
  {
    id: 'estrategias',
    titulo: 'Bola de neve ou avalanche?',
    texto:
      'Na bola de neve, o pagamento extra prioriza a dívida de menor saldo; quitar uma dívida pode ajudar a manter a motivação. Na avalanche, o extra prioriza a maior taxa de juros e pode reduzir os juros projetados. Em ambos os métodos, mantenha os pagamentos mínimos planejados e avalie as condições reais de cada contrato.',
    fontes: [
      'Conselho Federal de Administração — Educação Financeira: https://www.cfa.org.br/',
    ],
  },
  {
    id: 'negociacao',
    titulo: 'Converse com a instituição',
    texto:
      'Se as parcelas não cabem no orçamento, entre em contato com a instituição credora para conhecer as opções de negociação e o custo total de cada proposta. Compare o valor final, o prazo, os encargos e as consequências do atraso. Evite assumir uma nova obrigação sem avaliar sua capacidade de pagamento.',
    fontes: [
      'Banco Central do Brasil — Cidadania Financeira: https://www.bcb.gov.br/cidadaniafinanceira',
      'Consumidor.gov.br: https://www.consumidor.gov.br/',
    ],
  },
];
