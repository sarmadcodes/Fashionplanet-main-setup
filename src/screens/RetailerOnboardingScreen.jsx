import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import {
  apiFetchMyRetailerApplication,
  apiFetchRetailerProducts,
  apiCreateRetailerProduct,
  apiDeleteRetailerProduct,
  apiSubmitRetailerApplication,
} from '../services/apiService';

const RetailerOnboardingScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [status, setStatus] = useState('not-submitted');
  const [reviewNote, setReviewNote] = useState('');
  const [brandName, setBrandName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [categories, setCategories] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState([]);

  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCurrency, setProductCurrency] = useState('GBP');
  const [productStock, setProductStock] = useState('0');
  const [productImage, setProductImage] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  const load = async () => {
    try {
      const app = await apiFetchMyRetailerApplication();
      if (!app) {
        setStatus('not-submitted');
        return;
      }

      setStatus(app.status || 'pending');
      setReviewNote(app.reviewNote || '');
      setBrandName(app.brandName || '');
      setContactName(app.contactName || '');
      setContactEmail(app.contactEmail || '');
      setContactPhone(app.contactPhone || '');
      setWebsite(app.website || '');
      setCategories(Array.isArray(app.categories) ? app.categories.join(', ') : '');
      setDescription(app.description || '');

      if ((app.status || 'pending') === 'approved') {
        await loadProducts();
      } else {
        setProducts([]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not load retailer application data.');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const rows = await apiFetchRetailerProducts();
      setProducts(Array.isArray(rows) ? rows : []);
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not load retailer products.');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!brandName.trim() || !contactName.trim() || !contactEmail.trim()) {
      Alert.alert('Missing fields', 'Brand name, contact name and contact email are required.');
      return;
    }

    try {
      setSubmitting(true);
      const created = await apiSubmitRetailerApplication({
        brandName,
        contactName,
        contactEmail,
        contactPhone,
        website,
        categories,
        description,
      });
      setStatus(created?.status || 'pending');
      setReviewNote(created?.reviewNote || '');
      Alert.alert('Submitted', 'Retailer application is submitted and pending admin approval.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not submit retailer application.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetProductForm = () => {
    setProductName('');
    setProductCategory('');
    setProductPrice('');
    setProductCurrency('GBP');
    setProductStock('0');
    setProductImage('');
    setProductUrl('');
    setProductDescription('');
  };

  const addProduct = async () => {
    if (!productName.trim() || !productCategory.trim() || !productImage.trim() || !productPrice.trim()) {
      Alert.alert('Missing fields', 'Name, category, price and image URL are required.');
      return;
    }

    try {
      setSavingProduct(true);
      await apiCreateRetailerProduct({
        name: productName,
        category: productCategory,
        price: Number(productPrice),
        currency: productCurrency,
        stock: Number(productStock || 0),
        image: productImage,
        productUrl,
        description: productDescription,
      });

      resetProductForm();
      await loadProducts();
      Alert.alert('Success', 'Product added successfully.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not add product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const removeProduct = async (item) => {
    Alert.alert('Delete product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDeleteRetailerProduct(item.id);
            await loadProducts();
          } catch (error) {
            Alert.alert('Error', error.message || 'Could not delete product.');
          }
        },
      },
    ]);
  };

  const statusColor =
    status === 'approved' ? '#0C8A4E' :
      status === 'rejected' ? '#D22630' :
        '#B08600';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
        <View style={styles.center}> 
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <View style={styles.nav}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>Retailer Onboarding</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <Text style={[styles.statusLabel, { color: theme.secondaryText }]}>Application Status</Text>
          <Text style={[styles.statusValue, { color: statusColor }]}>{String(status).toUpperCase()}</Text>
          {reviewNote ? <Text style={[styles.noteText, { color: theme.secondaryText }]}>{reviewNote}</Text> : null}
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Brand Name *</Text>
        <TextInput style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]} value={brandName} onChangeText={setBrandName} placeholder="Brand name" placeholderTextColor={theme.secondaryText} />

        <Text style={[styles.label, { color: theme.text }]}>Contact Name *</Text>
        <TextInput style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]} value={contactName} onChangeText={setContactName} placeholder="Contact person" placeholderTextColor={theme.secondaryText} />

        <Text style={[styles.label, { color: theme.text }]}>Contact Email *</Text>
        <TextInput style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]} value={contactEmail} onChangeText={setContactEmail} placeholder="contact@brand.com" placeholderTextColor={theme.secondaryText} autoCapitalize="none" keyboardType="email-address" />

        <Text style={[styles.label, { color: theme.text }]}>Contact Phone</Text>
        <TextInput style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]} value={contactPhone} onChangeText={setContactPhone} placeholder="Phone" placeholderTextColor={theme.secondaryText} />

        <Text style={[styles.label, { color: theme.text }]}>Website</Text>
        <TextInput style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]} value={website} onChangeText={setWebsite} placeholder="https://brand.com" placeholderTextColor={theme.secondaryText} autoCapitalize="none" />

        <Text style={[styles.label, { color: theme.text }]}>Categories</Text>
        <TextInput style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]} value={categories} onChangeText={setCategories} placeholder="menswear, womenswear, streetwear" placeholderTextColor={theme.secondaryText} />

        <Text style={[styles.label, { color: theme.text }]}>Business Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your brand and what you want to list in Fashion Planet"
          placeholderTextColor={theme.secondaryText}
          multiline
        />

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary, opacity: submitting ? 0.8 : 1 }]} onPress={submit} disabled={submitting}>
          {submitting ? <ActivityIndicator size="small" color="#141414" /> : <Text style={styles.submitText}>Submit For Approval</Text>}
        </TouchableOpacity>

        {status === 'approved' ? (
          <View style={[styles.productsSection, { borderColor: theme.border, backgroundColor: theme.card }]}> 
            <Text style={[styles.productsHeading, { color: theme.text }]}>Brand Products</Text>
            <Text style={[styles.productsSub, { color: theme.secondaryText }]}>Add your products so users can discover your brand on Home.</Text>

            <Text style={[styles.label, { color: theme.text }]}>Product Name *</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]} value={productName} onChangeText={setProductName} placeholder="Product name" placeholderTextColor={theme.secondaryText} />

            <Text style={[styles.label, { color: theme.text }]}>Category *</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]} value={productCategory} onChangeText={setProductCategory} placeholder="e.g. Jackets" placeholderTextColor={theme.secondaryText} />

            <View style={styles.rowWrap}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.text }]}>Price *</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]} value={productPrice} onChangeText={setProductPrice} placeholder="49.99" placeholderTextColor={theme.secondaryText} keyboardType="decimal-pad" />
              </View>
              <View style={{ width: 110 }}>
                <Text style={[styles.label, { color: theme.text }]}>Currency</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]} value={productCurrency} onChangeText={setProductCurrency} placeholder="GBP" placeholderTextColor={theme.secondaryText} autoCapitalize="characters" />
              </View>
              <View style={{ width: 90 }}>
                <Text style={[styles.label, { color: theme.text }]}>Stock</Text>
                <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]} value={productStock} onChangeText={setProductStock} placeholder="0" placeholderTextColor={theme.secondaryText} keyboardType="number-pad" />
              </View>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Image URL *</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]} value={productImage} onChangeText={setProductImage} placeholder="https://..." placeholderTextColor={theme.secondaryText} autoCapitalize="none" />

            <Text style={[styles.label, { color: theme.text }]}>Product Link</Text>
            <TextInput style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]} value={productUrl} onChangeText={setProductUrl} placeholder="https://store.com/product" placeholderTextColor={theme.secondaryText} autoCapitalize="none" />

            <Text style={[styles.label, { color: theme.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              value={productDescription}
              onChangeText={setProductDescription}
              placeholder="Short product description"
              placeholderTextColor={theme.secondaryText}
              multiline
            />

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary, opacity: savingProduct ? 0.8 : 1 }]} onPress={addProduct} disabled={savingProduct}>
              {savingProduct ? <ActivityIndicator size="small" color="#141414" /> : <Text style={styles.submitText}>Add Product</Text>}
            </TouchableOpacity>

            <Text style={[styles.productsHeading, { color: theme.text, marginTop: 22 }]}>My Products</Text>

            {loadingProducts ? (
              <View style={styles.center}><ActivityIndicator size="small" color={theme.primary} /></View>
            ) : products.length === 0 ? (
              <Text style={[styles.noteText, { color: theme.secondaryText }]}>No products added yet.</Text>
            ) : (
              products.map((item) => (
                <View key={item.id} style={[styles.productRow, { borderColor: theme.border }]}> 
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.productTitle, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.noteText, { color: theme.secondaryText }]}>{item.brandName} • {item.category}</Text>
                    <Text style={[styles.noteText, { color: theme.secondaryText }]}>{item.currency} {Number(item.price || 0).toFixed(2)} • Stock {item.stock}</Text>
                  </View>
                  <TouchableOpacity style={[styles.deleteBtn, { borderColor: '#D22630' }]} onPress={() => removeProduct(item)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RetailerOnboardingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: 16, fontWeight: '700' },
  statusCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 18 },
  statusLabel: { fontSize: 12, fontWeight: '700' },
  statusValue: { fontSize: 16, fontWeight: '800', marginTop: 5 },
  noteText: { fontSize: 12, marginTop: 8, lineHeight: 17 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 46, fontSize: 14 },
  textArea: { height: 110, textAlignVertical: 'top', paddingVertical: 10 },
  submitBtn: { marginTop: 22, height: 50, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#141414', fontSize: 14, fontWeight: '800' },
  productsSection: { marginTop: 24, borderWidth: 1, borderRadius: 14, padding: 14 },
  productsHeading: { fontSize: 16, fontWeight: '800' },
  productsSub: { fontSize: 12, marginTop: 6, lineHeight: 17 },
  rowWrap: { flexDirection: 'row', gap: 8 },
  productRow: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12, flexDirection: 'row', gap: 10, alignItems: 'center' },
  productTitle: { fontSize: 14, fontWeight: '700' },
  deleteBtn: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8 },
  deleteText: { color: '#D22630', fontSize: 12, fontWeight: '700' },
});
