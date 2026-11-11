import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, EmptyState, ErrorMessage, Field, Page, SectionTitle } from '../components/UI';
import { useAppData } from '../context/AppDataContext';
import type { SimulacaoStackParamList } from '../navigation/types';
import { simularQuitacao } from '../services/simulacaoService';
import type { Divida, ResultadoSimulacao } from '../types';
import { colors } from '../theme/colors';
import { formatCurrency, parseCurrencyToCents } from '../utils/format';

type FormProps = NativeStackScreenProps<SimulacaoStackParamList, 'Simulacao'>;
type ResultProps = NativeStackScreenProps<SimulacaoStackParamList, 'ResultadoSimulacao'>;

export function SimulatorScreen({ navigation }: FormProps) {
  const { dividas } = useAppData();
  const ativas = useMemo(
    () => dividas.filter((divida) => divida.saldoAtualCentavos > 0),
    [dividas],
  );
  const [selecionadas, setSelecionadas] = useState<number[]>(() =>
    dividas.filter((divida) => divida.saldoAtualCentavos > 0).map((divida) => divida.id),
  );
  const [orcamento, setOrcamento] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const idsSelecionados = selecionadas.filter((id) =>
    ativas.some((divida) => divida.id === id),
  );

  const alternarDivida = (id: number) => {
    const atuais = idsSelecionados;
    setSelecionadas(
      atuais.includes(id) ? atuais.filter((item) => item !== id) : [...atuais, id],
    );
  };

  const comparar = () => {
    setErro(null);
    const orçamentoCentavos = parseCurrencyToCents(orcamento);
    if (idsSelecionados.length === 0) return setErro('Selecione ao menos uma dívida ativa.');
    if (orçamentoCentavos === null || orçamentoCentavos <= 0) {
      return setErro('Informe um orçamento mensal maior que zero.');
    }

    const dividasSelecionadas = ativas.filter((divida) => idsSelecionados.includes(divida.id));
    try {
      const resultados = [
        simularQuitacao(
          { dividas: dividasSelecionadas, orcamentoMensalCentavos: orçamentoCentavos },
          'bolaDeNeve',
        ),
        simularQuitacao(
          { dividas: dividasSelecionadas, orcamentoMensalCentavos: orçamentoCentavos },
          'avalanche',
        ),
      ];
      navigation.navigate('ResultadoSimulacao', {
        dividas: dividasSelecionadas,
        resultados,
      });
    } catch (error: unknown) {
      setErro(error instanceof Error ? error.message : 'Não foi possível calcular a simulação.');
    }
  };

  if (ativas.length === 0) {
    return (
      <Page title="Simular quitação" subtitle="Compare duas estratégias com o mesmo orçamento.">
        <EmptyState
          title="Cadastre uma dívida primeiro"
          message="A simulação usa os saldos, taxas e pagamentos mínimos das dívidas ativas."
        />
      </Page>
    );
  }

  return (
    <Page
      title="Simular quitação"
      subtitle="Compare os métodos bola de neve e avalanche com um orçamento mensal."
    >
      {erro ? <ErrorMessage>{erro}</ErrorMessage> : null}
      <Field
        label="Orçamento mensal total (R$)"
        value={orcamento}
        onChangeText={setOrcamento}
        placeholder="Ex.: 1.000,00"
        keyboardType="decimal-pad"
        hint="Esse valor inclui os pagamentos mínimos de todas as dívidas selecionadas."
      />
      <View style={{ gap: 12 }}>
        <SectionTitle title="Dívidas da comparação" detail={`${idsSelecionados.length} selecionadas`} />
        {ativas.map((divida) => {
          const selecionada = idsSelecionados.includes(divida.id);
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selecionada }}
              key={divida.id}
              onPress={() => alternarDivida(divida.id)}
            >
              <Card style={{ padding: 14 }}>
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: selecionada ? colors.green : colors.surface,
                      borderColor: selecionada ? colors.green : colors.line,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      height: 24,
                      justifyContent: 'center',
                      width: 24,
                    }}
                  >
                    {selecionada ? <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>✓</Text> : null}
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '700' }}>
                      {divida.descricao}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                      Juros {divida.taxaJurosMensal}% ao mês · mínimo {formatCurrency(divida.pagamentoMinimoCentavos)}
                    </Text>
                  </View>
                  <Text style={{ color: colors.green, fontSize: 14, fontWeight: '800' }}>
                    {formatCurrency(divida.saldoAtualCentavos)}
                  </Text>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
      <Card tone="warm">
        <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '800' }}>
          Uma projeção educativa
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
          Juros mensais fixos, sem tarifas, multas ou renegociações. A simulação não altera seus saldos reais.
        </Text>
      </Card>
      <Button title="Comparar estratégias" onPress={comparar} />
    </Page>
  );
}

