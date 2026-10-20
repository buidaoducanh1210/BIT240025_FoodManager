import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { STUDENT_ID } from './src/config';
import { FoodProvider, useFood } from './src/context';
import { DishList, DishDetail, DishForm, CategoryScreen, SettingsScreen } from './src/screens';
import { Button, C, ErrorText, s } from './src/ui';
function Application() {
  const { t, store, data, ready, error, syncError, online, syncing, language } = useFood();
  const [routes, setRoutes] = useState([{ name: 'list' }]);
  const [actionError, setActionError] = useState('');
  const route = routes[routes.length - 1];
  const navigate = (name, id) => setRoutes(previous => [...previous, { name, id }]);
  const goBack = () => setRoutes(previous => previous.length > 1 ? previous.slice(0, -1) : previous);
  useEffect(() => { const sub = BackHandler.addEventListener('hardwareBackPress', () => { if (routes.length > 1) { goBack(); return true; } return false; }); return () => sub.remove(); }, [routes.length]);
  return <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
    <View style={{ paddingHorizontal: 18, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: C.line }}>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        {routes.length > 1 ? <Button label={t('back')} secondary onPress={goBack} /> : <Text style={{ fontSize: 21, color: C.ink, fontWeight: '800' }}>{t('app')}</Text>}
        <Button label={t('language')} secondary onPress={() => store.setSettings({ Language: language === 'en' ? 'vi' : 'en' }).catch(err => setActionError(err.code))} />
      </View><Text style={{ color: C.muted, fontSize: 11, marginTop: 8 }}>{STUDENT_ID}_FoodManager</Text>
    </View>
    <View style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: C.light }}>
      <Text style={{ color: C.brand, fontSize: 12 }}>{!data.Settings.BaseUrl ? t('local') : !online ? t('offline') : syncing ? t('syncing') : data.Outbox.length ? t('pending', { n: data.Outbox.length }) : t('synced')}</Text>
    </View>
    {(error || syncError || actionError) && <View style={{ paddingHorizontal: 20, paddingTop: 12 }}><ErrorText code={error || syncError || actionError} />
      {!ready && <Button label={t('retry')} onPress={() => store.initialize()} />}</View>}
    {!ready ? <View style={{ padding: 40, alignItems: 'center', gap: 16 }}><ActivityIndicator color={C.brand} /><Text>{t('loading')}</Text></View>
      : route.name === 'list' ? <DishList navigate={navigate} /> : route.name === 'detail' ? <DishDetail id={route.id} navigate={navigate} goBack={goBack} />
        : route.name === 'form' ? <DishForm key={route.id || 'new'} id={route.id} navigate={navigate} goBack={goBack} />
          : route.name === 'categories' ? <CategoryScreen /> : <SettingsScreen />}
  </SafeAreaView>;
}
export default function App() {
  return <SafeAreaProvider><StatusBar style="dark" />{STUDENT_ID ? <FoodProvider><Application /></FoodProvider>
    : <SafeAreaView style={[s.page, { flex: 1, justifyContent: 'center', gap: 20 }]}><Text style={s.h1}>Food Manager</Text><Text style={s.h2}>Set your student ID first / Cấu hình MSSV</Text><Text style={s.muted}>Run: node setup.mjs{ '\n' }Chạy bộ cài setup.mjs ở bên ngoài thư mục project để đặt tên và tiền tố MSSV đúng theo đề.</Text></SafeAreaView>}
  </SafeAreaProvider>;
}
