import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useFood } from './context';
import { Button, C, Confirm, ErrorText, Field, Photo, Select, cash, s } from './ui';
import { DEFAULT_FILTERS, isUrl, selectDishes, validateCategory, validateDish } from './core/domain';

export function DishList({ navigate }) {
  const { t, dishes, categories, data, store } = useFood();
  const filters = data.Settings.Filters;
  const [error, setError] = useState('');
  const change = patch => store.setFilters(patch).catch(err => setError(err.code));
  const { items, error: filterError } = selectDishes(dishes, filters);
  const header = <View>
    <Text style={{ color: C.brand, letterSpacing: 2, fontWeight: '700', fontSize: 11, marginBottom: 12 }}>FOOD MANAGER</Text>
    <Text style={s.h1}>{t('menu')}</Text><Text style={[s.muted, { marginTop: 8, marginBottom: 20 }]}>{t('intro')}</Text>
    <View style={[s.row, { marginBottom: 12 }]}><Button label={t('addDish')} onPress={() => navigate('form')} style={{ flex: 1 }} /><Button label={t('categories')} secondary onPress={() => navigate('categories')} /></View>
    <Button label={t('settings')} secondary onPress={() => navigate('settings')} style={{ marginBottom: 20 }} />
    <Field label={t('search')} value={filters.Search} onChangeText={Search => change({ Search })} />
    <Select label={t('category')} value={filters.Category} onChange={Category => change({ Category })}
      items={[{ label: t('allCategories'), value: '' }, ...categories.map(item => ({ label: item.Name, value: item.Id }))]} />
    <Select label={t('available')} value={filters.Available} onChange={Available => change({ Available })}
      items={['all', 'available', 'unavailable'].map(value => ({ value, label: t(value === 'all' ? 'allStatus' : value) }))} />
    <View style={s.row}><View style={{ flex: 1 }}><Field label={t('minPrice')} value={filters.Min} onChangeText={Min => change({ Min })} keyboardType="numeric" /></View>
      <View style={{ flex: 1 }}><Field label={t('maxPrice')} value={filters.Max} onChangeText={Max => change({ Max })} keyboardType="numeric" /></View></View>
    <Select label={t('sort')} value={filters.Sort} onChange={Sort => change({ Sort })}
      items={['name', 'priceAsc', 'priceDesc', 'timeAsc'].map(value => ({ value, label: t(value === 'name' ? 'nameSort' : value) }))} />
    <Button label={t('reset')} secondary onPress={() => change({ ...DEFAULT_FILTERS })} />
    <Text style={[s.muted, { marginVertical: 18 }]}>{t('results', { n: items.length })}</Text>
    <ErrorText code={filterError || error} />
  </View>;
  return <FlatList data={items} keyExtractor={item => item.Id} contentContainerStyle={s.page} keyboardShouldPersistTaps="handled" ListHeaderComponent={header}
    ListEmptyComponent={<View style={s.card}><Text style={s.h2}>{t('noDishes')}</Text><Text style={s.muted}>{t('noDishesHint')}</Text></View>}
    renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={item.Name} onPress={() => navigate('detail', item.Id)} style={s.card}>
      <Photo uri={(item.DishImage.find(image => image.IsThumbnail) || item.DishImage[0])?.ImageUrl} />
      <Text style={{ color: C.brand, marginTop: 16, marginBottom: 8, fontSize: 12, fontWeight: '700' }}>{categories.find(category => category.Id === item.DishCategoryId)?.Name}</Text>
      <Text style={s.h2}>{item.Name}</Text><View style={[s.row, { flexWrap: 'wrap', marginBottom: 16 }]}>
        <Text style={s.badge}>{t(item.PreparationTime <= 15 ? 'quick' : 'regular')} · {item.PreparationTime} {t('minutes')}</Text>
        <Text style={[s.badge, !item.IsAvailable && { color: C.danger, backgroundColor: '#FCECEC' }]}>{t(item.IsAvailable ? 'available' : 'unavailable')}</Text>
      </View><Text style={{ color: C.ink, fontSize: 23, fontWeight: '800' }}>{cash(item.Price)}</Text>
    </Pressable>} />;
}

