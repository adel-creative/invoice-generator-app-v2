import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Send, Download, Eye, Trash2, 
  User, Settings, LogOut, CreditCard, CheckCircle,
  AlertCircle, Menu, X, Globe, DollarSign, Mail,
  Calendar, TrendingUp, Receipt, Lock, Unlock,
  Star, Crown, Zap, Users, Shield, Bell
} from 'lucide-react';


// في الإنتاج على Vercel، سيتم استبدالها بالقيم من Environment Variables
const API_BASE_URL = 'https://adel-creative-invoice-api.hf.space';
const APP_VERSION = '1.0.0';

const InvoiceGeneratorApp = () => {
  // حالة التطبيق الرئيسية
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'ar';
  });
  const [userStats, setUserStats] = useState(null);

  // نماذج المصادقة
  const [authForm, setAuthForm] = useState({
    email: '',
    username: '',
    password: '',
    company_name: '',
    full_name: '',
    phone: '',
    address: ''
  });

  // نموذج الفاتورة
  const [invoiceForm, setInvoiceForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    language: 'ar',
currency: 'USD',
    items: [{ name: '', description: '', quantity: 1, price: 0 }],
    tax_rate: 20,
    discount_rate: 0,
    notes: ''
  });

  // حفظ اللغة في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // حفظ واستعادة الجلسة
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
      loadUserProfile(savedToken);
      loadUserStats(savedToken);
      loadInvoices(savedToken);
    }
  }, []);

  const currencies = ['MAD', 'USD', 'EUR', 'SAR', 'AED', 'GBP', 'EGP'];
  const languages = ['ar', 'en', 'fr'];

  // خطط الباقات - متوافقة مع الـ API
  // ملاحظة: الحدود والأسعار يجب أن تأتي من الـ Backend API
  // هذه قيم افتراضية للعرض فقط، يمكن تحديثها من خلال userStats
  const subscriptionPlans = {
    free: {
      name: 'مجاني',
      name_en: 'Free',
      price: 0,
      invoices_limit: 10,
      emails_daily_limit: 5,
      features: ['10 فواتير شهرياً', '5 إيميلات يومياً', 'دعم العملات الأساسية', 'PDFs احترافية'],
      features_en: ['10 invoices monthly', '5 daily emails', 'Basic currency support', 'Professional PDFs'],
      color: 'gray'
    },
    basic: {
      name: 'أساسي',
      name_en: 'Basic',
      price: 9.99,
      invoices_limit: 100,
      emails_daily_limit: 50,
      features: ['100 فاتورة شهرياً', '50 إيميل يومياً', '7 عملات مدعومة', 'دعم فني عبر البريد'],
      features_en: ['100 invoices monthly', '50 daily emails', '7 currencies support', 'Email support'],
      color: 'blue'
    },
    pro: {
      name: 'محترف',
      name_en: 'Pro',
      price: 19.99,
      invoices_limit: 500,
      emails_daily_limit: 200,
      features: ['500 فاتورة شهرياً', '200 إيميل يومياً', 'فواتير ثنائية اللغة', 'دعم فني متميز'],
      features_en: ['500 invoices monthly', '200 daily emails', 'Bilingual invoices', 'Priority support'],
      color: 'purple'
    },
    enterprise: {
      name: 'شركات',
      name_en: 'Enterprise',
      price: 39.99,
      invoices_limit: 2000,
      emails_daily_limit: 1000,
      features: ['2000 فاتورة شهرياً', '1000 إيميل يومياً', 'API مخصص', 'دعم فني 24/7'],
      features_en: ['2000 invoices monthly', '1000 daily emails', 'Custom API access', '24/7 support'],
      color: 'orange'
    }
  };

  const translations = {
    ar: {
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      companyName: 'اسم الشركة',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      address: 'العنوان',
      dashboard: 'لوحة التحكم',
      newInvoice: 'فاتورة جديدة',
      myInvoices: 'فواتيري',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
      totalInvoices: 'إجمالي الفواتير',
      totalRevenue: 'إجمالي الإيرادات',
      pendingPayments: 'مدفوعات معلقة',
      createInvoice: 'إنشاء فاتورة',
      clientName: 'اسم العميل',
      clientEmail: 'بريد العميل',
      clientPhone: 'هاتف العميل',
      currency: 'العملة',
      taxRate: 'نسبة الضريبة (%)',
      discountRate: 'نسبة الخصم (%)',
      itemName: 'اسم الخدمة/المنتج',
      description: 'الوصف',
      quantity: 'الكمية',
      price: 'السعر',
      addItem: 'إضافة عنصر',
      generate: 'إنشاء الفاتورة',
      send: 'إرسال',
      download: 'تحميل',
      view: 'عرض',
      delete: 'حذف',
      notes: 'ملاحظات',
      payment: 'الدفع',
      payNow: 'ادفع الآن',
      status: 'الحالة',
      paid: 'مدفوعة',
      unpaid: 'غير مدفوعة',
      usageStats: 'إحصائيات الاستخدام',
      plan: 'الباقة',
      upgrade: 'ترقية',
      invoicesUsed: 'الفواتير المستخدمة',
      emailsUsed: 'الإيميلات المرسلة',
      remaining: 'المتبقي',
      unlimited: 'غير محدود',
      subscription: 'الباقة',
      features: 'الميزات',
      currentPlan: 'الباقة الحالية',
      upgradePlan: 'ترقية الباقة',
      refresh: 'تحديث',
      invoiceLanguage: 'لغة الفاتورة',
      invoiceItems: 'بنود الفاتورة',
      total: 'الإجمالي',
      profileInfo: 'معلومات الملف الشخصي',
      subscriptionSettings: 'إعدادات الباقة',
      languageSettings: 'إعدادات اللغة',
      recentInvoices: 'آخر الفواتير',
      noInvoices: 'لا توجد فواتير بعد',
      upgradePlanMessage: 'قم بترقية باقتك!',
      upgradeDescription: 'احصل على ميزات أكثر ومعدلات استخدام أعلى',
      choosePlan: 'اختر الباقة المناسبة لاحتياجاتك واستمتع بميزات إضافية',
      perMonth: 'درهم/شهرياً',
      chooseThisPlan: 'اختر الباقة',
      invoiceLimitExceeded: 'لقد تجاوزت الحد المسموح للفواتير. يرجى ترقية باقتك.',
      emailLimitExceeded: 'لقد تجاوزت الحد اليومي للإيميلات. يرجى ترقية باقتك.',
      welcomeBack: 'مرحباً بك!',
      registrationSuccess: 'تم التسجيل بنجاح!',
      invoiceCreated: 'تم إنشاء الفاتورة بنجاح!',
      invoiceSent: 'تم إرسال الفاتورة بنجاح!',
      networkError: 'خطأ في الاتصال',
      loginFailed: 'فشل تسجيل الدخول',
      registrationFailed: 'فشل التسجيل',
      noAccount: 'ليس لديك حساب؟ سجل الآن',
      haveAccount: 'لديك حساب؟ سجل دخول',
      professionalInvoiceSystem: 'نظام إدارة الفواتير الاحترافي'
    },
    en: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      username: 'Username',
      password: 'Password',
      companyName: 'Company Name',
      fullName: 'Full Name',
      phone: 'Phone',
      address: 'Address',
      dashboard: 'Dashboard',
      newInvoice: 'New Invoice',
      myInvoices: 'My Invoices',
      settings: 'Settings',
      logout: 'Logout',
      totalInvoices: 'Total Invoices',
      totalRevenue: 'Total Revenue',
      pendingPayments: 'Pending Payments',
      createInvoice: 'Create Invoice',
      clientName: 'Client Name',
      clientEmail: 'Client Email',
      clientPhone: 'Client Phone',
      currency: 'Currency',
      taxRate: 'Tax Rate (%)',
      discountRate: 'Discount Rate (%)',
      itemName: 'Item Name',
      description: 'Description',
      quantity: 'Quantity',
      price: 'Price',
      addItem: 'Add Item',
      generate: 'Generate Invoice',
      send: 'Send',
      download: 'Download',
      view: 'View',
      delete: 'Delete',
      notes: 'Notes',
      payment: 'Payment',
      payNow: 'Pay Now',
      status: 'Status',
      paid: 'Paid',
      unpaid: 'Unpaid',
      usageStats: 'Usage Statistics',
      plan: 'Plan',
      upgrade: 'Upgrade',
      invoicesUsed: 'Invoices Used',
      emailsUsed: 'Emails Sent',
      remaining: 'Remaining',
      unlimited: 'Unlimited',
      subscription: 'Subscription',
      features: 'Features',
      currentPlan: 'Current Plan',
      upgradePlan: 'Upgrade Plan',
      refresh: 'Refresh',
      invoiceLanguage: 'Invoice Language',
      invoiceItems: 'Invoice Items',
      total: 'Total',
      profileInfo: 'Profile Information',
      subscriptionSettings: 'Subscription Settings',
      languageSettings: 'Language Settings',
      recentInvoices: 'Recent Invoices',
      noInvoices: 'No invoices yet',
      upgradePlanMessage: 'Upgrade Your Plan!',
      upgradeDescription: 'Get more features and higher usage limits',
      choosePlan: 'Choose the plan that fits your needs and enjoy additional features',
      perMonth: 'MAD/month',
      chooseThisPlan: 'Choose Plan',
      invoiceLimitExceeded: 'You have exceeded your invoice limit. Please upgrade your plan.',
      emailLimitExceeded: 'You have exceeded your daily email limit. Please upgrade your plan.',
      welcomeBack: 'Welcome!',
      registrationSuccess: 'Registration successful!',
      invoiceCreated: 'Invoice created successfully!',
      invoiceSent: 'Invoice sent successfully!',
      networkError: 'Network error',
      loginFailed: 'Login failed',
      registrationFailed: 'Registration failed',
      noAccount: "Don't have an account? Register",
      haveAccount: 'Have an account? Login',
      professionalInvoiceSystem: 'Professional Invoice Management'
    }
  };

  const t = translations[language];

  // عرض الرسائل
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // دوال API محسّنة مع معالجة أخطاء أفضل
  const apiRequest = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Request failed');
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(authForm)
    });
    
    if (result.success) {
      showMessage('success', t.registrationSuccess);
      setCurrentPage('login');
    } else {
      showMessage('error', result.error || t.registrationFailed);
    }
    
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: authForm.username,
        password: authForm.password
      })
    });
    
    if (result.success) {
      const { access_token } = result.data;
      setToken(access_token);
      
      // حفظ في localStorage
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('user', JSON.stringify({ username: authForm.username }));
      
      setUser({ username: authForm.username });
      setCurrentPage('dashboard');
      showMessage('success', t.welcomeBack);
      
      loadUserProfile(access_token);
      loadUserStats(access_token);
      loadInvoices(access_token);
    } else {
      showMessage('error', result.error || t.loginFailed);
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setCurrentPage('login');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const loadUserProfile = async (authToken) => {
    const result = await apiRequest('/users/me', {
      headers: { 'Authorization': `Bearer ${authToken || token}` }
    });
    
    if (result.success) {
      setUser(result.data);
      localStorage.setItem('user', JSON.stringify(result.data));
    }
  };

  const loadUserStats = async (authToken) => {
    const result = await apiRequest('/users/stats', {
      headers: { 'Authorization': `Bearer ${authToken || token}` }
    });
    
    if (result.success) {
      setUserStats(result.data);
    }
  };

  const loadInvoices = async (authToken) => {
    const result = await apiRequest('/invoices/', {
      headers: { 'Authorization': `Bearer ${authToken || token}` }
    });
    
    if (result.success) {
      setInvoices(result.data);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    
    if (userStats && userStats.invoices_used >= userStats.invoices_limit) {
      showMessage('error', t.invoiceLimitExceeded);
      return;
    }

    setLoading(true);
    
    const result = await apiRequest('/invoices/generate', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(invoiceForm)
    });
    
    if (result.success) {
      showMessage('success', t.invoiceCreated);
      loadInvoices(token);
      loadUserStats(token);
      setCurrentPage('invoices');
      resetInvoiceForm();
    } else {
      showMessage('error', result.error);
    }
    
    setLoading(false);
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({
      client_name: '',
      client_email: '',
      client_phone: '',
      language: 'ar',
      currency: 'MAD',
      items: [{ name: '', description: '', quantity: 1, price: 0 }],
      tax_rate: 20,
      discount_rate: 0,
      notes: ''
    });
  };

  const handleSendEmail = async (invoiceId) => {
    if (userStats && userStats.emails_used_today >= userStats.emails_daily_limit) {
      showMessage('error', t.emailLimitExceeded);
      return;
    }

    setLoading(true);
    
    const result = await apiRequest(`/invoices/${invoiceId}/send-email`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (result.success) {
      showMessage('success', t.invoiceSent);
      loadUserStats(token);
    } else {
      showMessage('error', result.error);
    }
    
    setLoading(false);
  };

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { name: '', description: '', quantity: 1, price: 0 }]
    });
  };

  const updateInvoiceItem = (index, field, value) => {
    const newItems = [...invoiceForm.items];
    newItems[index][field] = value;
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const removeInvoiceItem = (index) => {
    const newItems = invoiceForm.items.filter((_, i) => i !== index);
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    );
    const discount = subtotal * (invoiceForm.discount_rate / 100);
    const tax = (subtotal - discount) * (invoiceForm.tax_rate / 100);
    return (subtotal - discount + tax).toFixed(2);
  };

  // صفحة تسجيل الدخول
  const LoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-lg bg-opacity-95">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FileText className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentPage === 'login' ? t.login : t.register}
            </h1>
            <p className="text-gray-600 mt-2">{t.professionalInvoiceSystem}</p>
          </div>

          <form onSubmit={currentPage === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {currentPage === 'register' && (
              <>
                <input
                  type="email"
                  placeholder={t.email}
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                <input
                  type="text"
                  placeholder={t.fullName}
                  value={authForm.full_name}
                  onChange={(e) => setAuthForm({ ...authForm, full_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <input
                  type="text"
                  placeholder={t.companyName}
                  value={authForm.company_name}
                  onChange={(e) => setAuthForm({ ...authForm, company_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </>
            )}
            
            <input
              type="text"
              placeholder={t.username}
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
            
            <input
              type="password"
              placeholder={t.password}
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
              minLength="8"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? '...' : (currentPage === 'login' ? t.login : t.register)}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              onClick={() => setCurrentPage(currentPage === 'login' ? 'register' : 'login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {currentPage === 'login' ? t.noAccount : t.haveAccount}
            </button>
            
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center justify-center gap-2 mx-auto text-gray-600 hover:text-gray-800"
            >
              <Globe size={16} />
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // إحصائيات الاستخدام - تحديث ديناميكي من الـ API
  const UsageStatistics = () => {
    if (!userStats) return null;

    // استخدام البيانات الفعلية من الـ API
    const currentPlan = subscriptionPlans[userStats.plan_type] || subscriptionPlans.free;
    
    // الحدود الفعلية من الـ API (تفضل على القيم الافتراضية)
    const invoicesLimit = userStats.invoices_limit || currentPlan.invoices_limit;
    const emailsLimit = userStats.emails_daily_limit || currentPlan.emails_daily_limit;
    
    const invoicesProgress = (userStats.invoices_used / invoicesLimit) * 100;
    const emailsProgress = (userStats.emails_used_today / emailsLimit) * 100;

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">{t.usageStats}</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentPlan.color === 'gray' ? 'bg-gray-100 text-gray-700' :
            currentPlan.color === 'blue' ? 'bg-blue-100 text-blue-700' :
            currentPlan.color === 'purple' ? 'bg-purple-100 text-purple-700' :
            'bg-orange-100 text-orange-700'
          }`}>
            {language === 'ar' ? currentPlan.name : currentPlan.name_en}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">{t.invoicesUsed}</span>
              <span className="font-semibold">
                {userStats.invoices_used} / {invoicesLimit === 9999 ? t.unlimited : invoicesLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  invoicesProgress > 80 ? 'bg-red-500' : 
                  invoicesProgress > 60 ? 'bg-orange-500' : 
                  currentPlan.color === 'blue' ? 'bg-blue-500' :
                  currentPlan.color === 'purple' ? 'bg-purple-500' :
                  currentPlan.color === 'orange' ? 'bg-orange-500' : 'bg-gray-500'
                }`}
                style={{ width: `${Math.min(invoicesProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">{t.emailsUsed}</span>
              <span className="font-semibold">
                {userStats.emails_used_today} / {emailsLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  emailsProgress > 80 ? 'bg-red-500' : 
                  emailsProgress > 60 ? 'bg-orange-500' : 
                  currentPlan.color === 'blue' ? 'bg-blue-500' :
                  currentPlan.color === 'purple' ? 'bg-purple-500' :
                  currentPlan.color === 'orange' ? 'bg-orange-500' : 'bg-gray-500'
                }`}
                style={{ width: `${Math.min(emailsProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {userStats.plan_type === 'free' && (
          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-orange-800">{t.upgradePlanMessage}</h3>
                <p className="text-orange-600 text-sm">{t.upgradeDescription}</p>
              </div>
              <button
                onClick={() => setCurrentPage('subscription')}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                {t.upgrade}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // لوحة التحكم
  const DashboardPage = () => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paidInvoices = invoices.filter(inv => inv.payment_status === 'paid').length;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">{t.dashboard}</h1>
          <button
            onClick={() => setCurrentPage('create')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
          >
            <Plus size={20} />
            {t.newInvoice}
          </button>
        </div>

        <UsageStatistics />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Receipt size={32} />
              <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm">
                {invoices.length}
              </div>
            </div>
            <h3 className="text-lg opacity-90">{t.totalInvoices}</h3>
            <p className="text-3xl font-bold mt-2">{invoices.length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <DollarSign size={32} />
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg opacity-90">{t.totalRevenue}</h3>
            <p className="text-3xl font-bold mt-2">{totalRevenue.toFixed(2)} MAD</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <CreditCard size={32} />
              <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm">
                {invoices.length - paidInvoices}
              </div>
            </div>
            <h3 className="text-lg opacity-90">{t.pendingPayments}</h3>
            <p className="text-3xl font-bold mt-2">{invoices.length - paidInvoices}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{t.recentInvoices}</h2>
          <div className="space-y-3">
            {invoices.slice(0, 5).map((invoice, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{invoice.client_name}</p>
                    <p className="text-sm text-gray-600">{invoice.invoice_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{invoice.total} {invoice.currency}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    invoice.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {invoice.payment_status === 'paid' ? t.paid : t.unpaid}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // صفحة إنشاء فاتورة
  const CreateInvoicePage = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t.createInvoice}</h1>
      
      <UsageStatistics />

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.clientName}</label>
            <input
              type="text"
              value={invoiceForm.client_name}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, client_name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.clientEmail}</label>
            <input
              type="email"
              value={invoiceForm.client_email}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, client_email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.clientPhone}</label>
            <input
              type="tel"
              value={invoiceForm.client_phone}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, client_phone: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.currency}</label>
            <select
              value={invoiceForm.currency}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, currency: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.invoiceLanguage}</label>
            <select
              value={invoiceForm.language}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, language: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : 'Français'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.taxRate}</label>
            <input
              type="number"
              value={invoiceForm.tax_rate}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, tax_rate: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.discountRate}</label>
            <input
              type="number"
              value={invoiceForm.discount_rate}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, discount_rate: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">{t.invoiceItems}</h3>
          
          {invoiceForm.items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder={t.itemName}
                value={item.name}
                onChange={(e) => updateInvoiceItem(index, 'name', e.target.value)}
                className="px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder={t.description}
                value={item.description}
                onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                className="px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder={t.quantity}
                value={item.quantity}
                onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value))}
                className="px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
              <input
                type="number"
                placeholder={t.price}
                value={item.price}
                onChange={(e) => updateInvoiceItem(index, 'price', parseFloat(e.target.value))}
                className="px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
              {invoiceForm.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInvoiceItem(index)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition flex items-center justify-center"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addInvoiceItem}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
          >
            <Plus size={18} />
            {t.addItem}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.notes}</label>
          <textarea
            value={invoiceForm.notes}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-2xl font-bold text-gray-800">
            {t.total}: {calculateTotal()} {invoiceForm.currency}
          </div>
          <button
            onClick={handleCreateInvoice}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            <FileText size={20} />
            {loading ? '...' : t.generate}
          </button>
        </div>
      </div>
    </div>
  );

  // صفحة الباقات
  const SubscriptionPage = () => (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.subscription}</h1>
      <p className="text-gray-600 mb-8">{t.choosePlan}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries(subscriptionPlans).map(([planKey, plan]) => (
          <div key={planKey} className={`bg-white rounded-2xl shadow-lg border-2 ${
            userStats?.plan_type === planKey 
              ? plan.color === 'gray' ? 'border-gray-500 ring-2 ring-gray-200' :
                plan.color === 'blue' ? 'border-blue-500 ring-2 ring-blue-200' :
                plan.color === 'purple' ? 'border-purple-500 ring-2 ring-purple-200' :
                'border-orange-500 ring-2 ring-orange-200'
              : 'border-gray-200'
          } hover:shadow-xl transition`}>
            <div className={`p-6 text-white rounded-t-2xl ${
              plan.color === 'gray' ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
              plan.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
              plan.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
              'bg-gradient-to-r from-orange-500 to-orange-600'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{language === 'ar' ? plan.name : plan.name_en}</h3>
                {userStats?.plan_type === planKey && (
                  <CheckCircle className="text-white" size={20} />
                )}
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="ml-2 opacity-80">{t.perMonth}</span>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="space-y-3 mb-6">
                {(language === 'ar' ? plan.features : plan.features_en).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  userStats?.plan_type === planKey
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : plan.color === 'gray' ? 'bg-gray-500 hover:bg-gray-600 text-white' :
                      plan.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                      plan.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600 text-white' :
                      'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
                disabled={userStats?.plan_type === planKey}
              >
                {userStats?.plan_type === planKey ? t.currentPlan : t.chooseThisPlan}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // صفحة الفواتير
  const InvoicesPage = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{t.myInvoices}</h1>
        <div className="flex gap-3">
          <button
            onClick={() => loadInvoices(token)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            {t.refresh}
          </button>
          <button
            onClick={() => setCurrentPage('create')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition"
          >
            <Plus size={16} />
            {t.newInvoice}
          </button>
        </div>
      </div>

      <UsageStatistics />

      <div className="grid grid-cols-1 gap-4">
        {invoices.map((invoice, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{invoice.client_name}</h3>
                <p className="text-gray-600">{invoice.invoice_number}</p>
                <p className="text-sm text-gray-500 mt-1">{invoice.client_email}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{invoice.total} {invoice.currency}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  invoice.payment_status === 'paid' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {invoice.payment_status === 'paid' ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle size={14} /> {t.paid}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <AlertCircle size={14} /> {t.unpaid}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
              <button
                onClick={() => handleSendEmail(invoice.id)}
                disabled={loading || (userStats && userStats.emails_used_today >= userStats.emails_daily_limit)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                {t.send}
              </button>
              
              <a
                href={`${API_BASE_URL}${invoice.pdf_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
              >
                <Download size={16} />
                {t.download}
              </a>

              {invoice.payment_status !== 'paid' && (
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition"
                >
                  <CreditCard size={16} />
                  {t.payNow}
                </button>
              )}
            </div>
          </div>
        ))}

        {invoices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">{t.noInvoices}</p>
            <button
              onClick={() => setCurrentPage('create')}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              {t.createInvoice}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // صفحة الإعدادات
  const SettingsPage = () => (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t.settings}</h1>
      
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">{t.profileInfo}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName}</label>
              <input
                type="text"
                defaultValue={user?.full_name}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.companyName}</label>
              <input
                type="text"
                defaultValue={user?.company_name}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone}</label>
              <input
                type="tel"
                defaultValue={user?.phone}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">{t.subscriptionSettings}</h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">
                  {t.currentPlan}: {userStats && (language === 'ar' 
                    ? subscriptionPlans[userStats.plan_type]?.name 
                    : subscriptionPlans[userStats.plan_type]?.name_en)}
                </h4>
                <p className="text-sm text-gray-600">
                  {userStats && `${userStats.invoices_used} / ${userStats.invoices_limit || subscriptionPlans[userStats.plan_type]?.invoices_limit} ${t.invoicesUsed}`}
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('subscription')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
              >
                {t.upgradePlan}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">{t.languageSettings}</h3>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  );

  // التخطيط الرئيسي
  const MainLayout = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* الشريط الجانبي */}
      <div className={`fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full bg-gradient-to-b from-blue-900 to-purple-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} z-50 shadow-2xl`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 rounded-xl p-2">
                  <FileText size={24} />
                </div>
                <span className="font-bold text-lg">Invoice Pro</span>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: TrendingUp, label: t.dashboard },
              { id: 'create', icon: Plus, label: t.newInvoice },
              { id: 'invoices', icon: FileText, label: t.myInvoices },
              { id: 'subscription', icon: Crown, label: t.subscription },
              { id: 'settings', icon: Settings, label: t.settings }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  currentPage === item.id 
                    ? 'bg-white bg-opacity-20 shadow-lg' 
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500 hover:bg-opacity-20 transition"
            >
              <LogOut size={20} />
              {sidebarOpen && <span>{t.logout}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className={`transition-all duration-300 p-8`} style={{ 
        marginLeft: language === 'ar' ? 0 : (sidebarOpen ? '256px' : '80px'), 
        marginRight: language === 'ar' ? (sidebarOpen ? '256px' : '80px') : 0 
      }}>
        {/* رسالة التنبيه */}
        {message.text && (
          <div className={`fixed top-4 ${language === 'ar' ? 'left-4' : 'right-4'} z-50 px-6 py-4 rounded-lg shadow-lg ${
            message.type === 'success' ? 'bg-green-500' : 
            message.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          } text-white flex items-center gap-3`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'create' && <CreateInvoicePage />}
        {currentPage === 'invoices' && <InvoicesPage />}
        {currentPage === 'subscription' && <SubscriptionPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </div>
    </div>
  );

  // العرض حسب حالة المصادقة
  if (!token) {
    return <LoginPage />;
  }

  return <MainLayout />;
};

export default InvoiceGeneratorApp;