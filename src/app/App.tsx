import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Mail, Phone, MapPin, Shield, CheckCircle, Eye, EyeOff,
  AlertCircle, LayoutDashboard, Settings, LogOut, Edit3, Save,
  X, Bell, Lock, Activity, ChevronRight, Clock, BadgeCheck,
} from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  last4ssn: string;
};

type Errors = Partial<Record<keyof FormData, string>>;
type View = "dashboard" | "profile" | "security" | "activity";

const EMPTY: FormData = {
  firstName: "", lastName: "", email: "", phone: "",
  address: "", city: "", state: "", zip: "", last4ssn: "",
};

function formatPhone(val: string) {
  const d = val.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function validate(data: FormData): Errors {
  const e: Errors = {};
  if (!data.firstName.trim()) e.firstName = "Required";
  if (!data.lastName.trim()) e.lastName = "Required";
  if (!data.email.trim()) e.email = "Required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Invalid email";
  if (!data.phone.trim()) e.phone = "Required";
  else if (data.phone.replace(/\D/g, "").length < 10) e.phone = "10 digits required";
  if (!data.address.trim()) e.address = "Required";
  if (!data.city.trim()) e.city = "Required";
  if (!data.state) e.state = "Required";
  if (!data.zip.trim()) e.zip = "Required";
  else if (!/^\d{5}(-\d{4})?$/.test(data.zip)) e.zip = "Invalid ZIP";
  if (!data.last4ssn.trim()) e.last4ssn = "Required";
  else if (!/^\d{4}$/.test(data.last4ssn)) e.last4ssn = "4 digits only";
  return e;
}

function Field({ label, error, required, children, hint }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

const inputClass = (error?: string) =>
  `w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white transition-colors outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground ${
    error ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : "border-border"
  }`;

// ── Registration Form ──────────────────────────────────────────────────────────

function RegisterForm({ onComplete }: { onComplete: (data: FormData) => void }) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [showSSN, setShowSSN] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  const set = (field: keyof FormData) => (val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (touched[field]) {
      const e = validate({ ...form, [field]: val });
      setErrors((prev) => ({ ...prev, [field]: e[field] }));
    }
  };

  const blur = (field: keyof FormData) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    const e = validate(form);
    setErrors((prev) => ({ ...prev, [field]: e[field] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])));
    if (Object.keys(errs).length === 0) onComplete(form);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <nav className="bg-white border-b border-border px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base text-foreground">SecureProfile</span>
          <span className="text-xs font-mono bg-accent text-accent-foreground px-2 py-0.5 rounded-full ml-1">TEST ENV</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono hidden sm:block">v1.0.0-dev</span>
      </nav>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Create Your Profile</h1>
            <p className="text-muted-foreground text-sm mt-1">Fill in your information below to register your account.</p>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Personal */}
              <div className="px-6 py-5 border-b border-border">
                <div className="flex items-center gap-2 mb-5">
                  <User className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name" error={errors.firstName} required>
                    <input type="text" value={form.firstName} onChange={(e) => set("firstName")(e.target.value)} onBlur={blur("firstName")} placeholder="Jane" className={inputClass(errors.firstName)} autoComplete="given-name" />
                  </Field>
                  <Field label="Last Name" error={errors.lastName} required>
                    <input type="text" value={form.lastName} onChange={(e) => set("lastName")(e.target.value)} onBlur={blur("lastName")} placeholder="Smith" className={inputClass(errors.lastName)} autoComplete="family-name" />
                  </Field>
                </div>
              </div>
              {/* Contact */}
              <div className="px-6 py-5 border-b border-border">
                <div className="flex items-center gap-2 mb-5">
                  <Mail className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">Contact Information</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email Address" error={errors.email} required>
                    <input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} onBlur={blur("email")} placeholder="jane@example.com" className={inputClass(errors.email)} autoComplete="email" />
                  </Field>
                  <Field label="Phone Number" error={errors.phone} required>
                    <input type="tel" value={form.phone} onChange={(e) => set("phone")(formatPhone(e.target.value))} onBlur={blur("phone")} placeholder="(555) 000-0000" className={inputClass(errors.phone)} autoComplete="tel" />
                  </Field>
                </div>
              </div>
              {/* Address */}
              <div className="px-6 py-5 border-b border-border">
                <div className="flex items-center gap-2 mb-5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">Address</h2>
                </div>
                <div className="flex flex-col gap-4">
                  <Field label="Street Address" error={errors.address} required>
                    <input type="text" value={form.address} onChange={(e) => set("address")(e.target.value)} onBlur={blur("address")} placeholder="123 Main Street" className={inputClass(errors.address)} autoComplete="street-address" />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="City" error={errors.city} required>
                      <input type="text" value={form.city} onChange={(e) => set("city")(e.target.value)} onBlur={blur("city")} placeholder="Springfield" className={inputClass(errors.city)} />
                    </Field>
                    <Field label="State" error={errors.state} required>
                      <select value={form.state} onChange={(e) => set("state")(e.target.value)} onBlur={blur("state")} className={inputClass(errors.state) + " cursor-pointer"}>
                        <option value="">Select state</option>
                        {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="ZIP Code" error={errors.zip} required>
                      <input type="text" value={form.zip} onChange={(e) => set("zip")(e.target.value.replace(/[^\d-]/g, "").slice(0, 10))} onBlur={blur("zip")} placeholder="62701" className={inputClass(errors.zip)} autoComplete="postal-code" />
                    </Field>
                  </div>
                </div>
              </div>
              {/* SSN */}
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 mb-5">
                  <Shield className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide">Identity Verification</h2>
                </div>
                <div className="max-w-xs">
                  <Field label="Last 4 of Social Security Number" error={errors.last4ssn} required hint="Used for identity verification only">
                    <div className="relative">
                      <input type={showSSN ? "text" : "password"} value={form.last4ssn} onChange={(e) => set("last4ssn")(e.target.value.replace(/\D/g, "").slice(0, 4))} onBlur={blur("last4ssn")} placeholder="••••" maxLength={4} className={inputClass(errors.last4ssn) + " pr-10 font-mono tracking-widest"} />
                      <button type="button" onClick={() => setShowSSN((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showSSN ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>
                </div>
                <p className="mt-4 text-xs text-muted-foreground bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex gap-2">
                  <Shield className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Test environment.</strong> No data is stored, transmitted, or processed.</span>
                </p>
              </div>
              {/* Footer */}
              <div className="px-6 py-5 bg-muted border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">Fields marked <span className="text-destructive font-semibold">*</span> are required</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setForm(EMPTY); setErrors({}); setTouched({}); }} className="px-4 py-2.5 rounded-lg border border-border bg-white text-sm font-semibold hover:bg-muted transition-colors">Clear</button>
                  <button type="submit" className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">Create Profile</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <footer className="border-t border-border bg-white px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground font-mono">SECUREPROFILE · TEST ENVIRONMENT · NO REAL DATA IS COLLECTED OR STORED</p>
      </footer>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

const MOCK_ACTIVITY = [
  { icon: BadgeCheck, label: "Account created", detail: "Profile successfully registered", time: "Just now", color: "text-green-600", bg: "bg-green-50" },
  { icon: Shield, label: "Identity verified", detail: "SSN last 4 confirmed", time: "Just now", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Lock, label: "Security check passed", detail: "No anomalies detected", time: "Just now", color: "text-violet-600", bg: "bg-violet-50" },
  { icon: Bell, label: "Welcome email queued", detail: "Confirmation sent to your inbox", time: "Just now", color: "text-amber-600", bg: "bg-amber-50" },
];

function Dashboard({ profile, onUpdate, onLogout }: {
  profile: FormData;
  onUpdate: (data: FormData) => void;
  onLogout: () => void;
}) {
  const [view, setView] = useState<View>("dashboard");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<FormData>(profile);
  const [editErrors, setEditErrors] = useState<Errors>({});
  const [showSSN, setShowSSN] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const initials = `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase();
  const fullName = `${profile.firstName} ${profile.lastName}`;

  const navItems: { id: View; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "My Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "activity", label: "Activity", icon: Activity },
  ];

  const startEdit = () => { setEditForm(profile); setEditErrors({}); setEditing(true); };

  const saveEdit = () => {
    const errs = validate(editForm);
    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onUpdate(editForm);
    setEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const setEdit = (field: keyof FormData) => (val: string) => {
    setEditForm((f) => ({ ...f, [field]: val }));
    const e = validate({ ...editForm, [field]: val });
    setEditErrors((prev) => ({ ...prev, [field]: e[field] }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top nav */}
      <nav className="bg-white border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base text-foreground">SecureProfile</span>
          <span className="text-xs font-mono bg-accent text-accent-foreground px-2 py-0.5 rounded-full ml-1 hidden sm:inline">TEST ENV</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{initials}</div>
            <span className="font-medium">{fullName}</span>
          </div>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden sm:flex flex-col w-56 border-r border-border bg-white py-6 px-3 gap-1 sticky top-14 h-[calc(100vh-3.5rem)]">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setView(id); setEditing(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                view === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
          <div className="mt-auto pt-4 border-t border-border">
            <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full text-left">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex z-20">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setView(id); setEditing(false); }} className={`flex-1 flex flex-col items-center py-2.5 gap-1 text-xs font-medium transition-colors ${view === id ? "text-primary" : "text-muted-foreground"}`}>
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-8 py-8 pb-24 sm:pb-8 max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {/* ── Dashboard Home ── */}
            {view === "dashboard" && (
              <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                {saveSuccess && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" /> Profile updated successfully.
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Welcome back, {profile.firstName}!</h1>
                  <p className="text-muted-foreground text-sm mt-1">Here's a summary of your account.</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Account Status", value: "Active", color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
                    { label: "Profile Complete", value: "100%", color: "text-primary", bg: "bg-blue-50", border: "border-blue-100" },
                    { label: "Verification", value: "Verified", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
                    { label: "Last Login", value: "Just now", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
                      <p className="text-xs text-muted-foreground font-medium mb-1">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Profile snapshot */}
                <div className="bg-white rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-foreground">Profile Snapshot</h2>
                    <button onClick={() => setView("profile")} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                      Edit <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">{initials}</div>
                    <div>
                      <p className="font-semibold text-foreground text-lg">{fullName}</p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    {[
                      { icon: Phone, label: "Phone", value: profile.phone },
                      { icon: MapPin, label: "Location", value: `${profile.city}, ${profile.state} ${profile.zip}` },
                      { icon: Shield, label: "SSN", value: `***-**-${profile.last4ssn}` },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">{label}</p>
                          <p className="font-medium text-foreground font-mono text-xs mt-0.5">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="bg-white rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-foreground">Recent Activity</h2>
                    <button onClick={() => setView("activity")} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {MOCK_ACTIVITY.slice(0, 3).map((a, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center shrink-0`}>
                          <a.icon className={`w-4 h-4 ${a.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{a.label}</p>
                          <p className="text-xs text-muted-foreground">{a.detail}</p>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── My Profile ── */}
            {view === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
                    <p className="text-muted-foreground text-sm mt-1">View and update your personal information.</p>
                  </div>
                  {!editing ? (
                    <button onClick={startEdit} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border bg-white text-sm font-semibold hover:bg-muted transition-colors">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                      <button onClick={saveEdit} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                        <Save className="w-4 h-4" /> Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-border overflow-hidden">
                  {/* Avatar row */}
                  <div className="px-6 py-5 border-b border-border flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">{initials}</div>
                    <div>
                      <p className="font-semibold text-foreground">{fullName}</p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full mt-1 font-medium">
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  </div>

                  {editing ? (
                    <div className="px-6 py-5 flex flex-col gap-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="First Name" error={editErrors.firstName} required>
                          <input type="text" value={editForm.firstName} onChange={(e) => setEdit("firstName")(e.target.value)} className={inputClass(editErrors.firstName)} />
                        </Field>
                        <Field label="Last Name" error={editErrors.lastName} required>
                          <input type="text" value={editForm.lastName} onChange={(e) => setEdit("lastName")(e.target.value)} className={inputClass(editErrors.lastName)} />
                        </Field>
                        <Field label="Email" error={editErrors.email} required>
                          <input type="email" value={editForm.email} onChange={(e) => setEdit("email")(e.target.value)} className={inputClass(editErrors.email)} />
                        </Field>
                        <Field label="Phone" error={editErrors.phone} required>
                          <input type="tel" value={editForm.phone} onChange={(e) => setEdit("phone")(formatPhone(e.target.value))} className={inputClass(editErrors.phone)} />
                        </Field>
                      </div>
                      <Field label="Street Address" error={editErrors.address} required>
                        <input type="text" value={editForm.address} onChange={(e) => setEdit("address")(e.target.value)} className={inputClass(editErrors.address)} />
                      </Field>
                      <div className="grid grid-cols-3 gap-4">
                        <Field label="City" error={editErrors.city} required>
                          <input type="text" value={editForm.city} onChange={(e) => setEdit("city")(e.target.value)} className={inputClass(editErrors.city)} />
                        </Field>
                        <Field label="State" error={editErrors.state} required>
                          <select value={editForm.state} onChange={(e) => setEdit("state")(e.target.value)} className={inputClass(editErrors.state) + " cursor-pointer"}>
                            <option value="">Select</option>
                            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </Field>
                        <Field label="ZIP" error={editErrors.zip} required>
                          <input type="text" value={editForm.zip} onChange={(e) => setEdit("zip")(e.target.value.replace(/[^\d-]/g, "").slice(0, 10))} className={inputClass(editErrors.zip)} />
                        </Field>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {[
                        { label: "First Name", value: profile.firstName },
                        { label: "Last Name", value: profile.lastName },
                        { label: "Email Address", value: profile.email },
                        { label: "Phone Number", value: profile.phone },
                        { label: "Street Address", value: profile.address },
                        { label: "City", value: profile.city },
                        { label: "State", value: profile.state },
                        { label: "ZIP Code", value: profile.zip },
                      ].map(({ label, value }) => (
                        <div key={label} className="px-6 py-4 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground w-40 shrink-0">{label}</span>
                          <span className="text-sm font-medium text-foreground text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Security ── */}
            {view === "security" && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Security</h1>
                  <p className="text-muted-foreground text-sm mt-1">Manage your identity and security settings.</p>
                </div>

                <div className="bg-white rounded-xl border border-border overflow-hidden">
                  <div className="px-6 py-5 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <h2 className="font-semibold text-sm uppercase tracking-wide">Identity Information</h2>
                    </div>
                  </div>
                  <div className="px-6 py-5 flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Social Security Number</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Last 4 digits on file</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-sm">
                          {showSSN ? `***-**-${profile.last4ssn}` : "***-**-••••"}
                        </span>
                        <button onClick={() => setShowSSN((v) => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
                          {showSSN ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Verification Status</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Your identity has been confirmed</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full font-semibold">
                        <BadgeCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Account Created</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Date of registration</p>
                      </div>
                      <span className="text-sm font-mono font-medium text-foreground">
                        {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 text-sm text-yellow-800 flex gap-3">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600" />
                  <p><strong>Test environment.</strong> In a production system, this section would include password management, two-factor authentication, and session controls.</p>
                </div>
              </motion.div>
            )}

            {/* ── Activity ── */}
            {view === "activity" && (
              <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
                  <p className="text-muted-foreground text-sm mt-1">A record of all actions on your account.</p>
                </div>
                <div className="bg-white rounded-xl border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Recent Events</span>
                  </div>
                  <div className="divide-y divide-border">
                    {MOCK_ACTIVITY.map((a, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="px-6 py-4 flex items-center gap-4"
                      >
                        <div className={`w-9 h-9 rounded-lg ${a.bg} flex items-center justify-center shrink-0`}>
                          <a.icon className={`w-4 h-4 ${a.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{a.label}</p>
                          <p className="text-xs text-muted-foreground">{a.detail}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-mono text-muted-foreground">{a.time}</p>
                          <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [profile, setProfile] = useState<FormData | null>(null);

  if (!profile) return <RegisterForm onComplete={setProfile} />;
  return <Dashboard profile={profile} onUpdate={setProfile} onLogout={() => setProfile(null)} />;
}
