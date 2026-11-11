import React from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, Page } from '../components/UI';
import { conteudosEducativos } from '../data/conteudos';
import type { AprenderStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type ListProps = NativeStackScreenProps<AprenderStackParamList, 'ListaConteudos'>;
type DetailProps = NativeStackScreenProps<AprenderStackParamList, 'DetalheConteudo'>;

export function LearningListScreen({ navigation }: ListProps) {
  return (
    <Page
      title="Aprender"
      subtitle="Ideias simples para entender juros, planejar e conversar sobre suas dívidas."
    >
      {conteudosEducativos.map((conteudo, index) => (
        <Pressable
          accessibilityRole="button"
          key={conteudo.id}
          onPress={() => navigation.navigate('DetalheConteudo', { conteudo })}
        >
          <Card style={{ padding: 17 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 14 }}>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: index % 2 === 0 ? colors.mint : '#F2EDE3',
                  borderRadius: 14,
                  height: 44,
                  justifyContent: 'center',
                  width: 44,
                }}
              >
                <Text style={{ color: colors.green, fontSize: 14, fontWeight: '800' }}>
                  0{index + 1}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '800' }}>
                  {conteudo.titulo}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 13 }}>Conteúdo disponível offline</Text>
              </View>
              <Text style={{ color: colors.green, fontSize: 20 }}>›</Text>
            </View>
          </Card>
        </Pressable>
      ))}
      <Card tone="warm">
        <Text style={{ color: colors.ink, fontSize: 14, fontWeight: '800' }}>
          Informação para apoiar, não substituir
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
          Os textos são educativos. Para decisões sobre contratos, confirme valores e condições diretamente com a instituição credora.
        </Text>
      </Card>
    </Page>
  );
}

export function LearningDetailScreen({ route, navigation }: DetailProps) {
  const { conteudo } = route.params;

  return (
    <Page
      title={conteudo.titulo}
      subtitle="Conteúdo educativo disponível offline"
      onBack={() => navigation.goBack()}
    >
      <Card>
        <Text style={{ color: colors.ink, fontSize: 15, lineHeight: 25 }}>
          {conteudo.texto}
        </Text>
      </Card>
      <View style={{ gap: 10 }}>
        <Text style={{ color: colors.ink, fontSize: 17, fontWeight: '800' }}>Fontes para saber mais</Text>
        {conteudo.fontes.map((fonte) => {
          const [nome, url] = fonte.split(': https://');
          const link = `https://${url}`;
          return (
            <Pressable
              accessibilityRole="link"
              key={fonte}
              onPress={async () => {
                try {
                  await Linking.openURL(link);
                } catch {
                  Alert.alert('Link indisponível', 'Não foi possível abrir esta fonte. Verifique a conexão e tente novamente.');
                }
              }}
            >
              <Card style={{ padding: 14 }}>
                <Text style={{ color: colors.green, fontSize: 14, fontWeight: '700', lineHeight: 20 }}>
                  {nome}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{link}</Text>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </Page>
  );
}
