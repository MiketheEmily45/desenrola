import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export function Page({
  title,
  subtitle,
  onBack,
  children,
}: React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
}>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>DESENROLA • FINANÇAS NO SEU RITMO</Text>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={onBack}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹ Voltar</Text>
          </Pressable>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({
  children,
  tone = 'default',
  style,
}: React.PropsWithChildren<{
  tone?: 'default' | 'green' | 'warm';
  style?: object;
}>) {
  return (
    <View
      style={[
        styles.card,
        tone === 'green' && styles.greenCard,
        tone === 'warm' && styles.warmCard,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'quiet';
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
        variant === 'quiet' && styles.quietButton,
        (disabled || loading) && styles.disabledButton,
        pressed && !disabled && styles.pressedButton,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.surface : colors.green} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'primary' && styles.primaryButtonText,
            variant === 'danger' && styles.dangerButtonText,
            variant === 'quiet' && styles.quietButtonText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  keyboardType = 'default',
  editable = true,
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  hint?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'numeric';
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words';
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize}
        editable={editable}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function ErrorMessage({ children }: React.PropsWithChildren) {
  return (
    <View accessibilityRole="alert" style={styles.errorBox}>
      <Text style={styles.errorText}>{children}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.bodyText}>{message}</Text>
      {action ? <View style={styles.actionGap}>{action}</View> : null}
    </Card>
  );
}

export function SectionTitle({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  page: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 36 },
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  backButton: { alignSelf: 'flex-start', marginTop: 14, paddingVertical: 3, paddingRight: 12 },
  backText: { color: colors.green, fontSize: 14, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 30, fontWeight: '800', letterSpacing: -0.8, marginTop: 10 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 6 },
  content: { gap: 16, marginTop: 24 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  greenCard: { backgroundColor: colors.greenDark, borderColor: colors.greenDark },
  warmCard: { backgroundColor: '#FFF9EF', borderColor: '#F2E5D2' },
  button: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  primaryButton: { backgroundColor: colors.green },
  secondaryButton: { backgroundColor: colors.mint, borderColor: '#CBE4D0', borderWidth: 1 },
  dangerButton: { backgroundColor: colors.redLight },
  quietButton: { backgroundColor: 'transparent', borderColor: colors.line, borderWidth: 1 },
  disabledButton: { opacity: 0.5 },
  pressedButton: { opacity: 0.78 },
  buttonText: { color: colors.greenDark, fontSize: 15, fontWeight: '700' },
  primaryButtonText: { color: colors.surface },
  dangerButtonText: { color: colors.red },
  quietButtonText: { color: colors.muted },
  fieldGroup: { gap: 7 },
  fieldLabel: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 15,
  },
  inputDisabled: { backgroundColor: colors.background, color: colors.muted },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  errorBox: {
    backgroundColor: colors.redLight,
    borderColor: '#F1CECB',
    borderRadius: 14,
    borderWidth: 1,
    padding: 13,
  },
  errorText: { color: colors.red, fontSize: 14, lineHeight: 20 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  bodyText: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  actionGap: { marginTop: 4 },
  sectionHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  sectionDetail: { color: colors.muted, fontSize: 12 },
});
