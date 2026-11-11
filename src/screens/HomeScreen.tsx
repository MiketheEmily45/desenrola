import React from 'react';
import { Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Card, Button, Page, SectionTitle } from '../components/UI';
import { useAppData } from '../context/AppDataContext';
import type { AppTabParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { formatCurrency, formatDate, todayISO } from '../utils/format';

type Props = BottomTabScreenProps<AppTabParamList, 'Inicio'>;

export function HomeScreen({ navigation }: Props) {
  const { dividas } = useAppData();
  const ativas = dividas.filter((divida) => divida.saldoAtualCentavos > 0);
  const totalPendente = ativas.reduce((total, divida) => total + divida.saldoAtualCentavos, 0);
  const vencimentos = [...ativas].sort(
    (a, b) => a.vencimento.localeCompare(b.vencimento) || a.id - b.id,
  ).slice(0, 3);

  return (
    <Page
      title="Seu dinheiro, mais claro."
      subtitle="Organize as dívidas e acompanhe cada passo, sem complicação."
    >
      <Card tone="green">
        <Text style={{ color: '#D5E9D9', fontSize: 13, fontWeight: '700' }}>
          TOTAL PENDENTE
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 34, fontWeight: '800', letterSpacing: -1 }}>
          {formatCurrency(totalPendente)}
        </Text>
        <Text style={{ color: '#D5E9D9', fontSize: 14 }}>
          {ativas.length} {ativas.length === 1 ? 'dívida ativa' : 'dívidas ativas'}
        </Text>
        <View style={{ marginTop: 4 }}>
          <Button
            title="Ver minhas dívidas"
            variant="secondary"
            onPress={() => navigation.navigate('Dividas')}
          />
        </View>
      </Card>

      <View style={{ gap: 12 }}>
        <SectionTitle title="Próximos vencimentos" detail="por data" />
        {vencimentos.length === 0 ? (
          <Card>
            <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '700' }}>
              Tudo em dia por aqui
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>
              Cadastre uma dívida para começar a acompanhar seus compromissos.
            </Text>
            <Button
              title="Cadastrar dívida"
              onPress={() => navigation.navigate('Dividas', { screen: 'FormularioDivida' })}
            />
          </Card>
        ) : (
          vencimentos.map((divida) => {
            const vencida = divida.vencimento < todayISO();
            return (
              <Card key={divida.id} style={{ padding: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '700' }}>
                      {divida.descricao}
                    </Text>
                    <Text style={{ color: vencida ? colors.red : colors.muted, fontSize: 13 }}>
                      {vencida ? 'Vencimento de referência: ' : 'Vence em '}
                      {formatDate(divida.vencimento)}
                    </Text>
                  </View>
                  <Text style={{ color: colors.ink, fontSize: 14, fontWeight: '700' }}>
                    {formatCurrency(divida.saldoAtualCentavos)}
                  </Text>
                </View>
              </Card>
            );
          })
        )}
      </View>

      <Card tone="warm">
        <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '800' }}>
          Um passo de cada vez
        </Text>
        <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>
          Os valores são salvos somente neste aparelho. A simulação é uma estimativa educativa,
          não substitui as condições do seu contrato.
        </Text>
        <Button
          title="Aprender sobre finanças"
          variant="quiet"
          onPress={() => navigation.navigate('Aprender')}
        />
      </Card>
    </Page>
  );
}
