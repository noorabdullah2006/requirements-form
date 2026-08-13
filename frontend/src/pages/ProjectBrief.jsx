import React, { useState, useRef, useEffect } from 'react';
import './ProjectBrief.css';
import { submitBrief } from '../services/briefService';

// ── Constants ────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  'Restaurant', 'E-commerce', 'Agency', 'Personal Brand',
  'Portfolio', 'Real Estate', 'Education', 'Healthcare', 'Other'
];
const PROJECT_TYPES = [
  'New Website', 'Redesign Existing Website', 'Landing Page',
  'E-commerce Website', 'Web Application', 'Portfolio',
  'Business Website', 'Other'
];
const PROJECT_GOALS = [
  'Get more customers', 'Sell products online', 'Generate leads',
  'Show portfolio', 'Provide information', 'Online bookings', 'Other'
];
const PAGES_LIST = [
  'Home', 'About', 'Services', 'Products', 'Pricing', 'Portfolio',
  'Gallery', 'Blog', 'FAQ', 'Contact', 'Testimonials', 'Team',
  'Careers', 'Privacy Policy', 'Terms & Conditions', 'Other'
];
const FEATURES_LIST = [
  'Contact Form', 'WhatsApp Integration', 'Newsletter', 'Blog', 'Search',
  'User Login/Register', 'Admin Dashboard', 'E-commerce', 'Shopping Cart',
  'Payment Gateway', 'Booking System', 'Appointment System', 'Google Maps',
  'Reviews', 'Social Media Integration', 'Email Notifications', 'File Upload',
  'Multi-language', 'Analytics', 'Other'
];
const DESIGN_STYLES = [
  'Modern', 'Minimal', 'Professional', 'Luxury',
  'Creative', 'Corporate', 'Dark', 'Colorful', 'Other'
];
const CONTENT_ASSETS = ['Logo', 'Images', 'Videos', 'Text / Content', 'Brand Guidelines'];
const BUDGET_OPTIONS = [
  'Under $250', '$250 – $500', '$500 – $1,000',
  '$1,000 – $2,500', '$2,500+', 'Not sure / Need a quote'
];
const URGENCY_OPTIONS = ['Flexible', 'Normal', 'Urgent'];
const DOMAIN_OPTIONS  = ['Yes', 'No', 'Not sure'];
const HOSTING_OPTIONS = ['Yes', 'No', 'Not sure'];
const COMM_OPTIONS    = ['WhatsApp', 'Email', 'Phone Call'];

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
const MAX_FILES = 5;
const MAX_SIZE_MB = 10;

const TOTAL_STEPS = 10;
const STEP_LABELS = [
  'Client Info', 'Project Info', 'Pages', 'Features', 'Design',
  'Content', 'Domain & Hosting', 'Budget', 'Files', 'Additional Info'
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function CustomSelect({ options, value, onChange, placeholder, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`custom-select-wrap ${isOpen ? 'open' : ''}`} ref={ref}>
      <button
        type="button"
        className={`custom-select-trigger ${error ? 'input-error' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || placeholder}</span>
        <span className="arrow">{isOpen ? '▲' : '▾'}</span>
      </button>

      {isOpen && (
        <ul className="custom-select-options">
          {options.map(opt => (
            <li
              key={opt}
              className={`custom-option ${value === opt ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
            >
              <span>{opt}</span>
              {value === opt && <span className="check">✓</span>}
            </li>
          ))}
        </ul>
      )}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

function Chips({ options, value, onChange, error }) {
  return (
    <>
      <div className="style-grid">
        {options.map(opt => (
          <button
            key={opt} type="button"
            className={`style-chip ${value === opt ? 'selected' : ''}`}
            onClick={() => onChange(opt)}
          >{opt}</button>
        ))}
      </div>
      {error && <span className="error-message">{error}</span>}
    </>
  );
}

