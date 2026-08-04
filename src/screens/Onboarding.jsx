import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bell, Sparkle, Sun } from 'lucide-react';
import { isIOS, isStandalone } from '../utils/helpers';

export default function Onboarding() {
  const { updateSettings } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const ios = isIOS();
  const standalone = isStandalone();

  const steps = [
    { icon: Sparkle, title: 'A small daily practice.', body: 'Two quiet rituals — a morning intention, and an evening reflection that gently returns to what you wrote.' },
    { icon: Sun, title: 'How it works', body: 'Morning sets the day. Evening closes the loop. Freeform is always open.' },
    ...((ios && !standalone) ? [{ icon: Bell, title: 'One note for iPhone', body: 'Reminders only arrive if added to Home Screen. Tap Share > Add to Home Screen.' }] : []),
    { icon: Bell, title: 'Quiet reminders', body: 'Would you like a small nudge in the morning and evening?' }
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleAction = async () => {
    if (isLast && permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
    if (isLast) {
      await updateSettings({ onboardingComplete: true });
      navigate('/');
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-safe pb-safe">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div key={step} className="fade-up">
          <div className="mb-10 flex justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
              <current.icon className="w-7 h-7" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-display text-[28px] mb-6 leading-tight">{current.title}</h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>{current.body}</p>
        </div>
      </div>
      <div className="max-w-md mx-auto w-full space-y-3">
        <div className="flex justify-center gap-1.5 mb-2">
          {steps.map((_, i) => (
            <div key={i} className="dot" style={{ background: i === step ? 'var(--accent)' : i < step ? 'var(--accent-soft)' : 'var(--border)', width: i === step ? 22 : 6 }} />
          ))}
        </div>
        <button onClick={handleAction} className="btn-primary w-full py-3.5 rounded-2xl font-medium">
          {isLast && permission === 'default' ? 'Allow reminders' : isLast ? 'Finish' : 'Continue'}
        </button>
        {!isLast && <button onClick={() => setStep(steps.length - 1)} className="btn-ghost w-full py-3 rounded-2xl text-sm">Skip for now</button>}
      </div>
    </div>
  );
}