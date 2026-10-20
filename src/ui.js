import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFood } from './context';
export const C = { bg: '#F4F5F1', paper: '#FFFFFF', ink: '#192D25', muted: '#6B776F', brand: '#236B48', light: '#E7F1E9', line: '#DFE5DD', danger: '#B23939' };
export const s = StyleSheet.create({
  page: { padding: 20, maxWidth: 760, width: '100%', alignSelf: 'center', paddingBottom: 44 }, h1: { color: C.ink, fontWeight: '800', fontSize: 30, lineHeight: 39 },
  h2: { color: C.ink, fontSize: 21, fontWeight: '700', marginBottom: 12 }, muted: { color: C.muted, lineHeight: 23 }, row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  card: { padding: 18, borderRadius: 18, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, marginBottom: 16 },
  input: { color: C.ink, padding: 13, backgroundColor: C.paper, borderColor: C.line, borderWidth: 1, borderRadius: 11, fontSize: 15, minHeight: 46 },
  label: { color: C.ink, fontWeight: '600', marginBottom: 8, fontSize: 14 }, error: { color: C.danger, lineHeight: 21 },
  image: { height: 190, width: '100%', borderRadius: 12 }, badge: { color: C.brand, backgroundColor: C.light, padding: 7, borderRadius: 8, fontSize: 12, fontWeight: '700', overflow: 'hidden' },
});
export function Button({ label, onPress, secondary, danger, disabled, busy, style }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => [{ padding: 12, minHeight: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
      backgroundColor: danger ? '#FCECEC' : secondary ? C.light : C.brand, opacity: disabled || busy ? 0.45 : pressed ? 0.75 : 1 }, style]}>
    {busy && <ActivityIndicator size="small" color={secondary ? C.brand : '#FFF'} />}
    <Text style={{ color: danger ? C.danger : secondary ? C.brand : '#FFF', fontWeight: '700', fontSize: 14 }}>{label}</Text>
  </Pressable>;
}
export function Field({ label, error, ...props }) {
  const { t } = useFood();
  return <View style={{ marginBottom: 16 }}><Text style={s.label}>{label}</Text>
    <TextInput accessibilityLabel={label} placeholderTextColor="#94A198" style={[s.input, props.multiline && { minHeight: 100, textAlignVertical: 'top' }]} {...props} />
    {error && <Text style={s.error}>{t(error)}</Text>}
  </View>;
}
export function Select({ label, value, items, onChange }) {
  return <View style={{ marginBottom: 14 }}><Text style={s.label}>{label}</Text>
    <View style={{ borderWidth: 1, borderColor: C.line, backgroundColor: '#FFF', borderRadius: 11, overflow: 'hidden' }}>
      <Picker accessibilityLabel={label} selectedValue={value} onValueChange={onChange} style={{ minHeight: 46, color: C.ink, width: '100%' }}>
        {items.map(item => <Picker.Item key={String(item.value)} label={item.label} value={item.value} />)}
      </Picker>
    </View>
  </View>;
}
export function Photo({ uri, style }) {
  const { t } = useFood(); const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  return !uri || failed ? <View style={[s.image, { backgroundColor: C.light, justifyContent: 'center', alignItems: 'center', padding: 18 }, style]}>
    <Text style={[s.muted, { textAlign: 'center' }]}>{t(uri ? 'imageFailed' : 'noImages')}</Text>
  </View> : <Image accessibilityLabel={t('photos')} source={{ uri, cache: 'force-cache' }} style={[s.image, style]} onError={() => setFailed(true)} resizeMode="cover" />;
}
export function ErrorText({ code }) { const { t } = useFood(); return code ? <View accessibilityRole="alert" style={{ padding: 14, borderRadius: 11, backgroundColor: '#FCECEC', marginBottom: 16 }}><Text style={s.error}>{t(code)}</Text></View> : null; }
export function Confirm({ item, onCancel, onConfirm, busy }) {
  const { t } = useFood();
  return <Modal visible={Boolean(item)} transparent animationType="fade" onRequestClose={() => { if (!busy) onCancel(); }}>
    <View style={{ flex: 1, backgroundColor: '#10251F77', justifyContent: 'center', padding: 24 }}>
      <View style={[s.card, { maxWidth: 440, width: '100%', alignSelf: 'center' }]} accessibilityViewIsModal>
        <Text style={s.h2}>{t('confirmDelete')}</Text><Text style={[s.muted, { marginBottom: 20 }]}>{t('deleteQuestion', { name: item?.Name || '' })}</Text>
        <View style={s.row}><Button label={t('cancel')} secondary disabled={busy} onPress={onCancel} style={{ flex: 1 }} /><Button label={t('delete')} danger busy={busy} onPress={onConfirm} style={{ flex: 1 }} /></View>
      </View>
    </View>
  </Modal>;
}
export const cash = value => `${Number(value).toLocaleString('vi-VN')} ₫`;
