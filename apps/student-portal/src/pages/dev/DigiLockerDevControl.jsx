import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  RefreshCw,
  Sliders,
  Server,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { fetchDigiLockerScenarios, setDigiLockerScenario } from '../../api/student';

/**
 * Developer Sandbox Control Panel (/dev/digilocker)
 * Conforms to Requirement 12: Not exposed in normal navigation.
 * Allows switching backend simulation scenarios to test every positive and negative branch.
 */
export default function DigiLockerDevControl() {
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState('SUCCESS');
  const [statusMessage, setStatusMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadScenarios = async () => {
    setLoading(true);
    try {
      const res = await fetchDigiLockerScenarios();
      if (res.success) {
        setScenarios(res.availableScenarios || []);
        setActiveScenario(res.currentScenario || 'SUCCESS');
      }
    } catch (err) {
      setStatusMessage('Unable to connect to backend DigiLocker service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  const handleSelectScenario = async (scenarioId) => {
    setUpdating(true);
    setStatusMessage('');
    try {
      const res = await setDigiLockerScenario(scenarioId);
      if (res.success) {
        setActiveScenario(scenarioId);
        setStatusMessage(`Active sandbox scenario set to: ${scenarioId}`);
      }
    } catch (err) {
      setStatusMessage('Failed to update sandbox scenario.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f9] text-ink">
      {/* Top Banner */}
      <header className="border-b border-[#0f3460]/20 bg-[#0f284e] px-6 py-4 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-[17px] font-bold tracking-tight text-white">
                  DigiLocker Sandbox Control Panel
                </h1>
                <span className="rounded bg-amber-400/25 px-2 py-0.5 text-[10px] font-semibold text-amber-200 border border-amber-400/30">
                  DEVELOPER ROUTE
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80">
                Simulate OAuth2, OTP, Consent, and Error Conditions without live government credentials
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/apply/nfst/documents"
              className="inline-flex items-center gap-1.5 rounded bg-white px-3 py-1.5 text-[12.5px] font-semibold text-navy hover:bg-neutral-100 shadow-xs"
            >
              Open Application Flow <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl p-6 space-y-6">
        {/* Notice Banner */}
        <div className="rounded border border-amber-300/60 bg-amber-50/80 p-4 text-[13px] text-amber-900 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-950">
              Developer Only Environment Control
            </p>
            <p className="text-[12px] text-amber-800/90 mt-0.5">
              This panel configures the backend state machine behavior in{' '}
              <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">DigiLockerSandboxProvider</code>.
              Selecting a scenario immediately modifies how subsequent authorization sessions behave.
            </p>
          </div>
        </div>

        {statusMessage && (
          <Alert tone="success" title="Scenario Updated">
            {statusMessage}
          </Alert>
        )}

        {/* Active Scenario Card */}
        <div className="rounded-lg border border-line bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-navy" />
              <div>
                <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">
                  Active Simulation Scenario
                </span>
                <p className="text-[18px] font-serif font-bold text-navy">
                  {scenarios.find((s) => s.id === activeScenario)?.label || activeScenario}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={loadScenarios}
              loading={loading}
            >
              Refresh State
            </Button>
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="space-y-3">
          <h2 className="text-[15px] font-bold text-navy">Select Scenario to Simulate</h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((sc) => {
              const isActive = sc.id === activeScenario;
              const isErrorType = sc.id !== 'SUCCESS';

              return (
                <div
                  key={sc.id}
                  className={`rounded-lg border p-4 transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-navy bg-navy-soft/30 ring-1 ring-navy'
                      : 'border-line bg-white hover:border-navy/40 hover:bg-neutral-50/70'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          sc.id === 'SUCCESS'
                            ? 'bg-leaf-soft text-leaf border border-leaf/30'
                            : 'bg-alert-soft text-alert border border-alert/30'
                        }`}
                      >
                        {sc.id === 'SUCCESS' ? 'Nominal / Happy Path' : 'Negative Branch'}
                      </span>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-navy">
                          <CheckCircle2 className="h-3.5 w-3.5 text-navy" /> Active
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-ink text-[14px]">{sc.label}</h3>
                    <p className="text-[12px] text-muted leading-relaxed">{sc.description}</p>
                  </div>

                  <div className="pt-4">
                    <Button
                      size="sm"
                      variant={isActive ? 'primary' : 'secondary'}
                      className="w-full justify-center"
                      onClick={() => handleSelectScenario(sc.id)}
                      disabled={isActive || updating}
                    >
                      {isActive ? 'Current Scenario' : 'Activate Scenario'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sandbox Student Dataset Reference */}
        <div className="rounded-lg border border-line bg-white p-5 space-y-3 shadow-xs">
          <h2 className="text-[15px] font-bold text-navy flex items-center gap-2">
            <FileCheck2 className="h-4 w-4" /> Deterministic Sandbox Student Dataset
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12.5px]">
            <div className="p-2.5 rounded border border-line bg-paper">
              <span className="block text-muted text-[11px]">STUDENT NAME</span>
              <span className="font-semibold text-ink">Arjun Kumar</span>
            </div>
            <div className="p-2.5 rounded border border-line bg-paper">
              <span className="block text-muted text-[11px]">DATE OF BIRTH</span>
              <span className="font-semibold text-ink">15/08/2005</span>
            </div>
            <div className="p-2.5 rounded border border-line bg-paper">
              <span className="block text-muted text-[11px]">REGISTERED MOBILE</span>
              <span className="font-mono font-semibold text-ink">98XXXXXX42</span>
            </div>
            <div className="p-2.5 rounded border border-line bg-paper">
              <span className="block text-muted text-[11px]">SANDBOX OTP</span>
              <span className="font-mono font-bold text-navy">123456</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
