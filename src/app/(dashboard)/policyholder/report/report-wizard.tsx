'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Cloud, Droplets, Flame, Home, Camera, CheckCircle2, ArrowRight, ArrowLeft, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PERILS = [
  { value: 'Hurricane', label: 'Hurricane / Wind', icon: Cloud, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'Water Damage', label: 'Water Damage', icon: Droplets, color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
  { value: 'Fire', label: 'Fire', icon: Flame, color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { value: 'Roof Damage', label: 'Roof Damage', icon: Home, color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { value: 'Structural', label: 'Structural', icon: Home, color: 'bg-amber-50 border-amber-200 text-amber-700' },
];
const STEPS = ['Location', 'Peril Type', 'Details & Photos', 'Review'];

export function ReportWizard({ profileId }: { profileId: string }) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [form, setForm] = useState({ addressLine1: '', city: '', state: 'FL', zip: '', latitude: 25.749, longitude: -80.259, perilType: '', description: '', photoUrls: [] as string[] });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);

  const upd = (f: string, v: string | number) => setForm((p) => ({ ...p, [f]: v }));

  function useLoc() {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setForm((f) => ({ ...f, latitude: p.coords.latitude, longitude: p.coords.longitude })); setGeoLoading(false); toast.success('Location detected'); },
      () => { setGeoLoading(false); toast.error('Could not get location'); }
    );
  }

  function addPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length > 6) return toast.error('Max 6 photos');
    const next = [...photoFiles, ...files];
    setPhotoFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  function removePhoto(i: number) {
    const next = photoFiles.filter((_, idx) => idx !== i);
    setPhotoFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }

  const canNext = step === 0 ? !!(form.addressLine1 && form.city && form.zip) : step === 1 ? !!form.perilType : step === 2 ? form.description.length >= 10 : true;

  async function submit() {
    startTransition(async () => {
      try {
        const urls: string[] = [];
        for (const file of photoFiles) {
          const fd = new FormData(); fd.append('file', file);
          const r = await fetch('/api/upload', { method: 'POST', body: fd });
          if (r.ok) { const d = await r.json(); urls.push(d.url); }
        }
        const res = await fetch('/api/claims', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, photoUrls: urls, profileId }) });
        if (res.ok) { const d = await res.json(); toast.success('Claim reported!'); router.push(`/policyholder/marketplace/${d.id}`); router.refresh(); }
        else { const e = await res.json(); toast.error(e.error || 'Failed'); }
      } catch { toast.error('Network error'); }
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-navy text-white' : 'bg-navy-100 text-navy-400'}`}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-navy' : 'text-navy-300'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-emerald-300' : 'bg-navy-100'}`} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="card p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-semibold text-navy">Property Location</h2>
          <div><label className="label">Street Address</label><input className="input" placeholder="1247 Alhambra Cir" value={form.addressLine1} onChange={(e) => upd('addressLine1', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">City</label><input className="input" placeholder="Coral Gables" value={form.city} onChange={(e) => upd('city', e.target.value)} /></div>
            <div><label className="label">ZIP Code</label><input className="input" placeholder="33134" value={form.zip} onChange={(e) => upd('zip', e.target.value)} maxLength={5} /></div>
          </div>
          <div><label className="label">State</label><input className="input bg-navy-50" value="Florida" disabled /></div>
          <button type="button" onClick={useLoc} className="btn-outline gap-2 text-sm" disabled={geoLoading}>
            {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />} Use My Current Location
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="card p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-semibold text-navy">What type of loss occurred?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PERILS.map((pt) => (
              <button key={pt.value} onClick={() => upd('perilType', pt.value)}
                className={`flex items-center gap-3 rounded-xl p-4 border-2 text-left transition-all ${form.perilType === pt.value ? `${pt.color} border-opacity-100 shadow-sm` : 'border-navy-100 bg-white hover:bg-navy-50/50'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${form.perilType === pt.value ? pt.color : 'bg-navy-50'}`}><pt.icon className="w-5 h-5" /></div>
                <span className="font-medium text-sm text-navy">{pt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-semibold text-navy">Describe the Damage</h2>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[120px] resize-y" placeholder="Describe the damage..." value={form.description} onChange={(e) => upd('description', e.target.value)} />
            <p className="text-xs text-navy-300 mt-1">{form.description.length} / 10 min characters</p>
          </div>
          <div>
            <label className="label">Photos (up to 6)</label>
            <div className="grid grid-cols-3 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-navy-50 border border-navy-100">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                </div>
              ))}
              {photoFiles.length < 6 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-navy-200 flex flex-col items-center justify-center cursor-pointer hover:bg-navy-50/50 transition-colors">
                  <Camera className="w-6 h-6 text-navy-300 mb-1" /><span className="text-xs text-navy-400">Add Photo</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={addPhotos} />
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card p-6 sm:p-8 space-y-5">
          <h2 className="text-lg font-semibold text-navy">Review Your Claim</h2>
          <div className="space-y-4 divide-y divide-navy-100/60">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-navy-400 text-xs">Address</span><p className="font-medium text-navy">{form.addressLine1}, {form.city}, FL {form.zip}</p></div>
              <div><span className="text-navy-400 text-xs">Peril Type</span><p className="font-medium text-navy">{form.perilType}</p></div>
            </div>
            <div className="pt-4 text-sm"><span className="text-navy-400 text-xs">Description</span><p className="font-medium text-navy mt-1">{form.description}</p></div>
            {previews.length > 0 && <div className="pt-4"><span className="text-navy-400 text-xs">Photos ({previews.length})</span><div className="flex gap-2 mt-2 overflow-x-auto">{previews.map((src, i) => <img key={i} src={src} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />)}</div></div>}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        {step > 0 ? <button onClick={() => setStep(step - 1)} className="btn-ghost gap-2"><ArrowLeft className="w-4 h-4" /> Back</button> : <div />}
        {step < 3 ? <button onClick={() => setStep(step + 1)} disabled={!canNext} className="btn-secondary gap-2">Next <ArrowRight className="w-4 h-4" /></button>
          : <button onClick={submit} disabled={isPending} className="btn-primary gap-2">{isPending && <Loader2 className="w-4 h-4 animate-spin" />}{isPending ? 'Submitting...' : 'Submit Claim'}</button>}
      </div>
    </div>
  );
}
