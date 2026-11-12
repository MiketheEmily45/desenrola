import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase, type DatabaseStage } from '../database/client';
import { listarDividas } from '../repositories/financeiroRepository';
import type { Divida } from '../types';

type AppDataContextValue = {
  db: SQLiteDatabase | null;
  dividas: Divida[];
  carregando: boolean;
  etapaInicializacao: DatabaseStage | 'loading-records';
  erroInicializacao: string | null;
  atualizar: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

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

export function AppDataProvider({ children }: React.PropsWithChildren) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [etapaInicializacao, setEtapaInicializacao] =
    useState<AppDataContextValue['etapaInicializacao']>('opening');
  const [erroInicializacao, setErroInicializacao] = useState<string | null>(null);

  const atualizar = useCallback(async () => {
    try {
      const database = db ?? (await getDatabase());
      const registros = await withTimeout(
        listarDividas(database),
        'ler os registros locais',
      );
      setDb(database);
      setDividas(registros);
      setErroInicializacao(null);
    } catch (error: unknown) {
      setErroInicializacao(
        error instanceof Error
          ? `Não foi possível carregar os dados locais: ${error.message}`
          : 'Não foi possível carregar os dados locais. Tente novamente.',
      );
      throw error;
    }
  }, [db]);

  useEffect(() => {
    let ativo = true;

    async function inicializar() {
      try {
        const database = await getDatabase((etapa) => {
          if (ativo) setEtapaInicializacao(etapa);
        });
        setEtapaInicializacao('loading-records');
        const registros = await withTimeout(
          listarDividas(database),
          'ler os registros locais',
        );
        if (ativo) {
          setDb(database);
          setDividas(registros);
          setErroInicializacao(null);
        }
      } catch (error: unknown) {
        if (ativo) {
          setErroInicializacao(
            error instanceof Error
              ? `Não foi possível abrir os dados locais: ${error.message}`
              : 'Não foi possível abrir os dados locais. Tente novamente.',
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void inicializar();
    return () => {
      ativo = false;
    };
  }, []);

  const value = useMemo(
    () => ({ db, dividas, carregando, etapaInicializacao, erroInicializacao, atualizar }),
    [db, dividas, carregando, etapaInicializacao, erroInicializacao, atualizar],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData precisa estar dentro de AppDataProvider.');
  return context;
}
