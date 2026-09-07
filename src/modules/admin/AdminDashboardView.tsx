import React, { useState, useEffect } from 'react';
import { ModerationItem, UserProfile, AdminMetrics } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { ShieldAlert, Users, Briefcase, CheckCircle2, XCircle, Building2, Truck, FileText, Star, Loader2 } from 'lucide-react';

interface AdminDashboardViewProps {
  moderationItems: ModerationItem[];
  currentUser: UserProfile;
  onResolveItem: (itemId: string, status: 'aprovado' | 'removido') => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  moderationItems,
  currentUser,
  onResolveItem,
}) => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    const [m, u] = await Promise.all([
      RealApiClient.getAdminMetrics(),
      RealApiClient.getAdminUsers(),
    ]);
    setMetrics(m);
    setUsersList(u);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerify = async (userId: string) => {
    await RealApiClient.verifyUser(userId);
    setUsersList(usersList.map(u => u.id === userId ? { ...u, is_verified: 1 } : u));
  };

  const filteredUsers = usersList.filter(u => 
    !searchUser || 
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '20px 16px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--line)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          PAINEL ADMINISTRATIVO & AUDITORIA RBAC
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
          Gestão Central ALICERCE
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--steel)', marginTop: '2px' }}>
          Métricas de rede em tempo real, verificação de profissionais e controle de moderação.
        </p>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '16px' }}>
        <div className="card" style={{ padding: '12px', background: 'var(--paper)' }}>
          <div className="mono" style={{ fontSize: '9px', color: 'var(--steel)', textTransform: 'uppercase' }}>Usuários Totais</div>
          <div className="mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>{metrics?.totalUsers || usersList.length}</div>
        </div>
        <div className="card" style={{ padding: '12px', background: 'var(--paper)' }}>
          <div className="mono" style={{ fontSize: '9px', color: 'var(--steel)', textTransform: 'uppercase' }}>Profissionais</div>
          <div className="mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)' }}>{metrics?.totalProfessionals || 2}</div>
        </div>
        <div className="card" style={{ padding: '12px', background: 'var(--paper)' }}>
          <div className="mono" style={{ fontSize: '9px', color: 'var(--steel)', textTransform: 'uppercase' }}>Construtoras</div>
          <div className="mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--line)' }}>{metrics?.totalCompanies || 1}</div>
        </div>
        <div className="card" style={{ padding: '12px', background: 'var(--paper)' }}>
          <div className="mono" style={{ fontSize: '9px', color: 'var(--steel)', textTransform: 'uppercase' }}>Fornecedores</div>
          <div className="mono" style={{ fontSize: '20px', fontWeight: 700, color: '#059669' }}>{metrics?.totalSuppliers || 1}</div>
        </div>
        <div className="card" style={{ padding: '12px', background: 'var(--paper)' }}>
          <div className="mono" style={{ fontSize: '9px', color: 'var(--steel)', textTransform: 'uppercase' }}>Oportunidades</div>
          <div className="mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--graphite)' }}>{metrics?.totalOpportunities || 1}</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Controle de Usuários & Verificação CREA/CAU/CNPJ</h3>
          <input 
            type="text" 
            placeholder="Filtrar por nome, e-mail ou perfil..."
            value={searchUser}
            onChange={e => setSearchUser(e.target.value)}
            style={{ fontSize: '11px', padding: '5px 10px', width: '220px' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--steel-line)', textAlign: 'left', color: 'var(--steel)' }}>
                <th style={{ padding: '6px' }}>Nome</th>
                <th style={{ padding: '6px' }}>E-mail</th>
                <th style={{ padding: '6px' }}>Perfil</th>
                <th style={{ padding: '6px' }}>Cidade</th>
                <th style={{ padding: '6px' }}>Status</th>
                <th style={{ padding: '6px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--steel-line)' }}>
                  <td style={{ padding: '8px 6px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '8px 6px', color: 'var(--steel)' }}>{u.email}</td>
                  <td style={{ padding: '8px 6px' }}>
                    <span className="chip on" style={{ fontSize: '9px', padding: '2px 6px' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '8px 6px', color: 'var(--steel)' }}>{u.city}/{u.state}</td>
                  <td style={{ padding: '8px 6px' }}>
                    {u.is_verified ? (
                      <span className="stamp-badge accent" style={{ fontSize: '8.5px' }}>✓ Verificado</span>
                    ) : (
                      <span className="stamp-badge warn" style={{ fontSize: '8.5px' }}>Pendente</span>
                    )}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                    {!u.is_verified && (
                      <button 
                        onClick={() => handleVerify(u.id)}
                        className="btn primary" 
                        style={{ padding: '3px 8px', fontSize: '9.5px' }}
                      >
                        <CheckCircle2 size={10} /> Aprovar Selo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="card" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>
          Fila de Moderação de Conteúdo ({moderationItems.filter(i => i.status === 'pendente').length} pendentes)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {moderationItems.map(item => (
            <div key={item.id} style={{ padding: '10px', background: 'var(--paper)', border: '1px solid var(--steel-line)', borderRadius: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="tag warn" style={{ fontSize: '8.5px' }}>{item.type.toUpperCase()}</span>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--ink)' }}>{item.title}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--steel)', marginTop: '2px' }}>
                  Autor: {item.authorName} • Motivo: {item.reason} ({item.reportsCount} denúncias)
                </div>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={() => onResolveItem(item.id, 'aprovado')}
                  className="btn ghost" 
                  style={{ padding: '4px 8px', fontSize: '10px', color: '#059669' }}
                >
                  <CheckCircle2 size={12} /> Manter
                </button>
                <button 
                  onClick={() => onResolveItem(item.id, 'removido')}
                  className="btn ghost" 
                  style={{ padding: '4px 8px', fontSize: '10px', color: 'var(--line)' }}
                >
                  <XCircle size={12} /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
