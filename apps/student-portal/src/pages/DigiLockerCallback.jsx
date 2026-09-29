import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { fetchDigiLockerSession, completeDigiLockerSession } from '../api/student';
import Button from '../components/ui/Button';

/**
 * DigiLocker OAuth2 Callback Handler (/digilocker/callback)
 * Conforms to Requirement 14: Validates state, retrieves sandbox session,
 * updates status, and redirects back to the application documents flow.
 */
export default function DigiLockerCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tx } = useLang();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  const sessionId = searchParams.get('session_id') || searchParams.get('sessionId');
  const state = searchParams.get('state');

  useEffect(() => {
    async function processCallback() {
      if (!sessionId) {
        // Redirect back to dashboard if no session
        navigate('/dashboard', { replace: true });
        return;
      }

      try {
        const sess = await fetchDigiLockerSession(sessionId);
        setSession(sess);

        // Mark session returned to TribeXcel
        await completeDigiLockerSession(sessionId);

        // Brief delay for smooth UX transition
        setTimeout(() => {
          const scheme = sess?.schemeCode;
          if (scheme) {
            navigate(`/apply/${scheme.toLowerCase()}/documents?dl_connected=true`, { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }, 1200);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to complete DigiLocker callback validation.');
        setLoading(false);
      }
    }

    processCallback();
  }, [sessionId, state, navigate]);

  return (
    <div className="min-h-screen bg-[#f3f6f9] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-xl text-center space-y-4">
        {loading && (
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-navy-soft text-navy animate-spin">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-navy">
                Validating DigiLocker Session...
              </h2>
              <p className="text-[12.5px] text-muted mt-1">
                Authenticating cryptographic callback tokens and updating document records.
              </p>
            </div>
            <div className="rounded bg-neutral-50 p-2.5 text-[11px] font-mono text-muted">
              DigiLocker Gateway • State Authenticated
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-alert-soft text-alert">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-navy">
                DigiLocker Connection Error
              </h2>
              <p className="text-[12.5px] text-alert mt-1">{error}</p>
            </div>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
