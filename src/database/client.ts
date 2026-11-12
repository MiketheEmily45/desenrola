import * as SQLite from 'expo-sqlite';

export type DatabaseStage =
  | 'opening'
  | 'configuring'
  | 'checking'
  | 'migrating';

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

export function getDatabase(
  onStage?: (stage: DatabaseStage) => void,
): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= (async () => {
    onStage?.('opening');
    const db = await withTimeout(
      SQLite.openDatabaseAsync('desenrola.db'),
      'abrir o banco de dados',
    );

    onStage?.('configuring');
    await withTimeout(
      db.execAsync('PRAGMA foreign_keys = ON;'),
      'configurar o banco de dados',
    );

    onStage?.('checking');
    const version = await withTimeout(
      db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;'),
      'verificar a versão do banco',
    );

    if ((version?.user_version ?? 0) < 1) {
      onStage?.('migrating');
      await withTimeout(db.withTransactionAsync(async () => {
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
      }), 'criar as tabelas locais');
    }

    return db;
  })().catch((error: unknown) => {
    databasePromise = undefined;
    throw error;
  });

  return databasePromise;
}

function withTimeout<T>(promise: Promise<T>, operation: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(
        new Error(
          `O SQLite demorou mais de 20 segundos para ${operation}. Confira a configuração da plataforma e reinicie o servidor Expo.`,
        ),
      );
    }, 20_000);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}