export function SimulationResultScreen({ route, navigation }: ResultProps) {
  const { dividas, resultados } = route.params;
  const nomePorId = new Map(dividas.map((divida) => [divida.id, divida.descricao]));

  return (
    <Page
      title="Duas rotas possíveis"
      subtitle="Projeções com o mesmo orçamento. Os resultados são estimativas, não uma promessa de quitação."
      onBack={() => navigation.goBack()}
    >
      {resultados.map((resultado) => (
        <ResultCard
          dividas={dividas}
          key={resultado.metodo}
          nomePorId={nomePorId}
          resultado={resultado}
        />
      ))}
      <Card tone="warm">
        <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '800' }}>
          Como ler esta comparação
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
          A bola de neve prioriza o menor saldo. A avalanche prioriza a maior taxa mensal. Em empates,
          usamos o vencimento e depois o identificador da dívida. Juros são aplicados mensalmente
          sobre o saldo, com arredondamento para centavos.
        </Text>
      </Card>
    </Page>
  );
}

function ResultCard({
  resultado,
  dividas,
  nomePorId,
}: {
  resultado: ResultadoSimulacao;
  dividas: Divida[];
  nomePorId: Map<number, string>;
}) {
  const bolaDeNeve = resultado.metodo === 'bolaDeNeve';
  const titulo = bolaDeNeve ? 'Bola de neve' : 'Avalanche';
  const descricao = bolaDeNeve
    ? 'Prioriza a dívida com menor saldo.'
    : 'Prioriza a dívida com maior taxa de juros.';

  return (
    <Card tone={bolaDeNeve ? 'green' : 'default'}>
      <Text style={{ color: bolaDeNeve ? '#D5E9D9' : colors.green, fontSize: 12, fontWeight: '800', letterSpacing: 0.8 }}>
        ESTRATÉGIA
      </Text>
      <Text style={{ color: bolaDeNeve ? '#FFFFFF' : colors.ink, fontSize: 24, fontWeight: '800' }}>
        {titulo}
      </Text>
      <Text style={{ color: bolaDeNeve ? '#D5E9D9' : colors.muted, fontSize: 14 }}>
        {descricao}
      </Text>
      <View style={{ height: 1, backgroundColor: bolaDeNeve ? '#437457' : colors.line }} />
      <Metric
        label="Prazo estimado"
        value={resultado.quitado ? `${resultado.prazoMeses} ${resultado.prazoMeses === 1 ? 'mês' : 'meses'}` : 'Não quitada'}
        inverted={bolaDeNeve}
      />
      <Metric
        label="Juros na projeção"
        value={formatCurrency(resultado.totalJurosCentavos)}
        inverted={bolaDeNeve}
      />
      <Metric
        label="Total pago na projeção"
        value={formatCurrency(resultado.totalPagoCentavos)}
        inverted={bolaDeNeve}
      />
      <View style={{ gap: 5 }}>
        <Text style={{ color: bolaDeNeve ? '#D5E9D9' : colors.muted, fontSize: 12, fontWeight: '700' }}>
          ORDEM DE QUITAÇÃO
        </Text>
        <Text style={{ color: bolaDeNeve ? '#FFFFFF' : colors.ink, fontSize: 14, lineHeight: 20 }}>
          {resultado.ordemQuitacao.length > 0
            ? resultado.ordemQuitacao.map((id) => nomePorId.get(id) ?? `Dívida ${id}`).join(' → ')
            : 'Nenhuma dívida quitada na projeção'}
        </Text>
      </View>
      {!resultado.quitado && resultado.motivo ? (
        <Text style={{ color: bolaDeNeve ? '#F3D9A5' : colors.orange, fontSize: 13, lineHeight: 19 }}>
          {resultado.motivo}
        </Text>
      ) : null}
      <Text style={{ color: bolaDeNeve ? '#D5E9D9' : colors.muted, fontSize: 11, lineHeight: 17 }}>
        Base: {dividas.length} {dividas.length === 1 ? 'dívida selecionada' : 'dívidas selecionadas'}.
      </Text>
    </Card>
  );
}

function Metric({
  label,
  value,
  inverted,
}: {
  label: string;
  value: string;
  inverted: boolean;
}) {
  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ color: inverted ? '#D5E9D9' : colors.muted, flex: 1, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: inverted ? '#FFFFFF' : colors.ink, fontSize: 14, fontWeight: '800' }}>{value}</Text>
    </View>
  );
}
