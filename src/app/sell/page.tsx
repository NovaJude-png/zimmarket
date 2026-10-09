'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { ZIMBABWE_PROVINCES, ZIMBABWE_CITIES, CURRENCIES } from '@/lib/utils';

const CONDITIONS = [
  { value: 'NEW', label: 'Brand New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'USED_EXCELLENT', label: 'Used - Excellent' },
  { value: 'USED_GOOD', label: 'Used - Good' },
  { value: 'USED_FAIR', label: 'Used - Fair' },
  { value: 'FOR_PARTS', label: 'For Parts' },
  { value: 'REFURBISHED', label: 'Refurbished' },
];

export default function SellPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<{ url: string; file?: File }[]>([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    price: '',
    currency: 'USD',
    isNegotiable: true,
    condition: 'USED_GOOD',
    brand: '',
    model: '',
    year: '',
    quantity: '1',
    locationProvince: '',
    locationCity: '',
    locationArea: '',
    contactPreference: 'MESSAGE',
    deliveryAvailable: false,
    deliveryNote: '',
  });

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    if (form.locationProvince) {
      setCities(ZIMBABWE_CITIES[form.locationProvince] || []);
    }
  }, [form.locationProvince]);

  const updateForm = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);

    for (let i = 0; i < files.length && uploadedImages.length < 10; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) {
          setUploadedImages(prev => [...prev, { url: data.url, file }]);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (status: string = 'PENDING') => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          year: form.year ? parseInt(form.year) : null,
          quantity: parseInt(form.quantity) || 1,
          images: uploadedImages.map(img => ({ url: img.url })),
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create listing');
        setLoading(false);
        return;
      }

      router.push(`/listing/${data.listing.id}`);
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Images' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Price' },
    { num: 4, label: 'Location' },
    { num: 5, label: 'Preview' },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />

      <div className="container-app py-4 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Listing</h1>

        {/* Steps */}
        <div className="flex items-center gap-1 mb-8">
          {steps.map((s) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${step >= s.num ? 'text-[#0284C7]' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > s.num ? 'bg-[#0284C7] text-white' :
                  step === s.num ? 'bg-[#0284C7] text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.label}</span>
              </div>
              {s.num < steps.length && <div className={`flex-1 h-0.5 mx-1 ${step > s.num ? 'bg-[#0284C7]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {/* Step 1: Images */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Upload Photos</h2>
            <p className="text-sm text-gray-500">Add up to 10 photos. Good photos get more views!</p>

            <div className="grid grid-cols-3 gap-3">
              {uploadedImages.map((img, i) => (
                <div key={i} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">Image {i + 1}</span>
                  </div>
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-[#0284C7] text-white text-[9px] px-1.5 py-0.5 rounded">Main</span>
                  )}
                </div>
              ))}

              {uploadedImages.length < 10 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0EA5E9] transition-colors">
                  {uploading ? (
                    <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                    </>
                  )}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={() => setStep(2)} className="btn-primary" disabled={uploadedImages.length === 0}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Listing Details</h2>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => updateForm('title', e.target.value)}
                className="input-field"
                placeholder="e.g. Samsung Galaxy S23 Ultra 256GB"
                maxLength={120}
              />
              <p className="text-xs text-gray-400">{form.title.length}/120</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                value={form.description}
                onChange={e => updateForm('description', e.target.value)}
                className="input-field min-h-[120px]"
                placeholder="Describe your item in detail. Include condition, features, and any defects."
                maxLength={5000}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  value={form.categoryId}
                  onChange={e => updateForm('categoryId', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {categories.map((cat: Record<string, unknown>) => (
                    <option key={cat.id as string} value={cat.id as string}>{cat.name as string}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Condition *</label>
                <select
                  value={form.condition}
                  onChange={e => updateForm('condition', e.target.value)}
                  className="input-field"
                >
                  {CONDITIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Brand</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={e => updateForm('brand', e.target.value)}
                  className="input-field"
                  placeholder="e.g. Samsung"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={e => updateForm('model', e.target.value)}
                  className="input-field"
                  placeholder="e.g. Galaxy S23"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
              <button
                onClick={() => setStep(3)}
                className="btn-primary flex-1"
                disabled={!form.title || !form.description || !form.categoryId}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Price */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Set Your Price</h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Price *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => updateForm('price', e.target.value)}
                  className="input-field text-xl font-bold"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  value={form.currency}
                  onChange={e => updateForm('currency', e.target.value)}
                  className="input-field"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                checked={form.isNegotiable}
                onChange={e => updateForm('isNegotiable', e.target.checked)}
                className="rounded"
              />
              <div>
                <p className="text-sm font-medium">Price is negotiable</p>
                <p className="text-xs text-gray-500">Buyers can make offers</p>
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={e => updateForm('quantity', e.target.value)}
                  className="input-field"
                  min="1"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                checked={form.deliveryAvailable}
                onChange={e => updateForm('deliveryAvailable', e.target.checked)}
                className="rounded"
              />
              <div>
                <p className="text-sm font-medium">Delivery available</p>
                <p className="text-xs text-gray-500">I can deliver this item</p>
              </div>
            </label>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
              <button
                onClick={() => setStep(4)}
                className="btn-primary flex-1"
                disabled={!form.price}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Location</h2>
            <p className="text-sm text-gray-500">Where is this item located? Your exact address is never shown publicly.</p>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Province</label>
              <select
                value={form.locationProvince}
                onChange={e => updateForm('locationProvince', e.target.value)}
                className="input-field"
              >
                <option value="">Select province</option>
                {ZIMBABWE_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {cities.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">City</label>
                <select
                  value={form.locationCity}
                  onChange={e => updateForm('locationCity', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select city</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Area / Suburb</label>
              <input
                type="text"
                value={form.locationArea}
                onChange={e => updateForm('locationArea', e.target.value)}
                className="input-field"
                placeholder="e.g. Avondale, CBD, Borrowdale"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Contact Preference</label>
              <select
                value={form.contactPreference}
                onChange={e => updateForm('contactPreference', e.target.value)}
                className="input-field"
              >
                <option value="MESSAGE">In-app messages only</option>
                <option value="PHONE">Show phone number</option>
                <option value="BOTH">Messages and phone</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(3)} className="btn-secondary">Back</button>
              <button onClick={() => setStep(5)} className="btn-primary flex-1">Preview Listing</button>
            </div>
          </div>
        )}

        {/* Step 5: Preview */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Preview Your Listing</h2>

            <div className="card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                  {uploadedImages.length > 0 ? (
                    <span className="text-xs text-gray-500">{uploadedImages.length} photo(s)</span>
                  ) : (
                    <span className="text-xs text-gray-400">No photo</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{form.title || 'No title'}</h3>
                  <p className="text-[#0284C7] font-bold text-lg">
                    {CURRENCIES.find(c => c.code === form.currency)?.symbol || '$'}{parseFloat(form.price || '0').toLocaleString()}
                    {form.isNegotiable && <span className="text-xs text-gray-400 font-normal ml-1">(negotiable)</span>}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Category:</span> {categories.find(c => c.id === form.categoryId)?.name as string || '—'}</div>
                <div><span className="text-gray-500">Condition:</span> {CONDITIONS.find(c => c.value === form.condition)?.label}</div>
                <div><span className="text-gray-500">Location:</span> {[form.locationArea, form.locationCity, form.locationProvince].filter(Boolean).join(', ') || '—'}</div>
                <div><span className="text-gray-500">Delivery:</span> {form.deliveryAvailable ? 'Yes' : 'No'}</div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-3">{form.description}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Your listing will be reviewed before going live. This usually takes less than an hour.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(4)} className="btn-secondary">Back</button>
              <button onClick={() => handleSubmit('DRAFT')} className="btn-secondary flex-1" disabled={loading}>
                Save Draft
              </button>
              <button onClick={() => handleSubmit('PENDING')} className="btn-primary flex-1" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Publishing...
                  </span>
                ) : 'Publish Listing'}
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}