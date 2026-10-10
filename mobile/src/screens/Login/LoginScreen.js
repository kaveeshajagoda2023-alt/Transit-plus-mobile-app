import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import TextField from '../../components/TextField';
import AppButton from '../../components/AppButton';
import Icon from '../../components/Icon';
import { Banner } from '../../components/Feedback';
import { isEmail } from '../../utils/validators';

const LoginScreen = ({ navigation }) => {
  const { signIn, sessionMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);

  const validate = () => {
    const next = {};
    if (!isEmail(email)) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Enter your password';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    setFormError(null);
    if (!validate() || loading) return;
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e) {
      if (e.errors?.length) setErrors(e.fieldErrors);
      setFormError(e.message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Icon name="bus" size={34} color={colors.primaryDarkNavy} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Welcome back
          </Text>
          <Text style={styles.subtitle}>Log in to buy tickets and show your QR pass</Text>
        </View>

        <View style={styles.card}>
          {sessionMessage ? <Banner type="warning" message={sessionMessage} /> : null}
          {formError ? <Banner type="error" message={formError} /> : null}

          <TextField
            label="Email"
            icon="mail"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (errors.email) setErrors((e) => ({ ...e, email: null }));
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            placeholder="you@example.com"
          />
          <TextField
            ref={passwordRef}
            label="Password"
            icon="lock"
            secure
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password) setErrors((e) => ({ ...e, password: null }));
            }}
            error={errors.password}
            autoCapitalize="none"
            returnKeyType="go"
            onSubmitEditing={handleLogin}
            placeholder="Your password"
          />

          <AppButton title="Log in" onPress={handleLogin} loading={loading} style={styles.submit} />

          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate('Register')}
            accessibilityRole="link"
            accessibilityLabel="Create a new account"
          >
            <Text style={styles.linkText}>
              New to TransitPulse? <Text style={styles.linkStrong}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.demo}>Demo account: passenger@transitpulse.lk / Passenger@123</Text>
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
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.activeCyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#C6D6E2',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.card,
    padding: 18,
  },
  submit: {
    marginTop: 4,
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
  demo: {
    color: '#C6D6E2',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
  },
});

export default LoginScreen;
