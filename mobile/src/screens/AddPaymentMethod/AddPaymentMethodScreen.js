import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, theme } from '../../theme';
import { useToast } from '../../context/ToastContext';
import { addMethod } from '../../services/paymentService';
import TextField from '../../components/TextField';
import AppButton from '../../components/AppButton';
import Icon from '../../components/Icon';
import { Banner } from '../../components/Feedback';
import { cardBrand, cardErrors, digitsOnly, formatCardNumber, formatExpiry } from '../../utils/validators';

const AddPaymentMethodScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [card, setCard] = useState({ cardNumber: '', expiry: '', cvv: '', holderName: '' });
  const [makeDefault, setMakeDefault] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (field, formatter) => (value) => {
    setCard((c) => ({ ...c, [field]: formatter ? formatter(value) : value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  };

  const handleSave = async () => {
    const found = cardErrors(card);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setFormError(null);
    try {
      const res = await addMethod({ ...card, cardNumber: digitsOnly(card.cardNumber), holderName: card.holderName.trim(), makeDefault });
      toast.show(res.message, 'success');
      navigation.goBack();
    } catch (e) {
      if (e.errors?.length) setErrors(e.fieldErrors);
      setFormError(e.message);
      setSaving(false);
    }
  };

  const brand = digitsOnly(card.cardNumber).length >= 2 ? cardBrand(card.cardNumber) : null;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Live card preview */}
        <View style={styles.preview} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={styles.previewTop}>
            <Icon name="card" size={26} color={colors.activeCyan} />
            <Text style={styles.previewBrand}>{brand || 'CARD'}</Text>
          </View>
          <Text style={styles.previewNumber}>{card.cardNumber || '•••• •••• •••• ••••'}</Text>
          <View style={styles.previewBottom}>
            <Text style={styles.previewText}>{card.holderName || 'NAME ON CARD'}</Text>
            <Text style={styles.previewText}>{card.expiry || 'MM/YY'}</Text>
          </View>
        </View>

        {formError ? <Banner type="error" message={formError} /> : null}

        <TextField
          label="Card number"
          icon="card"
          value={card.cardNumber}
          onChangeText={set('cardNumber', formatCardNumber)}
          error={errors.cardNumber}
          keyboardType="number-pad"
          placeholder="1234 5678 9012 3456"
          maxLength={23}
        />
        <View style={styles.row}>
          <TextField
            label="Expiry (MM/YY)"
            value={card.expiry}
            onChangeText={set('expiry', formatExpiry)}
            error={errors.expiry}
            keyboardType="number-pad"
            placeholder="12/30"
            maxLength={5}
            style={styles.flex}
          />
          <TextField
            label="CVV"
            value={card.cvv}
            onChangeText={set('cvv', (v) => digitsOnly(v).slice(0, 4))}
            error={errors.cvv}
            keyboardType="number-pad"
            placeholder="123"
            secure
            hint="Checked, never stored"
            style={[styles.flex, styles.gapLeft]}
          />
        </View>
        <TextField label="Name on card (optional)" value={card.holderName} onChangeText={set('holderName')} autoCapitalize="characters" placeholder="K PERERA" />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Make this my default card</Text>
          <Switch
            value={makeDefault}
            onValueChange={setMakeDefault}
            trackColor={{ true: colors.tealCyan, false: colors.border }}
            thumbColor={colors.white}
            accessibilityLabel="Make this my default card"
          />
        </View>
        <View style={styles.secure}>
          <Icon name="lock" size={16} color={colors.tealText} />
          <Text style={styles.secureText}>
            We check the card number, expiry and CVV, then keep only the brand and last 4 digits.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppButton title="Save card" icon="check" onPress={handleSave} loading={saving} />
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
  preview: {
    backgroundColor: colors.primaryDarkNavy,
    borderRadius: theme.borderRadius.card,
    padding: 18,
    marginBottom: 18,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewBrand: {
    color: colors.white,
    fontWeight: '800',
    letterSpacing: 1,
  },
  previewNumber: {
    color: colors.white,
    fontSize: 20,
    letterSpacing: 2,
    fontWeight: '600',
    marginVertical: 16,
  },
  previewBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewText: {
    color: '#C6D6E2',
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  gapLeft: {
    marginLeft: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: theme.touch,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
  },
  secure: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tealTint,
    borderRadius: theme.borderRadius.button,
    padding: 12,
    marginTop: 8,
  },
  secureText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: colors.primaryText,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});

export default AddPaymentMethodScreen;
