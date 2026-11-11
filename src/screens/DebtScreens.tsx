import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Button,
  Card,
  EmptyState,
  ErrorMessage,
  Field,
  Page,
  SectionTitle,
} from '../components/UI';
import { useAppData } from '../context/AppDataContext';
import {
  contarPagamentos,
  excluirDivida,
  listarPagamentos,
  registrarPagamento,
  salvarDivida,
} from '../repositories/financeiroRepository';
import type { DividasStackParamList } from '../navigation/types';
import type { Divida, Pagamento } from '../types';
import { colors } from '../theme/colors';
import {
  formatCurrency,
  formatDate,
  isValidISODate,
  parseCurrencyToCents,
  todayISO,
} from '../utils/format';

type ListProps = NativeStackScreenProps<DividasStackParamList, 'DividaLista'>;
type DetailProps = NativeStackScreenProps<DividasStackParamList, 'DividaDetalhe'>;
type FormProps = NativeStackScreenProps<DividasStackParamList, 'FormularioDivida'>;
type PaymentProps = NativeStackScreenProps<DividasStackParamList, 'RegistrarPagamento'>;

export function DebtListScreen({ navigation }: ListProps) {
  const { dividas } = useAppData();

  return (
    <Page
      title="Minhas dívidas"
      subtitle="Veja o saldo atual de cada compromisso."
    >
      <Button title="＋ Cadastrar dívida" onPress={() => navigation.navigate('FormularioDivida')} />
      {dividas.length === 0 ? (
        <EmptyState
          title="Sua lista começa aqui"
          message="Cadastre uma dívida para acompanhar o saldo, registrar pagamentos e comparar formas de quitação."
          action={
            <Button title="Cadastrar primeira dívida" onPress={() => navigation.navigate('FormularioDivida')} />
          }
        />
      ) : (
        <View style={{ gap: 12 }}>
          {dividas.map((divida) => (
            <Pressable
              accessibilityRole="button"
              key={divida.id}
              onPress={() => navigation.navigate('DividaDetalhe', { id: divida.id })}
            >
              <Card style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '800' }}>
                      {divida.descricao}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>
                      {divida.saldoAtualCentavos === 0 ? 'Quitada' : `Vencimento: ${formatDate(divida.vencimento)}`}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ color: colors.green, fontSize: 16, fontWeight: '800' }}>
                      {formatCurrency(divida.saldoAtualCentavos)}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 11 }}>
                      {divida.saldoAtualCentavos === 0 ? 'saldo atual' : 'saldo pendente'}
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </Page>
  );
}

