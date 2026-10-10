import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import TextField from '../../components/TextField';
import AppButton from '../../components/AppButton';
import Chip from '../../components/Chip';
import { Banner } from '../../components/Feedback';
import { PASSENGER_TYPES } from '../../utils/constants';
import { isEmail, isPhone, passwordError } from '../../utils/validators';

const RegisterScreen = ({ navigation }) => {
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    passengerType: 'adult',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name';
    if (!isEmail(form.email)) next.email = 'Enter a valid email address';
    if (!isPhone(form.phone)) next.phone = 'Enter a valid phone number, e.g. +94 77 123 4567';
    const pw = passwordError(form.password);
    if (pw) next.password = pw;
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async () => {
    setFormError(null);
    if (!validate() || loading) return;
    setLoading(true);
    try {
      const { confirm, ...payload } = form;
      await signUp({ ...payload, name: payload.name.trim(), email: payload.email.trim() });
    } catch (e) {
      if (e.errors?.length) setErrors(e.fieldErrors);
      setFormError(e.message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title} accessibilityRole="header">
          Create your account
        </Text>
        <Text style={styles.subtitle}>It takes less than a minute</Text>

        <View style={styles.card}>
          {formError ? <Banner type="error" message={formError} /> : null}

          <TextField label="Full name" icon="user" value={form.name} onChangeText={set('name')} error={errors.name} autoComplete="name" placeholder="e.g. Kavindi Perera" />
          <TextField
            label="Email"
            icon="mail"
            value={form.email}
            onChangeText={set('email')}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <TextField
            label="Mobile number (optional)"
            value={form.phone}
            onChangeText={set('phone')}
            error={errors.phone}
            keyboardType="phone-pad"
            placeholder="+94 77 123 4567"
          />
          <TextField
            label="Password"
            icon="lock"
            secure
            value={form.password}
            onChangeText={set('password')}
            error={errors.password}
            hint="At least 8 characters including a number"
            autoCapitalize="none"
          />
          <TextField label="Confirm password" icon="lock" secure value={form.confirm} onChangeText={set('confirm')} error={errors.confirm} autoCapitalize="none" />

          <Text style={styles.label}>Passenger type</Text>
          <Text style={styles.hint}>Used to calculate your default fare. You can change it later.</Text>
          <View style={styles.chips} accessibilityRole="radiogroup">
            {PASSENGER_TYPES.map((t) => (
              <Chip key={t.value} label={t.label} sublabel={t.note} selected={form.passengerType === t.value} onPress={() => set('passengerType')(t.value)} />
            ))}
          </View>

          <AppButton title="Create account" onPress={handleRegister} loading={loading} style={styles.submit} />

          <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()} accessibilityRole="link" accessibilityLabel="Back to log in">
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkStrong}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.primaryDarkNavy,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 12,
  },
  subtitle: {
    color: '#C6D6E2',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 18,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryText,
  },
  hint: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  submit: {
    marginTop: 10,
  },
  link: {
    minHeight: theme.touch,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    color: colors.secondaryText,
    fontSize: 14,
  },
  linkStrong: {
    color: colors.tealText,
    fontWeight: '700',
  },
});

export default RegisterScreen;
