import type { SQLiteDatabase } from 'expo-sqlite';
import type { DadosDivida, Divida, Pagamento } from '../types';
import { isValidISODate } from '../utils/format';

type PaymentInput = {
  dividaId: number;
  valorCentavos: number;
  dataPagamento: string;
};

export async function listarDividas(db: SQLiteDatabase): Promise<Divida[]> {
  return db.getAllAsync<Divida>(
    'SELECT * FROM dividas ORDER BY saldoAtualCentavos = 0, vencimento, id;',
  );
}

export async function obterDivida(
  db: SQLiteDatabase,
  id: number,
): Promise<Divida | null> {
  return db.getFirstAsync<Divida>('SELECT * FROM dividas WHERE id = ?;', id);
}

export async function contarPagamentos(
  db: SQLiteDatabase,
  dividaId: number,
): Promise<number> {
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM pagamentos WHERE dividaId = ?;',
    dividaId,
  );
  return result?.total ?? 0;
}

export async function listarPagamentos(
  db: SQLiteDatabase,
  dividaId: number,
): Promise<Pagamento[]> {
  return db.getAllAsync<Pagamento>(
    'SELECT * FROM pagamentos WHERE dividaId = ? ORDER BY dataPagamento DESC, id DESC;',
    dividaId,
  );
}

export async function salvarDivida(
  db: SQLiteDatabase,
  dados: DadosDivida,
  id?: number,
): Promise<number> {
  validarDadosDivida(dados);
  const now = new Date().toISOString();

  if (id === undefined) {
    const result = await db.runAsync(
      `INSERT INTO dividas
        (descricao, valorInicialCentavos, saldoAtualCentavos, taxaJurosMensal,
         vencimento, pagamentoMinimoCentavos, criadoEm, atualizadoEm)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      dados.descricao.trim(),
      dados.valorInicialCentavos,
      dados.valorInicialCentavos,
      dados.taxaJurosMensal,
      dados.vencimento,
      dados.pagamentoMinimoCentavos,
      now,
      now,
    );
    return result.lastInsertRowId;
  }

  const divida = await obterDivida(db, id);
  if (!divida) throw new Error('Essa dívida não foi encontrada.');

  const pagamentos = await contarPagamentos(db, id);
  if (pagamentos > 0 && dados.valorInicialCentavos !== divida.valorInicialCentavos) {
    throw new Error('O valor inicial não pode ser alterado após registrar pagamentos.');
  }

  await db.runAsync(
    `UPDATE dividas SET
      descricao = ?, valorInicialCentavos = ?, taxaJurosMensal = ?,
      vencimento = ?, pagamentoMinimoCentavos = ?, atualizadoEm = ?
     WHERE id = ?;`,
    dados.descricao.trim(),
    dados.valorInicialCentavos,
    dados.taxaJurosMensal,
    dados.vencimento,
    dados.pagamentoMinimoCentavos,
    now,
    id,
  );
  return id;
}

export async function registrarPagamento(
  db: SQLiteDatabase,
  pagamento: PaymentInput,
): Promise<void> {
  if (!Number.isSafeInteger(pagamento.valorCentavos) || pagamento.valorCentavos <= 0) {
    throw new Error('Informe um valor de pagamento maior que zero.');
  }
  if (!isValidISODate(pagamento.dataPagamento)) {
    throw new Error('Informe uma data válida no formato AAAA-MM-DD.');
  }

  await db.withTransactionAsync(async () => {
    const divida = await obterDivida(db, pagamento.dividaId);
    if (!divida || divida.saldoAtualCentavos === 0) {
      throw new Error('Essa dívida não está ativa.');
    }
    if (pagamento.valorCentavos > divida.saldoAtualCentavos) {
      throw new Error('O pagamento não pode ser maior que o saldo atual.');
    }

    await db.runAsync(
      'INSERT INTO pagamentos (dividaId, valorCentavos, dataPagamento, criadoEm) VALUES (?, ?, ?, ?);',
      pagamento.dividaId,
      pagamento.valorCentavos,
      pagamento.dataPagamento,
      new Date().toISOString(),
    );
    await db.runAsync(
      'UPDATE dividas SET saldoAtualCentavos = saldoAtualCentavos - ?, atualizadoEm = ? WHERE id = ?;',
      pagamento.valorCentavos,
      new Date().toISOString(),
      pagamento.dividaId,
    );
  });
}

export async function excluirDivida(
  db: SQLiteDatabase,
  id: number,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync('DELETE FROM dividas WHERE id = ?;', id);
    if (result.changes === 0) throw new Error('Essa dívida não foi encontrada.');
  });
}

function validarDadosDivida(dados: DadosDivida): void {
  if (!dados.descricao.trim()) throw new Error('Informe uma descrição para a dívida.');
  if (!Number.isSafeInteger(dados.valorInicialCentavos) || dados.valorInicialCentavos <= 0) {
    throw new Error('O valor inicial deve ser maior que zero.');
  }
  if (!Number.isFinite(dados.taxaJurosMensal) || dados.taxaJurosMensal < 0) {
    throw new Error('A taxa de juros não pode ser negativa.');
  }
  if (!isValidISODate(dados.vencimento)) {
    throw new Error('Informe uma data válida no formato AAAA-MM-DD.');
  }
  if (
    !Number.isSafeInteger(dados.pagamentoMinimoCentavos) ||
    dados.pagamentoMinimoCentavos <= 0 ||
    dados.pagamentoMinimoCentavos > dados.valorInicialCentavos
  ) {
    throw new Error('O pagamento mínimo deve ser positivo e não superar o valor inicial.');
  }
}
