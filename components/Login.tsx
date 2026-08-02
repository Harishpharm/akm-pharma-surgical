import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { UserRole } from '../types';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.CUSTOMER);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Customer login inputs
  const [loginId, setLoginId] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  
  // Customer register inputs
  const [regLoginId, setRegLoginId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPharmacy, setRegPharmacy] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  // Admin inputs
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const context = useContext(AppContext);
  if (!context) return null;
  const { login } = context;

  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : 'https://akm-pharma-surgical-api.onrender.com';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (activeTab === UserRole.CUSTOMER) {
      const hasAnyIdentifier = loginId.trim() || emailAddress.trim() || mobileNumber.trim();
      if (!hasAnyIdentifier) {
        setError('Please enter at least one field: User ID, Email Address, or Mobile Number.');
        return;
      }
      if (!customerPassword) {
        setError('Please enter your account password.');
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/customers/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            identifier: loginId.trim() || emailAddress.trim() || mobileNumber.trim(),
            loginId: loginId.trim(),
            email: emailAddress.trim(),
            phone: mobileNumber.trim(),
            password: customerPassword 
          })
        });
        const result = await res.json();
        if (res.ok && result.success) {
          login({ 
              name: result.user.name, 
              role: UserRole.CUSTOMER,
              loginId: result.user.loginId,
              outstandingAmount: result.user.outstandingAmount,
              creditStatus: result.user.creditStatus,
              pharmacyName: result.user.pharmacyName || '',
              phone: result.user.phone || '',
          });
        } else {
          setError(result.message || 'Verification failed. Please contact AKM Office.');
        }
      } catch (err) {
        setError('Connection error. Please check if the server is running.');
      }
    } else {
      if (!ownerUsername.trim() || !ownerPassword) {
        setError('Please enter both Admin Username and Password.');
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: ownerUsername, password: ownerPassword })
        });
        const result = await res.json();
        if (res.ok && result.success) {
          login({ name: result.user.name, role: UserRole.OWNER });
        } else {
          setError(result.message || 'Incorrect administrator credentials.');
        }
      } catch (err) {
        setError('Connection error. Please check if the server is running.');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regLoginId.trim()) { setError('User ID is required.'); return; }
    if (!regName.trim()) { setError('Full Name is required.'); return; }
    if (!regPassword) { setError('Password is required.'); return; }
    if (regPassword.length < 4) { setError('Password must be at least 4 characters.'); return; }
    if (regPassword !== regConfirmPassword) { setError('Passwords do not match.'); return; }

    try {
      const res = await fetch(`${API_URL}/api/customers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: regLoginId.trim(),
          name: regName.trim(),
          email: regEmail.trim() || null,
          phone: regPhone.trim() || null,
          pharmacyName: regPharmacy.trim() || null,
          password: regPassword
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg('Account created successfully! You can now log in.');
        setIsRegisterMode(false);
        setLoginId(regLoginId.trim());
        setCustomerPassword('');
        // Clear registration fields
        setRegLoginId(''); setRegName(''); setRegEmail(''); setRegPhone(''); setRegPharmacy(''); setRegPassword(''); setRegConfirmPassword('');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please check if the server is running.');
    }
  };

  const inputClass = "w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-blue-600/30 transition-all font-bold text-slate-800 text-xs";
  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 block";

  return (
    <div className="min-h-screen bg-brand-grey flex items-center justify-center p-6 pt-32 pb-20">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-elevated overflow-hidden border border-brand-border">
        
        {/* Header */}
        <div className="p-12 text-center bg-slate-50/50 border-b border-brand-border flex flex-col items-center">
          <div className="mb-4">
            <h2 className="text-3xl font-black text-[#0d47a1] tracking-tighter uppercase leading-none">AKM</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Pharma and Surgicals</p>
          </div>
          <h1 className="text-lg font-black text-brand-dark tracking-tight uppercase">
            {activeTab === UserRole.OWNER ? 'Administrator Login' : (isRegisterMode ? 'Create Account' : 'Distributor Login')}
          </h1>
          <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest mt-1.5">
            {activeTab === UserRole.OWNER ? 'Management System Authentication' : (isRegisterMode ? 'New Customer Registration' : 'Distribution Portal Authentication')}
          </p>
        </div>

        <div className="p-10">
          
          {/* Tabs Selector Toggle */}
          <div className="flex p-1.5 bg-slate-100/50 border border-slate-100 rounded-2xl mb-10">
            <button 
              onClick={() => { setActiveTab(UserRole.CUSTOMER); setIsRegisterMode(false); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === UserRole.CUSTOMER ? 'bg-white shadow-md text-brand-dark' : 'text-slate-400 hover:text-slate-600'}`}
            >
              CUSTOMER ACCESS
            </button>
            <button 
              onClick={() => { setActiveTab(UserRole.OWNER); setIsRegisterMode(false); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === UserRole.OWNER ? 'bg-white shadow-md text-brand-dark' : 'text-slate-400 hover:text-slate-600'}`}
            >
              ADMIN ACCESS
            </button>
          </div>

          {/* Success message */}
          {successMsg && <p className="text-green-700 text-[10px] font-bold bg-green-50 p-4 rounded-2xl text-center uppercase border border-green-200 mb-6">{successMsg}</p>}

          {/* ========== CUSTOMER LOGIN ========== */}
          {activeTab === UserRole.CUSTOMER && !isRegisterMode && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className={labelClass}>User ID</label>
                <input type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)} className={inputClass} placeholder="Enter User ID" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Email Address</label>
                <input type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} className={inputClass} placeholder="Enter Email Address" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Mobile Number</label>
                <input type="text" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className={inputClass} placeholder="Enter Mobile Number" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Password</label>
                <input type="password" value={customerPassword} onChange={(e) => setCustomerPassword(e.target.value)} className={inputClass} placeholder="Enter account password" />
              </div>

              {error && <p className="text-red-600 text-[10px] font-bold bg-red-50 p-4 rounded-2xl text-center uppercase border border-red-100">{error}</p>}

              <button type="submit" className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-black py-5 rounded-full shadow-lg transition-all active:scale-95 uppercase tracking-wider text-[11px]">
                Sign In
              </button>

              <div className="relative my-8 flex items-center justify-center">
                <div className="border-t border-slate-100 w-full"></div>
                <span className="absolute bg-white px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">OR</span>
              </div>

              <button 
                type="button" 
                onClick={() => { setIsRegisterMode(true); setError(''); setSuccessMsg(''); }}
                className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-blue-200 hover:bg-blue-50 text-blue-700 font-black py-4 rounded-full transition-all text-[11px] uppercase tracking-wider active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                <span>Create New Account</span>
              </button>
            </form>
          )}

          {/* ========== CUSTOMER REGISTER ========== */}
          {activeTab === UserRole.CUSTOMER && isRegisterMode && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className={labelClass}>User ID <span className="text-red-400">*</span></label>
                <input type="text" value={regLoginId} onChange={(e) => setRegLoginId(e.target.value)} className={inputClass} placeholder="Choose a unique User ID" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Full Name <span className="text-red-400">*</span></label>
                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} className={inputClass} placeholder="Enter your full name" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Pharmacy / Store Name</label>
                <input type="text" value={regPharmacy} onChange={(e) => setRegPharmacy(e.target.value)} className={inputClass} placeholder="Enter pharmacy name (optional)" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Email Address</label>
                <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={inputClass} placeholder="Enter email (optional)" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Mobile Number</label>
                <input type="text" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className={inputClass} placeholder="Enter mobile number (optional)" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Password <span className="text-red-400">*</span></label>
                <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className={inputClass} placeholder="Choose a password (min 4 chars)" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Confirm Password <span className="text-red-400">*</span></label>
                <input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} className={inputClass} placeholder="Re-enter your password" />
              </div>

              {error && <p className="text-red-600 text-[10px] font-bold bg-red-50 p-4 rounded-2xl text-center uppercase border border-red-100">{error}</p>}

              <button type="submit" className="w-full bg-[#16a34a] hover:bg-green-700 text-white font-black py-5 rounded-full shadow-lg transition-all active:scale-95 uppercase tracking-wider text-[11px]">
                Create Account
              </button>

              <div className="relative my-6 flex items-center justify-center">
                <div className="border-t border-slate-100 w-full"></div>
                <span className="absolute bg-white px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">OR</span>
              </div>

              <button 
                type="button" 
                onClick={() => { setIsRegisterMode(false); setError(''); setSuccessMsg(''); }}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black py-4 rounded-full transition-all text-[11px] uppercase tracking-wider active:scale-95"
              >
                <span>← Back to Sign In</span>
              </button>
            </form>
          )}

          {/* ========== ADMIN LOGIN ========== */}
          {activeTab === UserRole.OWNER && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className={labelClass}>Admin Username</label>
                <input type="text" value={ownerUsername} onChange={(e) => setOwnerUsername(e.target.value)} className={inputClass} placeholder="Enter Admin Username" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Admin Password</label>
                <input type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} className={inputClass} placeholder="Enter Admin Password" />
              </div>

              {error && <p className="text-red-600 text-[10px] font-bold bg-red-50 p-4 rounded-2xl text-center uppercase border border-red-100">{error}</p>}

              <button type="submit" className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-black py-5 rounded-full shadow-lg transition-all active:scale-95 uppercase tracking-wider text-[11px]">
                Secure Admin Login
              </button>
            </form>
          )}
          
          <div className="mt-10 text-center uppercase tracking-widest">
            <p className="text-[10px] text-slate-400 font-black">Support Lines:</p>
            <p className="text-slate-800 font-extrabold text-sm mt-1.5">+91 74488 11335</p>
            <p className="text-[9px] text-slate-400 font-bold mt-1">+91 74488 44406 | +91 70100 72756</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