export function DishDetail({ id, navigate, goBack }) {
  const { dishes, categories, store, t } = useFood();
  const dish = dishes.find(item => item.Id === id);
  const [confirm, setConfirm] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  if (!dish) return <View style={s.page}><ErrorText code="notFound" /><Button label={t('back')} onPress={goBack} /></View>;
  const remove = async () => { setBusy(true); try { await store.remove('Dish', dish.Id); goBack(); } catch (err) { setError(err.code); setConfirm(false); } finally { setBusy(false); } };
  const cover = async index => {
    setBusy(true); setError('');
    try { await store.saveDish({ ...dish, DishImage: dish.DishImage.map((image, i) => ({ ...image, IsThumbnail: i === index })) }, dish.Id); }
    catch (err) { setError(err.code); } finally { setBusy(false); }
  };
  return <ScrollView contentContainerStyle={s.page}>
    <ErrorText code={error} /><Text style={s.h1}>{dish.Name}</Text>
    <Text style={[s.muted, { marginVertical: 12 }]}>{categories.find(item => item.Id === dish.DishCategoryId)?.Name}</Text>
    <View style={[s.card, { gap: 12 }]}><Text style={{ color: C.brand, fontSize: 30, fontWeight: '800' }}>{cash(dish.Price)}</Text>
      <Text style={s.badge}>{t(dish.PreparationTime <= 15 ? 'quick' : 'regular')} · {dish.PreparationTime} {t('minutes')}</Text>
      <Text style={s.muted}>{t(dish.IsAvailable ? 'available' : 'unavailable')}</Text></View>
    <Text style={s.h2}>{t('description')}</Text><Text style={[s.muted, { marginBottom: 24 }]}>{dish.Description || t('noDescription')}</Text>
    <Text style={s.h2}>{t('photos')}</Text>
    {dish.DishImage.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 22 }}>
      {dish.DishImage.map((image, index) => <View key={`${image.ImageUrl}-${index}`} style={{ width: 260, marginRight: 12 }}>
        <Photo uri={image.ImageUrl} /><Button label={t(image.IsThumbnail ? 'thumbnail' : 'makeCover')} secondary disabled={busy || image.IsThumbnail}
          onPress={() => cover(index)} style={{ marginTop: 10 }} />
      </View>)}
    </ScrollView> : <Photo />}
    <View style={[s.row, { marginTop: 20 }]}><Button label={t('edit')} onPress={() => navigate('form', id)} disabled={busy} style={{ flex: 1 }} />
      <Button label={t('delete')} danger disabled={busy} onPress={() => setConfirm(true)} style={{ flex: 1 }} /></View>
    <Confirm item={confirm ? dish : null} busy={busy} onCancel={() => setConfirm(false)} onConfirm={remove} />
  </ScrollView>;
}

