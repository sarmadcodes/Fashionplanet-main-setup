import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  StyleSheet, View, Text, TextInput,
  TouchableOpacity, StatusBar, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { apiLogin } from '../services/mockApi';

const LoginScreen = ({ navigation, route }) => {
  const { isDark } = useTheme();
  const { login } = useAuth();
  const theme = isDark ? darkTheme : lightTheme;

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (route?.params?.prefillEmail) {
      setEmail(route.params.prefillEmail);
    }
  }, [route?.params?.prefillEmail]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email.trim())) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    setError('');
    if (!validate()) return;
    try {
      setLoading(true);
      const result = await apiLogin({ email: email.trim(), password });
      await login(result.user, result.token || 'mock_token');
      navigation.replace('BottomTabs');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => [
    styles.input,
    { backgroundColor: theme.card, color: theme.text, borderColor: fieldErrors[field] ? '#FF4444' : 'transparent' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            Sign in to continue your style journey
          </Text>
        </View>

        <View style={styles.form}>
          {/* Email */}
          <Text style={[styles.label, { color: theme.text }]}>Email</Text>
          <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: fieldErrors.email ? '#FF4444' : 'transparent' }]}>
            <Ionicons name="mail-outline" size={18} color={theme.secondaryText} style={styles.inputIcon} />
            <TextInput
              style={[styles.inputField, { color: theme.text }]}
              placeholder="your@email.com"
              placeholderTextColor={theme.secondaryText}
              value={email}
              onChangeText={(t) => { setEmail(t); setFieldErrors(p => ({ ...p, email: '' })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

          {/* Password */}
          <Text style={[styles.label, { color: theme.text }]}>Password</Text>
          <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: fieldErrors.password ? '#FF4444' : 'transparent' }]}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.secondaryText} style={styles.inputIcon} />
            <TextInput
              style={[styles.inputField, { color: theme.text }]}
              placeholder="••••••••••••"
              placeholderTextColor={theme.secondaryText}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={(t) => { setPassword(t); setFieldErrors(p => ({ ...p, password: '' })); }}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color={theme.secondaryText} />
            </TouchableOpacity>
          </View>
          {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}

          {/* Global error */}
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color="#FF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {route?.params?.signupSuccessMessage ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#1f9d55" />
              <Text style={styles.successText}>{route.params.signupSuccessMessage}</Text>
            </View>
          ) : null}

          {/* Sign in */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.primary, opacity: loading ? 0.85 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.btnRow}>
                <ActivityIndicator size="small" color="#141414" />
                <Text style={styles.btnText}>Signing in...</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

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

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.secondaryText }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
            <Text style={[styles.footerLink, { color: theme.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container:    { flex: 1, paddingHorizontal: 24 },
  content:      { flex: 1 },
  scrollContent:{ flexGrow: 1, justifyContent: 'center', paddingVertical: 24 },
  header:       { marginBottom: 32 },
  title:        { fontSize: 26, fontWeight: '700', letterSpacing: 0.3 },
  subtitle:     { fontSize: 14, marginTop: 8, lineHeight: 20 },
  form:         { marginBottom: 24 },
  label:        { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 18, letterSpacing: 0.2 },
  inputWrap:    { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1.5 },
  inputIcon:    { marginRight: 10 },
  inputField:   { flex: 1, fontSize: 14 },
  eyeBtn:       { padding: 4 },
  fieldError:   { color: '#FF4444', fontSize: 11, marginTop: 5, marginLeft: 4 },
  errorBanner:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF444415', borderRadius: 10, padding: 12, marginTop: 16, gap: 8 },
  errorText:    { color: '#FF4444', fontSize: 13, flex: 1 },
  successBanner:{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f9d5520', borderRadius: 10, padding: 12, marginTop: 12, gap: 8 },
  successText:  { color: '#1f9d55', fontSize: 13, flex: 1 },
  btn:          { height: 52, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  btnRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  btnText:      { color: '#141414', fontSize: 15, fontWeight: '700' },
  divider:      { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  line:         { flex: 1, height: 1 },
  dividerText:  { paddingHorizontal: 12, fontSize: 12 },
  socialRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  socialBtn:    { width: '30%', height: 48, borderWidth: 1, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  footer:       { flexDirection: 'row', justifyContent: 'center' },
  footerText:   { fontSize: 13 },
  footerLink:   { fontSize: 13, fontWeight: '700' },
});