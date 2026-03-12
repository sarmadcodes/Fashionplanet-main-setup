import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  StatusBar, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { apiSignup } from '../services/mockApi';
import ThemedStatusModal from '../components/ThemedStatusModal';

const SignupScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Full name is required.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email.trim())) e.email = 'Enter a valid email.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (!agreed) e.agreed = 'You must agree to the terms to continue.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    setError('');
    if (!validate()) return;
    try {
      setLoading(true);
      await apiSignup({ fullName: fullName.trim(), email: email.trim(), password });
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSuccessContinue = () => {
    setShowSuccessModal(false);
      navigation.replace('LoginScreen', {
        prefillEmail: email.trim().toLowerCase(),
        signupSuccessMessage: 'Account created successfully. Please sign in.',
      });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <ThemedStatusModal
        visible={showSuccessModal}
        title="Registration Complete"
        message="Your account has been created successfully. Continue to sign in and start building your wardrobe."
        icon="checkmark-done-circle"
        actionText="Go To Login"
        onAction={handleSignupSuccessContinue}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 30 }}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            Join the Fashion Planet community
          </Text>
        </View>

        {/* Full Name */}
        <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
        <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: fieldErrors.fullName ? '#FF4444' : 'transparent' }]}>
          <Ionicons name="person-outline" size={17} color={theme.secondaryText} style={styles.icon} />
          <TextInput
            style={[styles.inputField, { color: theme.text }]}
            placeholder="Your full name"
            placeholderTextColor={theme.secondaryText}
            value={fullName}
            onChangeText={(t) => { setFullName(t); setFieldErrors(p => ({ ...p, fullName: '' })); }}
          />
        </View>
        {fieldErrors.fullName ? <Text style={styles.fieldError}>{fieldErrors.fullName}</Text> : null}

        {/* Email */}
        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
        <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: fieldErrors.email ? '#FF4444' : 'transparent' }]}>
          <Ionicons name="mail-outline" size={17} color={theme.secondaryText} style={styles.icon} />
          <TextInput
            style={[styles.inputField, { color: theme.text }]}
            placeholder="your@email.com"
            placeholderTextColor={theme.secondaryText}
            value={email}
            onChangeText={(t) => { setEmail(t); setFieldErrors(p => ({ ...p, email: '' })); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

        {/* Password */}
        <Text style={[styles.label, { color: theme.text }]}>Password</Text>
        <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: fieldErrors.password ? '#FF4444' : 'transparent' }]}>
          <Ionicons name="lock-closed-outline" size={17} color={theme.secondaryText} style={styles.icon} />
          <TextInput
            style={[styles.inputField, { color: theme.text }]}
            placeholder="Min. 6 characters"
            placeholderTextColor={theme.secondaryText}
            secureTextEntry={!showPass}
            value={password}
            onChangeText={(t) => { setPassword(t); setFieldErrors(p => ({ ...p, password: '' })); }}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPass(v => !v)} style={{ padding: 4 }}>
            <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={17} color={theme.secondaryText} />
          </TouchableOpacity>
        </View>
        {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => { setAgreed(v => !v); setFieldErrors(p => ({ ...p, agreed: '' })); }}
        >
          <View style={[
            styles.checkbox,
            { borderColor: fieldErrors.agreed ? '#FF4444' : theme.secondaryText },
            agreed && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}>
            {agreed && <Ionicons name="checkmark" size={13} color="#141414" />}
          </View>
          <Text style={[styles.termsText, { color: theme.secondaryText }]}>
            I agree to the{' '}
            <Text style={{ color: theme.primary, fontWeight: '600' }}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={{ color: theme.primary, fontWeight: '600' }}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
        {fieldErrors.agreed ? <Text style={styles.fieldError}>{fieldErrors.agreed}</Text> : null}

        {/* Error */}
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={15} color="#FF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary, opacity: loading ? 0.85 : 1 }]}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.btnRow}>
              <ActivityIndicator size="small" color="#141414" />
              <Text style={styles.btnText}>Creating account...</Text>
            </View>
          ) : (
            <Text style={styles.btnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.secondaryText }]}>or continue with</Text>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
        </View>

        {/* Social */}
        <View style={styles.socialRow}>
          {['logo-google', 'logo-apple', 'logo-facebook'].map((icon) => (
            <TouchableOpacity key={icon} style={[styles.socialBtn, { borderColor: theme.border }]}>
              <Ionicons name={icon} color={theme.secondaryText} size={22} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.secondaryText }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={[styles.footerLink, { color: theme.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container:   { flex: 1, paddingHorizontal: 24 },
  header:      { marginBottom: 28 },
  title:       { fontSize: 26, fontWeight: '700' },
  subtitle:    { fontSize: 14, marginTop: 8 },
  label:       { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 16, letterSpacing: 0.2 },
  inputWrap:   { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1.5 },
  icon:        { marginRight: 10 },
  inputField:  { flex: 1, fontSize: 14 },
  fieldError:  { color: '#FF4444', fontSize: 11, marginTop: 5, marginLeft: 4 },
  termsRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 10 },
  checkbox:    { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  termsText:   { flex: 1, fontSize: 12, lineHeight: 18 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF444415', borderRadius: 10, padding: 12, marginTop: 16, gap: 8 },
  errorText:   { color: '#FF4444', fontSize: 13, flex: 1 },
  btn:         { height: 52, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginTop: 22 },
  btnRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnText:     { color: '#141414', fontSize: 15, fontWeight: '700' },
  divider:     { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line:        { flex: 1, height: 1 },
  dividerText: { paddingHorizontal: 12, fontSize: 12 },
  socialRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  socialBtn:   { width: '30%', height: 48, borderWidth: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  footer:      { flexDirection: 'row', justifyContent: 'center' },
  footerText:  { fontSize: 13 },
  footerLink:  { fontSize: 13, fontWeight: '700' },
});