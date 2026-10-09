import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateMe } from '../../services/userService';
import TextField from '../../components/TextField';
import AppButton from '../../components/AppButton';
import Chip from '../../components/Chip';
import { Banner } from '../../components/Feedback';
import { LANGUAGES, PASSENGER_TYPES } from '../../utils/constants';
import { isPhone } from '../../utils/validators';

const EditProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    passengerType: user?.passengerType || 'adult',
    preferredLanguage: user?.preferredLanguage || 'en',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  };

  const changed = Object.keys(form).some((k) => (form[k] || '') !== (user?.[k] || ''));

  const handleSave = async () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name';
    if (!isPhone(form.phone)) next.phone = 'Enter a valid phone number, e.g. +94 77 123 4567';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setFormError(null);
    try {
      const res = await updateMe({ ...form, name: form.name.trim(), phone: form.phone.trim() });
      await updateUser(res.data.user);
      toast.show('Profile updated', 'success');
      navigation.goBack();
    } catch (e) {
      if (e.errors?.length) setErrors(e.fieldErrors);
      setFormError(e.message);
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {formError ? <Banner type="error" message={formError} /> : null}

        <TextField label="Full name" icon="user" value={form.name} onChangeText={set('name')} error={errors.name} autoComplete="name" />
        <TextField label="Email" icon="mail" value={user?.email} editable={false} hint="Email cannot be changed" />
        <TextField
          label="Mobile number"
          value={form.phone}
          onChangeText={set('phone')}
          error={errors.phone}
          keyboardType="phone-pad"
          placeholder="+94 77 123 4567"
        />

        <Text style={styles.label}>Passenger type</Text>
        <Text style={styles.hint}>Sets the default fare when you buy a ticket</Text>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {PASSENGER_TYPES.map((t) => (
            <Chip key={t.value} label={t.label} sublabel={t.note} selected={form.passengerType === t.value} onPress={() => set('passengerType')(t.value)} />
          ))}
        </View>

        <Text style={styles.label}>Preferred language</Text>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {LANGUAGES.map((l) => (
            <Chip key={l.value} label={l.label} icon="globe" selected={form.preferredLanguage === l.value} onPress={() => set('preferredLanguage')(l.value)} />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton title="Save changes" icon="check" onPress={handleSave} loading={saving} disabled={!changed} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryText,
    marginTop: 4,
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: -2,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});

export default EditProfileScreen;
