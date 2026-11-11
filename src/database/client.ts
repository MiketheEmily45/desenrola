import * as SQLite from 'expo-sqlite';

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= SQLite.openDatabaseAsync('desenrola.db').then(async (db) => {
    await db.execAsync('PRAGMA foreign_keys = ON;');
    const version = await db.getFirstAsync<{ user_version: number }>(
      'PRAGMA user_version;',
    );

    if ((version?.user_version ?? 0) < 1) {
      await db.withTransactionAsync(async () => {
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS dividas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            descricao TEXT NOT NULL CHECK (length(trim(descricao)) > 0),
            valorInicialCentavos INTEGER NOT NULL CHECK (valorInicialCentavos > 0),
            saldoAtualCentavos INTEGER NOT NULL CHECK (saldoAtualCentavos >= 0),
            taxaJurosMensal REAL NOT NULL CHECK (taxaJurosMensal >= 0),
            vencimento TEXT NOT NULL,
            pagamentoMinimoCentavos INTEGER NOT NULL CHECK (pagamentoMinimoCentavos > 0),
            criadoEm TEXT NOT NULL,
            atualizadoEm TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS pagamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dividaId INTEGER NOT NULL REFERENCES dividas(id) ON DELETE CASCADE,
            valorCentavos INTEGER NOT NULL CHECK (valorCentavos > 0),
            dataPagamento TEXT NOT NULL,
            criadoEm TEXT NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_pagamentos_divida
            ON pagamentos(dividaId, dataPagamento DESC);
          PRAGMA user_version = 1;
        `);
      });
    }

    return db;
  }).catch((error: unknown) => {
    databasePromise = undefined;
    throw error;
  });

  return databasePromise;
}