export function DishForm({ id, navigate, goBack }) {
  const { dishes, categories, store, t } = useFood();
  const original = dishes.find(item => item.Id === id);
  const [value, setValue] = useState(() => original ? { ...original, Price: String(original.Price), PreparationTime: String(original.PreparationTime), DishImage: original.DishImage.map(image => ({ ...image })) }
    : { Name: '', Price: '', PreparationTime: '', IsAvailable: true, Description: '', DishCategoryId: '', DishImage: [] });
  const [url, setUrl] = useState(''), [urlError, setUrlError] = useState(''), [errors, setErrors] = useState({}), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const change = (key, next) => { setValue(previous => ({ ...previous, [key]: next })); setErrors(previous => ({ ...previous, [key]: undefined })); };
  if (id && !original) return <View style={s.page}><ErrorText code="notFound" /></View>;
  const save = async () => {
    if (busy) return;
    const next = validateDish(value, categories, dishes, id); setErrors(next); setError('');
    if (Object.keys(next).length) { setError(Object.values(next)[0]); return; }
    setBusy(true); try { await store.saveDish(value, id); goBack(); } catch (err) { setError(err.code); } finally { setBusy(false); }
  };
  const addImage = () => { if (!isUrl(url)) { setUrlError('imageUrlInvalid'); return; }
    change('DishImage', [...value.DishImage, { ImageUrl: url.trim(), IsThumbnail: !value.DishImage.length }]); setUrl(''); setUrlError(''); };
  const removeImage = index => {
    const next = value.DishImage.filter((_, i) => i !== index);
    if (next.length && !next.some(image => image.IsThumbnail)) next[0] = { ...next[0], IsThumbnail: true };
    change('DishImage', next);
  };
  const field = (key, label, props = {}) => <Field label={label} value={value[key]} error={errors[key]} onChangeText={next => change(key, next)} editable={!busy} {...props} />;
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Text style={s.h1}>{t(id ? 'editDish' : 'createDish')}</Text><Text style={[s.muted, { marginVertical: 16 }]}>{t('required')}</Text><ErrorText code={error} />
      {field('Name', `${t('name')} *`)}{field('Price', `${t('price')} *`, { keyboardType: 'numeric' })}
      {field('PreparationTime', `${t('preparation')} *`, { keyboardType: 'decimal-pad' })}
      <Select label={`${t('category')} *`} value={value.DishCategoryId} onChange={next => change('DishCategoryId', next)}
        items={[{ value: '', label: t('selectCategory') }, ...categories.map(item => ({ value: item.Id, label: item.Name }))]} />
      {errors.DishCategoryId && <ErrorText code={errors.DishCategoryId} />}
      {!categories.length && <Button label={t('categories')} onPress={() => navigate('categories')} />}
      <View style={[s.row, { justifyContent: 'space-between', marginBottom: 20 }]}><Text style={s.label}>{t('available')}</Text><Switch accessibilityLabel={t('available')} value={value.IsAvailable} disabled={busy} onValueChange={next => change('IsAvailable', next)} trackColor={{ true: C.brand }} /></View>
      {field('Description', t('description'), { multiline: true })}
      <Text style={s.h2}>{t('photos')}</Text>
      <Field label={t('imageUrl')} value={url} error={urlError} onChangeText={next => { setUrl(next); setUrlError(''); }} autoCapitalize="none" autoCorrect={false} keyboardType="url" />
      <Button label={t('addImage')} secondary onPress={addImage} disabled={busy} style={{ marginBottom: 18 }} />
      {value.DishImage.length ? value.DishImage.map((image, index) => <View key={`${image.ImageUrl}-${index}`} style={s.card}>
        <Photo uri={image.ImageUrl} /><View style={[s.row, { marginTop: 12 }]}>
          <Button label={t(image.IsThumbnail ? 'thumbnail' : 'makeCover')} secondary disabled={busy || image.IsThumbnail} style={{ flex: 1 }}
            onPress={() => change('DishImage', value.DishImage.map((item, i) => ({ ...item, IsThumbnail: i === index })))} />
          <Button label={t('removeImage')} danger disabled={busy} onPress={() => removeImage(index)} />
        </View></View>) : <Text style={[s.muted, { marginBottom: 20 }]}>{t('noImages')}</Text>}
      <Button label={t('save')} onPress={save} busy={busy} /><Button label={t('cancel')} secondary onPress={goBack} disabled={busy} style={{ marginTop: 12 }} />
    </ScrollView>
  </KeyboardAvoidingView>;
}

