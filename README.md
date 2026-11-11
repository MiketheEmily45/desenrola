# Desenrola

Aplicativo móvel de organização e simulação de dívidas, desenvolvido com React Native, Expo e TypeScript.

## Executar

1. Instale o Node.js (LTS) e o aplicativo Expo Go no celular.
2. Na pasta do projeto, instale as dependências:

   ```sh
   npm install
   ```

3. Inicie o Expo:

   ```sh
   npx expo start
   ```

4. Leia o QR code com o Expo Go. Para usar um emulador Android, execute `npm run android`.

## Funcionalidades

- Cadastro, edição, consulta e exclusão de dívidas.
- Registro de pagamentos com atualização transacional do saldo e histórico local.
- Comparação educativa entre bola de neve e avalanche.
- Conteúdos financeiros acessíveis offline.
- Persistência local em SQLite; o app não exige conta, login ou conexão com servidor.

## Testes

```sh
npm test
npx tsc --noEmit
```

## Premissas e limites

Valores são armazenados em centavos inteiros e taxas em percentual mensal. A simulação aplica juros mensais fixos, considera o pagamento mínimo informado e limita a projeção a 600 meses. Não inclui tarifas, multas, renegociações ou regras contratuais específicas e não altera as dívidas registradas. Use os resultados como estimativa educativa, não como aconselhamento financeiro.

As dívidas e os pagamentos permanecem no aparelho. Esta versão não oferece sincronização, exportação ou backup; remover os dados do aplicativo pode apagá-los.
