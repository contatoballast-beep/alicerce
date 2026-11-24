import React, { useState, useEffect } from 'react';
import { ReportItem, UserProfile, AdminMetrics } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { CheckCircle2, XCircle, ShieldCheck, Search, AlertTriangle, Loader2 } from 'lucide-react';

interface AdminDashboardViewProps {
  currentUser: UserProfile;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ currentUser }) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchUser, setSearchUser] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    const [mRes, uRes, rRes] = await Promise.all([
      RealApiClient.getAdminMetrics(),
      RealApiClient.getAdminUsers(),
      RealApiClient.getAdminReports(),
    ]);

    if (!mRes.ok) {
      setError(mRes.error || 'Acesso administrativo negado pelo servidor.');
      setLoading(false);
      return;
    }

    setMetrics(mRes.data || null);
    setUsersList(uRes.data?.items || []);
    setReports(rRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    void loadAdminData();
  }, [currentUser.id]);

  const handleToggleVerify = async (userId: string, verified: boolean) => {
    const res = await RealApiClient.verifyUser(userId, verified);
    if (res.ok) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_verified: verified ? 1 : 0, verification_status: verified ? 'verified' : 'unverified' } : u))
      );
    }
  };

  const handleResolveReport = async (reportId: string, status: 'aprovado' | 'removido') => {
    const res = await RealApiClient.resolveReport(reportId, status);
    if (res.ok) {
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      !searchUser ||
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchUser.toLowerCase())
  );

  if (loading) {
    return (
      <div className="ballast-container" style={{ paddingTop: '48px', textAlign: 'center' }}>
        <Loader2 size={26} className="animate-spin" color="#2F5872" style={{ margin: '0 auto 10px' }} />
        <p style={{ fontSize: '14px', color: 'var(--steel)' }}>Carregando painel administrativo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ballast-container" style={{ paddingTop: '36px' }}>
        <div role="alert" className="card" style={{ padding: '32px', textAlign: 'center', borderColor: '#FECDCA', background: 'var(--color-danger-light)' }}>
          <AlertTriangle size={28} color="#B42318" style={{ margin: '0 auto 10px' }} />
          <h2 style={{ fontSize: '22px', marginBottom: '6px' }}>Acesso administrativo indisponível</h2>
          <p style={{ fontSize: '14px', color: 'var(--grafite)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ballast-container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '22px' }}>
        <div className="meta-label" style={{ color: 'var(--azul-lastro)', marginBottom: '4px' }}>
          ADMINISTRAÇÃO E VERIFICAÇÃO DE CREDENCIAIS
        </div>
        <h1 style={{ fontSize: '30px' }}>Gestão Ballast Architecture</h1>
      </div>

      {/* Real Metrics (Zero fabricated fallback numbers) */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Usuários', value: metrics.totalUsers },
            { label: 'Profissionais', value: metrics.totalProfessionals },
            { label: 'Empresas', value: metrics.totalCompanies },
            { label: 'Demandas', value: metrics.totalOpportunities },
            { label: 'Avaliações', value: metrics.totalReviews },
            { label: 'Denúncias pendentes', value: metrics.pendingReports ?? 0 },
          ].map((m) => (
            <div key={m.label} className="card" style={{ padding: '16px' }}>
              <div className="meta-label">{m.label}</div>
              <div className="mono" style={{ fontSize: '24px', fontWeight: 700, marginTop: '6px', color: 'var(--grafite)' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users & Credential Verification */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>Validação de registros CAU / CREA</h2>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#546168" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="search"
              aria-label="Filtrar usuários"
              placeholder="Buscar nome ou e-mail..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              style={{ paddingLeft: '30px', width: '230px', fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--steel)' }}>
                <th style={{ padding: '10px 8px' }}>Nome</th>
                <th style={{ padding: '10px 8px' }}>E-mail</th>
                <th style={{ padding: '10px 8px' }}>Perfil</th>
                <th style={{ padding: '10px 8px' }}>Registro</th>
                <th style={{ padding: '10px 8px' }}>Status</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '10px 8px', color: 'var(--steel)' }}>{u.email}</td>
                  <td style={{ padding: '10px 8px' }}><span className="badge">{u.role}</span></td>
                  <td style={{ padding: '10px 8px' }} className="mono">{u.crea_cau_number || '—'}</td>
                  <td style={{ padding: '10px 8px' }}>
                    {u.is_verified ? (
                      <span className="badge verified"><ShieldCheck size={12} /> Verificado</span>
                    ) : u.crea_cau_number ? (
                      <span className="badge declared">Declarado</span>
                    ) : (
                      <span className="badge">Não verificado</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                    {u.is_verified ? (
                      <button type="button" onClick={() => handleToggleVerify(u.id, false)} className="btn ghost" style={{ minHeight: '32px', padding: '4px 10px', fontSize: '12px' }}>
                        Revogar
                      </button>
                    ) : (
                      <button type="button" onClick={() => handleToggleVerify(u.id, true)} className="btn primary" style={{ minHeight: '32px', padding: '4px 10px', fontSize: '12px' }}>
                        <CheckCircle2 size={12} /> Validar selo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real Reports Queue */}
      <div className="card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '14px' }}>
          Fila de denúncias ({reports.filter((r) => r.status === 'pendente').length} pendentes)
        </h2>

        {reports.length === 0 ? (
          <p style={{ fontSize: '13.5px', color: 'var(--steel)', margin: 0 }}>Nenhuma denúncia registrada.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reports.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '14px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="badge">{item.target_type}</span>
                    <strong>{item.reason}</strong>
                    <span className="badge">{item.status}</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--steel)', marginTop: '4px' }}>
                    Reportado por {item.reporter_name || item.reporter_id} · Alvo: {item.target_id}
                    {item.details ? ` · ${item.details}` : ''}
                  </div>
                </div>

                {item.status === 'pendente' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleResolveReport(item.id, 'aprovado')} className="btn ghost" style={{ minHeight: '34px', fontSize: '12px' }}>
                      <CheckCircle2 size={13} /> Arquivar
                    </button>
                    <button type="button" onClick={() => handleResolveReport(item.id, 'removido')} className="btn danger" style={{ minHeight: '34px', fontSize: '12px' }}>
                      <XCircle size={13} /> Marcar infração
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