export function CategoryScreen() {
  const { categories, dishes, store, t } = useFood();
  const [form, setForm] = useState(null), [toDelete, setToDelete] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const save = async () => {
    const errors = validateCategory(form); if (Object.keys(errors).length) { setError('nameRequired'); return; }
    setBusy(true); setError(''); try { await store.saveCategory(form, form.Id); setForm(null); } catch (err) { setError(err.code); } finally { setBusy(false); }
  };
  const remove = async () => { setBusy(true); try { await store.remove('DishCategory', toDelete.Id); setToDelete(null); } catch (err) { setError(err.code); setToDelete(null); } finally { setBusy(false); } };
  return <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
    <Text style={[s.h1, { marginBottom: 20 }]}>{t('categories')}</Text><ErrorText code={error} />
    <Button label={t('addCategory')} disabled={busy} onPress={() => { setForm({ Name: '', Description: '' }); setError(''); }} style={{ marginBottom: 18 }} />
    {form && <View style={s.card}>
      <Text style={s.h2}>{t(form.Id ? 'editCategory' : 'addCategory')}</Text>
      <Field label={`${t('name')} *`} value={form.Name} onChangeText={Name => setForm(previous => ({ ...previous, Name }))} editable={!busy} />
      <Field label={t('categoryDescription')} value={form.Description} onChangeText={Description => setForm(previous => ({ ...previous, Description }))} multiline editable={!busy} />
      <Button label={t('save')} busy={busy} onPress={save} /><Button label={t('cancel')} secondary disabled={busy} onPress={() => setForm(null)} style={{ marginTop: 10 }} />
    </View>}
    {!categories.length && <Text style={s.muted}>{t('noCategories')}</Text>}
    {categories.map(item => <View key={item.Id} style={s.card}>
      <Text style={s.h2}>{item.Name}</Text><Text style={s.muted}>{item.Description || t('noDescription')}</Text>
      <Text style={[s.muted, { marginVertical: 12 }]}>{t('categoryCount', { n: dishes.filter(dish => dish.DishCategoryId === item.Id).length })}</Text>
      <View style={s.row}><Button label={t('edit')} secondary disabled={busy} onPress={() => { setError(''); setForm({ ...item }); }} style={{ flex: 1 }} />
        <Button label={t('delete')} danger disabled={busy} onPress={() => setToDelete(item)} style={{ flex: 1 }} /></View>
    </View>)}
    <Confirm item={toDelete} busy={busy} onConfirm={remove} onCancel={() => setToDelete(null)} />
  </ScrollView>;
}

export function SettingsScreen() {
  const { t, store, data } = useFood();
  const [url, setUrl] = useState(data.Settings.BaseUrl), [error, setError] = useState(''), [saved, setSaved] = useState(false), [busy, setBusy] = useState(false);
  const save = async () => { setBusy(true); setError(''); try { await store.setSettings({ BaseUrl: url.trim().replace(/\/+$/, '') }); setSaved(true); } catch (err) { setError(err.code); } finally { setBusy(false); } };
  return <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
    <Text style={s.h1}>{t('settings')}</Text><Text style={[s.muted, { marginVertical: 18 }]}>{t('apiHint')}</Text><ErrorText code={error} />
    <Field label={t('apiUrl')} value={url} onChangeText={next => { setUrl(next); setSaved(false); }} autoCapitalize="none" autoCorrect={false} keyboardType="url" />
    <Button label={t('saveConnection')} onPress={save} busy={busy} />
    <Button label={t('clearConnection')} secondary disabled={busy} onPress={async () => { try { await store.setSettings({ BaseUrl: '' }); setUrl(''); setSaved(true); } catch (err) { setError(err.code); } }} style={{ marginTop: 12 }} />
    {saved && <Text style={[s.muted, { marginVertical: 18 }]}>{t('connectionSaved')}</Text>}
    <View style={[s.card, { marginTop: 24 }]}><Text style={s.h2}>{t('tableNames')}</Text><Text selectable style={s.muted}>{store.codec.table('DishCategory')}{'\n'}{store.codec.table('Dish')}</Text></View>
  </ScrollView>;
}
