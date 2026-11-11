import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from '../database/client';
import { listarDividas } from '../repositories/financeiroRepository';
import type { Divida } from '../types';

type AppDataContextValue = {
  db: SQLiteDatabase | null;
  dividas: Divida[];
  carregando: boolean;
  erroInicializacao: string | null;
  atualizar: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: React.PropsWithChildren) {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroInicializacao, setErroInicializacao] = useState<string | null>(null);

  const atualizar = useCallback(async () => {
    try {
      const database = db ?? (await getDatabase());
      const registros = await listarDividas(database);
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
        const database = await getDatabase();
        const registros = await listarDividas(database);
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
    () => ({ db, dividas, carregando, erroInicializacao, atualizar }),
    [db, dividas, carregando, erroInicializacao, atualizar],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData precisa estar dentro de AppDataProvider.');
  return context;
}