export function DebtDetailScreen({ route, navigation }: DetailProps) {
  const { db, dividas, atualizar } = useAppData();
  const divida = dividas.find((item) => item.id === route.params.id);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      if (!db) return () => { ativo = false; };
      void listarPagamentos(db, route.params.id)
        .then((registros) => {
          if (ativo) {
            setPagamentos(registros);
            setErro(null);
          }
        })
        .catch((error: unknown) => {
          if (ativo) setErro(mensagemErro(error));
        });
      return () => { ativo = false; };
    }, [db, route.params.id]),
  );

  const confirmarExclusao = () => {
    Alert.alert(
      'Excluir dívida?',
      'A dívida e todo o histórico de pagamentos serão removidos deste aparelho.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              if (!db) return;
              try {
                await excluirDivida(db, route.params.id);
                await atualizar();
                navigation.goBack();
              } catch (error: unknown) {
                setErro(mensagemErro(error));
              }
            })();
          },
        },
      ],
    );
  };

  if (!divida) {
    return (
      <Page title="Dívida não encontrada" onBack={() => navigation.goBack()}>
        <ErrorMessage>Essa dívida pode ter sido excluída. Volte à lista para atualizar.</ErrorMessage>
        <Button title="Voltar" variant="quiet" onPress={() => navigation.goBack()} />
      </Page>
    );
  }

  return (
    <Page title={divida.descricao} subtitle="Detalhes e histórico" onBack={() => navigation.goBack()}>
      {erro ? <ErrorMessage>{erro}</ErrorMessage> : null}
      <Card tone="green">
        <Text style={{ color: '#D5E9D9', fontSize: 13, fontWeight: '700' }}>SALDO ATUAL</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 34, fontWeight: '800' }}>
          {formatCurrency(divida.saldoAtualCentavos)}
        </Text>
        <Text style={{ color: '#D5E9D9', fontSize: 14 }}>
          Valor inicial: {formatCurrency(divida.valorInicialCentavos)}
        </Text>
      </Card>

      <Card>
        <InfoRow label="Juros mensais" value={`${divida.taxaJurosMensal}%`} />
        <InfoRow label="Vencimento de referência" value={formatDate(divida.vencimento)} />
        <InfoRow label="Pagamento mínimo planejado" value={formatCurrency(divida.pagamentoMinimoCentavos)} />
      </Card>

      {divida.saldoAtualCentavos > 0 ? (
        <Button title="Registrar pagamento" onPress={() => navigation.navigate('RegistrarPagamento', { id: divida.id })} />
      ) : (
        <Card tone="warm">
          <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '700' }}>
            Dívida quitada
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14 }}>
            Os pagamentos registrados mantêm o histórico neste aparelho.
          </Text>
        </Card>
      )}

      <View style={{ gap: 12 }}>
        <SectionTitle title="Pagamentos" detail={`${pagamentos.length} registrados`} />
        {pagamentos.length === 0 ? (
          <EmptyState title="Sem pagamentos registrados" message="Quando registrar um pagamento, ele aparecerá aqui." />
        ) : (
          pagamentos.map((pagamento) => (
            <Card key={pagamento.id} style={{ padding: 15 }}>
              <InfoRow label={formatDate(pagamento.dataPagamento)} value={formatCurrency(pagamento.valorCentavos)} />
            </Card>
          ))
        )}
      </View>

      <Button
        title="Editar dados"
        variant="secondary"
        onPress={() => navigation.navigate('FormularioDivida', { id: divida.id })}
      />
      <Button title="Excluir dívida" variant="danger" onPress={confirmarExclusao} />
    </Page>
  );
}

export function DebtFormScreen({ route, navigation }: FormProps) {
  const id = route.params?.id;
  const { db, dividas, atualizar } = useAppData();
  const existing = dividas.find((item) => item.id === id);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [juros, setJuros] = useState('');
  const [vencimento, setVencimento] = useState(todayISO());
  const [minimo, setMinimo] = useState('');
  const [comPagamentos, setComPagamentos] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    if (!existing) return () => { ativo = false; };
    setDescricao(existing.descricao);
    setValor((existing.valorInicialCentavos / 100).toFixed(2).replace('.', ','));
    setJuros(String(existing.taxaJurosMensal));
    setVencimento(existing.vencimento);
    setMinimo((existing.pagamentoMinimoCentavos / 100).toFixed(2).replace('.', ','));
    if (db) {
      void contarPagamentos(db, existing.id)
        .then((total) => { if (ativo) setComPagamentos(total > 0); })
        .catch((error: unknown) => { if (ativo) setErro(mensagemErro(error)); });
    }
    return () => { ativo = false; };
  }, [db, existing]);

  const salvar = async () => {
    setErro(null);
    const valorCentavos = parseCurrencyToCents(valor);
    const minimoCentavos = parseCurrencyToCents(minimo);
    const taxa = Number(juros.replace(',', '.'));

    if (!descricao.trim()) return setErro('Informe uma descrição para a dívida.');
    if (valorCentavos === null || valorCentavos <= 0) return setErro('Informe um valor inicial maior que zero.');
    if (!juros.trim()) return setErro('Informe a taxa mensal. Use 0 se não houver juros.');
    if (!Number.isFinite(taxa) || taxa < 0) return setErro('Informe uma taxa mensal válida, igual ou maior que zero.');
    if (!isValidISODate(vencimento)) return setErro('Informe uma data válida no formato AAAA-MM-DD.');
    if (minimoCentavos === null || minimoCentavos <= 0 || minimoCentavos > valorCentavos) {
      return setErro('O pagamento mínimo deve ser positivo e não superar o valor inicial.');
    }
    if (!db) return setErro('O banco local ainda não está disponível.');

    setSalvando(true);
    try {
      await salvarDivida(
        db,
        {
          descricao: descricao.trim(),
          valorInicialCentavos: valorCentavos,
          taxaJurosMensal: taxa,
          vencimento,
          pagamentoMinimoCentavos: minimoCentavos,
        },
        id,
      );
      await atualizar();
      navigation.goBack();
    } catch (error: unknown) {
      setErro(mensagemErro(error));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Page
      title={id ? 'Editar dívida' : 'Nova dívida'}
      subtitle="Os valores ficam salvos somente neste aparelho."
      onBack={() => navigation.goBack()}
    >
      {erro ? <ErrorMessage>{erro}</ErrorMessage> : null}
      <Field label="Descrição" value={descricao} onChangeText={setDescricao} placeholder="Ex.: Cartão de crédito" />
      <Field
        label="Valor inicial (R$)"
        value={valor}
        onChangeText={setValor}
        placeholder="0,00"
        keyboardType="decimal-pad"
        editable={!comPagamentos}
        hint={comPagamentos ? 'Bloqueado porque já existem pagamentos registrados.' : undefined}
      />
      <Field
        label="Juros mensais (%)"
        value={juros}
        onChangeText={setJuros}
        placeholder="Ex.: 2,5"
        keyboardType="decimal-pad"
        hint="Informe a taxa mensal. Use 0 se não houver juros."
      />
      <Field
        label="Vencimento de referência"
        value={vencimento}
        onChangeText={setVencimento}
        placeholder="AAAA-MM-DD"
        hint="Formato AAAA-MM-DD. Não representa um calendário de parcelas."
        autoCapitalize="none"
      />
      <Field
        label="Pagamento mínimo planejado (R$)"
        value={minimo}
        onChangeText={setMinimo}
        placeholder="0,00"
        keyboardType="decimal-pad"
      />
      <Button title={id ? 'Salvar alterações' : 'Salvar dívida'} onPress={() => void salvar()} loading={salvando} />
      <Button title="Cancelar" variant="quiet" onPress={() => navigation.goBack()} />
    </Page>
  );
}