function CheckboxGrid({ items, selected, onToggle }) {
  return (
    <div className="checkbox-grid">
      {items.map(item => (
        <label key={item} className={`checkbox-card ${selected.includes(item) ? 'checked' : ''}`}>
          <input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)} />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
}

function ReviewRow({ label, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="review-row">
      <span className="review-label">{label}</span>
      <span className="review-value">{Array.isArray(value) ? value.join(', ') : value}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

function ProjectBrief() {
  const [step, setStep]             = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);  // loading state during API call
  const [submitError, setSubmitError] = useState('');   // API error message
  const [projectId, setProjectId]   = useState(null);  // returned by backend
  const [errors, setErrors]         = useState({});
  const fileInputRef = useRef(null);

  // Step states
  const [s1, setS1] = useState({ fullName:'', email:'', phone:'', companyName:'', businessType:'', otherBusinessType:'' });
  const [s2, setS2] = useState({ projectType:'', otherProjectType:'', businessDescription:'', projectGoal:'', otherProjectGoal:'' });
  const [s3, setS3] = useState({ pages:[], otherPage:'' });
  const [s4, setS4] = useState({ features:[], otherFeature:'' });
  const [s5, setS5] = useState({ designStyle:'', otherDesignStyle:'', preferredColors:'', hasExistingBranding:'', referenceUrls:'' });
  const [s6, setS6] = useState({ contentStatus:'', availableAssets:[] });
  const [s7, setS7] = useState({ hasDomain:'', domain:'', hasHosting:'', hostingDetails:'' });
  const [s8, setS8] = useState({ budget:'', deadline:'', urgency:'' });
  const [s9, setS9] = useState({ files:[], fileError:'' });
  const [s10, setS10] = useState({ additionalNotes:'', communicationMethod:'' });

  // Generic field change
  const ch = (setter) => (e) => {
    const { name, value } = e.target;
    setter(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  // Checkbox toggle
  const toggle = (setter, field) => (val) =>
    setter(p => ({ ...p, [field]: p[field].includes(val) ? p[field].filter(v => v !== val) : [...p[field], val] }));

  // Chip setter with error clear
  const chip = (setter, field) => (val) => {
    setter(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  // File selection handler
  const handleFiles = (e) => {
    const picked = Array.from(e.target.files);
    let err = '';
    const combined = [...s9.files, ...picked].slice(0, MAX_FILES);

    for (const f of combined) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        err = `"${f.name}" — unsupported file type.`;
        break;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        err = `"${f.name}" exceeds ${MAX_SIZE_MB}MB limit.`;
        break;
      }
    }

    setS9({ files: err ? s9.files : combined, fileError: err });
    e.target.value = '';
  };

  const removeFile = (idx) => setS9(p => ({ ...p, files: p.files.filter((_, i) => i !== idx), fileError: '' }));

  // ── Validators ────────────────────────────────────────────────────────────
  const validate = {
    1: () => {
      const e = {};
      if (!s1.fullName.trim())              e.fullName = 'Full Name is required';
      if (!s1.email.trim())                  e.email    = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(s1.email)) e.email = 'Enter a valid email';
      if (s1.businessType === 'Other' && !s1.otherBusinessType.trim())
        e.otherBusinessType = 'Please specify your business type';
      setErrors(e);
      return !Object.keys(e).length;
    },
    2: () => {
      const e = {};
      if (!s2.projectType)                   e.projectType          = 'Select a project type';
      if (!s2.businessDescription.trim())    e.businessDescription  = 'Please describe your project';
      if (!s2.projectGoal)                   e.projectGoal          = 'Select your main goal';
      if (s2.projectType === 'Other' && !s2.otherProjectType.trim())
        e.otherProjectType = 'Please specify the type';
      if (s2.projectGoal === 'Other' && !s2.otherProjectGoal.trim())
        e.otherProjectGoal = 'Please specify the goal';
      setErrors(e);
      return !Object.keys(e).length;
    },
    3: () => {
      const e = {};
      if (!s3.pages.length)                  e.pages    = 'Select at least one page';
      if (s3.pages.includes('Other') && !s3.otherPage.trim()) e.otherPage = 'Please specify';
      setErrors(e);
      return !Object.keys(e).length;
    },
    4: () => {
      const e = {};
      if (s4.features.includes('Other') && !s4.otherFeature.trim()) e.otherFeature = 'Please describe';
      setErrors(e);
      return !Object.keys(e).length;
    },
    5: () => {
      const e = {};
      if (!s5.designStyle)            e.designStyle          = 'Select a design style';
      if (!s5.hasExistingBranding)    e.hasExistingBranding  = 'Please answer this';
      if (s5.designStyle === 'Other' && !s5.otherDesignStyle.trim()) e.otherDesignStyle = 'Please specify';
      setErrors(e);
      return !Object.keys(e).length;
    },
    6: () => {
      const e = {};
      if (!s6.contentStatus)          e.contentStatus = 'Please answer this';
      setErrors(e);
      return !Object.keys(e).length;
    },
    7: () => {
      const e = {};
      if (!s7.hasDomain)  e.hasDomain  = 'Please answer this';
      if (!s7.hasHosting) e.hasHosting = 'Please answer this';
      setErrors(e);
      return !Object.keys(e).length;
    },
    8: () => {
      const e = {};
      if (!s8.budget)   e.budget   = 'Select a budget range';
      if (!s8.urgency)  e.urgency  = 'Select urgency level';
      setErrors(e);
      return !Object.keys(e).length;
    },
    9:  () => { setErrors({}); return true; },
    10: () => {
      const e = {};
      if (!s10.communicationMethod) e.communicationMethod = 'Please select a preferred method';
      setErrors(e);
      return !Object.keys(e).length;
    }
  };

  // Navigation
  const handleNext = (e) => {
    e.preventDefault();
    if (validate[step]()) {
      setErrors({});
      if (step === TOTAL_STEPS) { setShowReview(true); }
      else { setStep(s => s + 1); }
    }
  };
  const handleBack = () => { setErrors({}); setStep(s => s - 1); };
  const handleEdit = (n) => { setShowReview(false); setStep(n); };

  const handleSubmit = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const result = await submitBrief({ s1, s2, s3, s4, s5, s6, s7, s8, s10 }, s9.files);
      setProjectId(result.data?.projectId);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Progress
  const pct = Math.round(((step - 1) / TOTAL_STEPS) * 100);

  // ── Render ────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="brief-container">
        <div className="brief-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div className="success-icon">🎉</div>
          <h2 style={{ marginBottom: '12px' }}>Thank You!</h2>
          <p style={{ lineHeight: '1.8', maxWidth: '420px', margin: '0 auto 24px' }}>
            Your project brief has been submitted successfully.<br />
            I will review your requirements and contact you via <strong>{s10.communicationMethod}</strong> shortly.
          </p>
          {projectId && (
            <p className="field-hint">Your reference ID: <strong>#{projectId}</strong></p>
          )}
          <div className="review-section" style={{ textAlign: 'left', maxWidth: '420px', margin: '20px auto 0' }}>
            <p className="field-hint">Submitted by: <strong>{s1.fullName}</strong> — {s1.email}</p>
          </div>
        </div>
      </div>
    );
  }

  if (showReview) {
    const effectiveBizType  = s1.businessType === 'Other' ? s1.otherBusinessType : s1.businessType;
    const effectiveProjType = s2.projectType  === 'Other' ? s2.otherProjectType  : s2.projectType;
    const effectiveGoal     = s2.projectGoal  === 'Other' ? s2.otherProjectGoal  : s2.projectGoal;
    const effectiveStyle    = s5.designStyle  === 'Other' ? s5.otherDesignStyle  : s5.designStyle;

    return (
      <div className="brief-container">
        <header className="brief-header">
          <h1>Review Your Brief</h1>
          <p>Check everything before submitting. You can edit any section.</p>
        </header>

        <div className="brief-card">
          {/* Client Info */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Client Information</h3>
              <button type="button" className="btn-edit" onClick={() => handleEdit(1)}>Edit</button>
            </div>
            <ReviewRow label="Name"    value={s1.fullName} />
            <ReviewRow label="Email"   value={s1.email} />
            <ReviewRow label="Phone"   value={s1.phone} />
            <ReviewRow label="Company" value={s1.companyName} />
            <ReviewRow label="Industry" value={effectiveBizType} />
          </div>

          {/* Project Info */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Project Information</h3>
              <button type="button" className="btn-edit" onClick={() => handleEdit(2)}>Edit</button>
            </div>
            <ReviewRow label="Type"  value={effectiveProjType} />
            <ReviewRow label="Goal"  value={effectiveGoal} />
            <ReviewRow label="About" value={s2.businessDescription} />
          </div>

          {/* Pages */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Pages</h3>
              <button type="button" className="btn-edit" onClick={() => handleEdit(3)}>Edit</button>
            </div>
            <ReviewRow label="Pages" value={[...s3.pages.filter(p => p !== 'Other'), ...(s3.otherPage ? [s3.otherPage] : [])]} />
          </div>

          {/* Features */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Features</h3>
              <button type="button" className="btn-edit" onClick={() => handleEdit(4)}>Edit</button>
            </div>
            <ReviewRow label="Features" value={s4.features.length ? [...s4.features.filter(f => f !== 'Other'), ...(s4.otherFeature ? [s4.otherFeature] : [])] : 'None selected'} />
          </div>

          {/* Design */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Design</h3>
              <button type="button" className="btn-edit" onClick={() => handleEdit(5)}>Edit</button>
            </div>
            <ReviewRow label="Style"     value={effectiveStyle} />
            <ReviewRow label="Colors"    value={s5.preferredColors || 'Not specified'} />
            <ReviewRow label="Branding"  value={s5.hasExistingBranding} />
            <ReviewRow label="References" value={s5.referenceUrls || 'None'} />
          </div>

          {/* Content */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Content</h3>
              <button type="button" className="btn-edit" onClick={() => handleEdit(6)}>Edit</button>
            </div>
            <ReviewRow label="Content Ready"   value={s6.contentStatus} />
            <ReviewRow label="Available Assets" value={s6.availableAssets.length ? s6.availableAssets : 'None'} />
          </div>

          {/* Domain & Hosting */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Domain & Hosting</h3>
              <button type="button" className="btn-edit" onClick={() => handleEdit(7)}>Edit</button>
            </div>
            <ReviewRow label="Has Domain"  value={s7.hasDomain} />
            <ReviewRow label="Domain"      value={s7.domain} />
            <ReviewRow label="Has Hosting" value={s7.hasHosting} />
            <ReviewRow label="Hosting"     value={s7.hostingDetails} />
          </div>

          {/* Budget */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Budget & Timeline</h3>
              <button type="button" className="btn-edit" onClick={() => handleEdit(8)}>Edit</button>
            </div>
            <ReviewRow label="Budget"   value={s8.budget} />
            <ReviewRow label="Deadline" value={s8.deadline || 'Not specified'} />
            <ReviewRow label="Urgency"  value={s8.urgency} />
          </div>

          {/* Files */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Files</h3>
              <button type="button" className="btn-edit" onClick={() => handleEdit(9)}>Edit</button>
            </div>
            <ReviewRow label="Attached" value={s9.files.length ? s9.files.map(f => f.name) : 'No files uploaded'} />
          </div>

          {/* Additional Info */}
          <div className="review-section">
            <div className="review-section-header">
              <h3>Additional Information</h3>
              <button type="button" className="btn-edit" onClick={() => handleEdit(10)}>Edit</button>
            </div>
            <ReviewRow label="Notes"      value={s10.additionalNotes || 'None'} />
            <ReviewRow label="Contact Via" value={s10.communicationMethod} />
          </div>

          {submitError && (
            <p className="error-message" style={{ marginBottom: '12px', textAlign: 'center' }}>
              ⚠ {submitError}
            </p>
          )}
          <div className="form-actions" style={{ marginTop: '30px' }}>
            <button type="button" className="btn-back"
              onClick={() => { setShowReview(false); setStep(TOTAL_STEPS); }}
              disabled={submitting}>
              ← Back
            </button>
            <button type="button" className="btn-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : '✓ Submit Project Brief'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="brief-container">
      <header className="brief-header">
        <h1>Project Brief</h1>
        <p>Tell us about your project so we can give you an accurate estimate.</p>
      </header>

      {/* Compact stepper for 10 steps */}
      <div className="stepper-compact">
        <div className="stepper-compact-track">
          <div className="stepper-compact-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="stepper-compact-label">
          <span className="step-counter">Step {step} of {TOTAL_STEPS}</span>
          <span className="step-name">{STEP_LABELS[step - 1]}</span>
        </div>
      </div>

      <div className="brief-card">
        <form onSubmit={handleNext}>

          {/* ── STEP 1: CLIENT INFO ───────────────────────────────────── */}
          {step === 1 && (
            <div className="form-section">
              <h2>Step 1: Client Information</h2>
              <p className="section-subtitle">Please introduce yourself and your business sector.</p>

              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input name="fullName" value={s1.fullName} onChange={ch(setS1)}
                  placeholder="e.g. Noor Abdullah" className={errors.fullName ? 'input-error' : ''} />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <label>Email Address <span className="required">*</span></label>
                <input name="email" type="email" value={s1.email} onChange={ch(setS1)}
                  placeholder="e.g. noor@example.com" className={errors.email ? 'input-error' : ''} />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Phone / WhatsApp</label>
                <input name="phone" value={s1.phone} onChange={ch(setS1)} placeholder="e.g. +92 300 1234567" />
              </div>
              <div className="form-group">
                <label>Company / Business Name</label>
                <input name="companyName" value={s1.companyName} onChange={ch(setS1)} placeholder="e.g. Tech Solutions INC" />
              </div>
              <div className="form-group">
                <label>Business Type</label>
                <CustomSelect options={BUSINESS_TYPES} value={s1.businessType}
                  onChange={chip(setS1, 'businessType')} placeholder="Select industry..." error={errors.businessType} />
              </div>
              {s1.businessType === 'Other' && (
                <div className="form-group nested-group">
                  <label>Specify Business Type <span className="required">*</span></label>
                  <input name="otherBusinessType" value={s1.otherBusinessType} onChange={ch(setS1)}
                    placeholder="e.g. Event Management" className={errors.otherBusinessType ? 'input-error' : ''} />
                  {errors.otherBusinessType && <span className="error-message">{errors.otherBusinessType}</span>}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: PROJECT INFO ──────────────────────────────────── */}
          {step === 2 && (
            <div className="form-section">
              <h2>Step 2: Project Information</h2>
              <p className="section-subtitle">Tell us what you need and what your goal is.</p>

              <div className="form-group">
                <label>What do you need? <span className="required">*</span></label>
                <CustomSelect options={PROJECT_TYPES} value={s2.projectType}
                  onChange={chip(setS2, 'projectType')} placeholder="Select project type..." error={errors.projectType} />
              </div>
              {s2.projectType === 'Other' && (
                <div className="form-group nested-group">
                  <label>Specify <span className="required">*</span></label>
                  <input name="otherProjectType" value={s2.otherProjectType} onChange={ch(setS2)}
                    placeholder="Describe the project type" className={errors.otherProjectType ? 'input-error' : ''} />
                  {errors.otherProjectType && <span className="error-message">{errors.otherProjectType}</span>}
                </div>
              )}
              <div className="form-group">
                <label>Tell us about your business / project <span className="required">*</span></label>
                <textarea name="businessDescription" value={s2.businessDescription} onChange={ch(setS2)}
                  placeholder="Describe your business, what you sell, or what the project is about..."
                  rows={5} className={errors.businessDescription ? 'input-error' : ''} />
                {errors.businessDescription && <span className="error-message">{errors.businessDescription}</span>}
              </div>
              <div className="form-group">
                <label>Main goal of this website <span className="required">*</span></label>
                <CustomSelect options={PROJECT_GOALS} value={s2.projectGoal}
                  onChange={chip(setS2, 'projectGoal')} placeholder="Select main goal..." error={errors.projectGoal} />
              </div>
              {s2.projectGoal === 'Other' && (
                <div className="form-group nested-group">
                  <label>Specify goal <span className="required">*</span></label>
                  <input name="otherProjectGoal" value={s2.otherProjectGoal} onChange={ch(setS2)}
                    placeholder="Describe the main goal" className={errors.otherProjectGoal ? 'input-error' : ''} />
                  {errors.otherProjectGoal && <span className="error-message">{errors.otherProjectGoal}</span>}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: WEBSITE PAGES ─────────────────────────────────── */}
          {step === 3 && (
            <div className="form-section">
              <h2>Step 3: Website Pages</h2>
              <p className="section-subtitle">Select all the pages you need. <span className="required">*</span></p>
              {errors.pages && <p className="error-message" style={{ marginBottom: '12px' }}>{errors.pages}</p>}
              <CheckboxGrid items={PAGES_LIST} selected={s3.pages} onToggle={toggle(setS3, 'pages')} />
              {s3.pages.includes('Other') && (
                <div className="form-group nested-group" style={{ marginTop: '16px' }}>
                  <label>Custom page name <span className="required">*</span></label>
                  <input value={s3.otherPage}
                    onChange={e => setS3(p => ({ ...p, otherPage: e.target.value }))}
                    placeholder="e.g. Franchise, Events" className={errors.otherPage ? 'input-error' : ''} />
                  {errors.otherPage && <span className="error-message">{errors.otherPage}</span>}
                </div>
              )}
              {s3.pages.length > 0 && (
                <p className="field-hint" style={{ marginTop: '14px' }}>✓ {s3.pages.length} page{s3.pages.length > 1 ? 's' : ''} selected</p>
              )}
            </div>
          )}

          {/* ── STEP 4: FEATURES ─────────────────────────────────────── */}
          {step === 4 && (
            <div className="form-section">
              <h2>Step 4: Features & Functionality</h2>
              <p className="section-subtitle">Select all features you need. (Optional — skip if unsure)</p>
              <CheckboxGrid items={FEATURES_LIST} selected={s4.features} onToggle={toggle(setS4, 'features')} />
              {s4.features.includes('Other') && (
                <div className="form-group nested-group" style={{ marginTop: '16px' }}>
                  <label>Describe other feature <span className="required">*</span></label>
                  <input value={s4.otherFeature}
                    onChange={e => setS4(p => ({ ...p, otherFeature: e.target.value }))}
                    placeholder="e.g. Live Chat, Custom CRM" className={errors.otherFeature ? 'input-error' : ''} />
                  {errors.otherFeature && <span className="error-message">{errors.otherFeature}</span>}
                </div>
              )}
              {s4.features.length > 0 && (
                <p className="field-hint" style={{ marginTop: '14px' }}>✓ {s4.features.length} feature{s4.features.length > 1 ? 's' : ''} selected</p>
              )}
            </div>
          )}

          {/* ── STEP 5: DESIGN REQUIREMENTS ──────────────────────────── */}
          {step === 5 && (
            <div className="form-section">
              <h2>Step 5: Design Requirements</h2>
              <p className="section-subtitle">Help us understand the look and feel you want.</p>

              <div className="form-group">
                <label>Preferred style <span className="required">*</span></label>
                <Chips options={DESIGN_STYLES} value={s5.designStyle}
                  onChange={chip(setS5, 'designStyle')} error={errors.designStyle} />
              </div>
              {s5.designStyle === 'Other' && (
                <div className="form-group nested-group">
                  <label>Specify style <span className="required">*</span></label>
                  <input name="otherDesignStyle" value={s5.otherDesignStyle} onChange={ch(setS5)}
                    placeholder="e.g. Retro, Futuristic" className={errors.otherDesignStyle ? 'input-error' : ''} />
                  {errors.otherDesignStyle && <span className="error-message">{errors.otherDesignStyle}</span>}
                </div>
              )}
              <div className="form-group">
                <label>Preferred Colors</label>
                <input name="preferredColors" value={s5.preferredColors} onChange={ch(setS5)}
                  placeholder="e.g. Dark blue, gold, white — or 'no preference'" />
              </div>
              <div className="form-group">
                <label>Do you already have branding? <span className="required">*</span></label>
                <Chips options={['Yes', 'No', 'Partially']} value={s5.hasExistingBranding}
                  onChange={chip(setS5, 'hasExistingBranding')} error={errors.hasExistingBranding} />
              </div>
              <div className="form-group">
                <label>Websites you like (reference links)</label>
                <textarea name="referenceUrls" value={s5.referenceUrls} onChange={ch(setS5)}
                  placeholder="Paste URLs you like, one per line&#10;e.g. https://stripe.com" rows={3} />
                <span className="field-hint">Optional</span>
              </div>
            </div>
          )}

          {/* ── STEP 6: CONTENT ──────────────────────────────────────── */}
          {step === 6 && (
            <div className="form-section">
              <h2>Step 6: Content</h2>
              <p className="section-subtitle">Tell us about your existing content and assets.</p>

              <div className="form-group">
                <label>Do you already have website content? <span className="required">*</span></label>
                <Chips
                  options={['Yes, everything is ready', 'Some content is ready', 'No, I need help with content']}
                  value={s6.contentStatus}
                  onChange={chip(setS6, 'contentStatus')}
                  error={errors.contentStatus}
                />
              </div>
              <div className="form-group" style={{ marginTop: '24px' }}>
                <label>What do you have available?</label>
                <p className="field-hint" style={{ marginBottom: '12px' }}>Select all that apply</p>
                <CheckboxGrid items={CONTENT_ASSETS} selected={s6.availableAssets}
                  onToggle={toggle(setS6, 'availableAssets')} />
              </div>
            </div>
          )}

          {/* ── STEP 7: DOMAIN & HOSTING ──────────────────────────────── */}
          {step === 7 && (
            <div className="form-section">
              <h2>Step 7: Domain & Hosting</h2>
              <p className="section-subtitle">Help us understand your current setup.</p>

              <div className="form-group">
                <label>Do you already have a domain? <span className="required">*</span></label>
                <Chips options={DOMAIN_OPTIONS} value={s7.hasDomain}
                  onChange={chip(setS7, 'hasDomain')} error={errors.hasDomain} />
              </div>
              {s7.hasDomain === 'Yes' && (
                <div className="form-group nested-group">
                  <label>Domain name</label>
                  <input name="domain" value={s7.domain} onChange={ch(setS7)}
                    placeholder="e.g. mybusiness.com" />
                </div>
              )}
              <div className="form-group" style={{ marginTop: '24px' }}>
                <label>Do you already have hosting? <span className="required">*</span></label>
                <Chips options={HOSTING_OPTIONS} value={s7.hasHosting}
                  onChange={chip(setS7, 'hasHosting')} error={errors.hasHosting} />
              </div>
              {s7.hasHosting === 'Yes' && (
                <div className="form-group nested-group">
                  <label>Hosting provider (optional)</label>
                  <input name="hostingDetails" value={s7.hostingDetails} onChange={ch(setS7)}
                    placeholder="e.g. Hostinger, Bluehost, SiteGround" />
                </div>
              )}
            </div>
          )}

          {/* ── STEP 8: BUDGET & TIMELINE ─────────────────────────────── */}
          {step === 8 && (
            <div className="form-section">
              <h2>Step 8: Budget & Timeline</h2>
              <p className="section-subtitle">Help us understand your budget and when you need the project.</p>

              <div className="form-group">
                <label>Estimated budget <span className="required">*</span></label>
                <div className="style-grid">
                  {BUDGET_OPTIONS.map(opt => (
                    <button key={opt} type="button"
                      className={`style-chip ${s8.budget === opt ? 'selected' : ''}`}
                      onClick={() => { setS8(p => ({ ...p, budget: opt })); if (errors.budget) setErrors(p => ({ ...p, budget: '' })); }}>
                      {opt}
                    </button>
                  ))}
                </div>
                {errors.budget && <span className="error-message">{errors.budget}</span>}
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label>Desired deadline</label>
                <input type="date" name="deadline" value={s8.deadline} onChange={ch(setS8)}
                  min={new Date().toISOString().split('T')[0]} />
                <span className="field-hint">Optional — leave blank if flexible</span>
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label>How urgent is this project? <span className="required">*</span></label>
                <Chips options={URGENCY_OPTIONS} value={s8.urgency}
                  onChange={chip(setS8, 'urgency')} error={errors.urgency} />
              </div>
            </div>
          )}

          {/* ── STEP 9: FILES ──────────────────────────────────────────── */}
          {step === 9 && (
            <div className="form-section">
              <h2>Step 9: Upload Files</h2>
              <p className="section-subtitle">
                Upload logos, images, PDFs, brand guidelines, or any reference documents.
              </p>

              <div
                className="file-upload-zone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFiles({ target: { files: e.dataTransfer.files }, value: '' }); }}
              >
                <div className="file-upload-icon">📁</div>
                <p>Click to browse or drag & drop files here</p>
                <span className="field-hint">
                  Max {MAX_FILES} files · Max {MAX_SIZE_MB}MB each · JPG, PNG, PDF, DOC, TXT
                </span>
              </div>

              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFiles}
                accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
              />

              {s9.fileError && <p className="error-message" style={{ marginTop: '10px' }}>{s9.fileError}</p>}

              {s9.files.length > 0 && (
                <div className="file-chips" style={{ marginTop: '16px' }}>
                  {s9.files.map((f, i) => (
                    <div key={i} className="file-chip">
                      <span>{f.name}</span>
                      <button type="button" onClick={() => removeFile(i)} className="file-chip-remove">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {s9.files.length > 0 && (
                <p className="field-hint" style={{ marginTop: '10px' }}>
                  {s9.files.length} / {MAX_FILES} files selected
                </p>
              )}
            </div>
          )}

          {/* ── STEP 10: ADDITIONAL INFO ──────────────────────────────── */}
          {step === 10 && (
            <div className="form-section">
              <h2>Step 10: Additional Information</h2>
              <p className="section-subtitle">Final details and how to reach you.</p>

              <div className="form-group">
                <label>Anything else we should know?</label>
                <textarea name="additionalNotes" value={s10.additionalNotes}
                  onChange={ch(setS10)}
                  placeholder="Any other requirements, special instructions, or questions..."
                  rows={5} />
              </div>

              <div className="form-group">
                <label>Preferred communication method <span className="required">*</span></label>
                <Chips options={COMM_OPTIONS} value={s10.communicationMethod}
                  onChange={chip(setS10, 'communicationMethod')} error={errors.communicationMethod} />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            {step > 1 && <button type="button" className="btn-back" onClick={handleBack}>← Back</button>}
            <button type="submit" className="btn-next">
              {step === TOTAL_STEPS ? 'Review Brief →' : 'Next Step →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectBrief;