export function PaymentFormScreen({ route, navigation }: PaymentProps) {
  const { db, dividas, atualizar } = useAppData();
  const divida = dividas.find((item) => item.id === route.params.id);
  const [valor, setValor] = useState('');
  const [data, setData] = useState(todayISO());
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    setErro(null);
    const valorCentavos = parseCurrencyToCents(valor);
    if (!divida) return setErro('Essa dívida não foi encontrada.');
    if (valorCentavos === null || valorCentavos <= 0) return setErro('Informe um pagamento maior que zero.');
    if (!isValidISODate(data)) return setErro('Informe uma data válida no formato AAAA-MM-DD.');
    if (valorCentavos > divida.saldoAtualCentavos) {
      return setErro('O pagamento não pode ser maior que o saldo atual.');
    }
    if (!db) return setErro('O banco local ainda não está disponível.');

    setSalvando(true);
    try {
      await registrarPagamento(db, {
        dividaId: divida.id,
        valorCentavos,
        dataPagamento: data,
      });
      await atualizar();
      navigation.goBack();
    } catch (error: unknown) {
      setErro(mensagemErro(error));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Page
      title="Registrar pagamento"
      subtitle={divida ? `${divida.descricao} • saldo ${formatCurrency(divida.saldoAtualCentavos)}` : undefined}
      onBack={() => navigation.goBack()}
    >
      {erro ? <ErrorMessage>{erro}</ErrorMessage> : null}
      <Field
        label="Valor pago (R$)"
        value={valor}
        onChangeText={setValor}
        placeholder="0,00"
        keyboardType="decimal-pad"
      />
      <Field
        label="Data do pagamento"
        value={data}
        onChangeText={setData}
        placeholder="AAAA-MM-DD"
        autoCapitalize="none"
      />
      <Card tone="warm">
        <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
          O registro do pagamento e o abatimento do saldo são salvos juntos. Esta ação não pode ser desfeita no app.
        </Text>
      </Card>
      <Button title="Confirmar pagamento" onPress={() => void salvar()} loading={salvando} />
      <Button title="Cancelar" variant="quiet" onPress={() => navigation.goBack()} />
    </Page>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ color: colors.muted, flex: 1, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: colors.ink, fontSize: 14, fontWeight: '700', textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

function mensagemErro(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.';
}
