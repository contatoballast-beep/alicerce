import React, { useState, useEffect } from 'react';
import { ModerationItem, UserProfile, AdminMetrics } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { ShieldAlert, Users, Briefcase, CheckCircle2, XCircle, Building2, Truck, FileText, Star, Loader2, ShieldCheck, Search } from 'lucide-react';

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
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Title */}
      <div style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '20px 24px', 
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          PAINEL ADMINISTRATIVO & AUDITORIA RBAC
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.02em' }}>
          Gestão Central ALICERCE
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Métricas operacionais da rede, auditoria de verificação de registros CREA/CAU e moderação.
        </p>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Usuários Totais</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>{metrics?.totalUsers || usersList.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Cadastros na base</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Profissionais</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-color)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>{metrics?.totalProfessionals || 2}</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-color)', fontWeight: 600, marginTop: '2px' }}>Engenheiros & Arq.</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Construtoras</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-color)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>{metrics?.totalCompanies || 1}</div>
          <div style={{ fontSize: '11px', color: 'var(--primary-color)', fontWeight: 600, marginTop: '2px' }}>PJ Cadastradas</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fornecedores</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>{metrics?.totalSuppliers || 1}</div>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>Distribuidores</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Oportunidades</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>{metrics?.totalOpportunities || 1}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Demandas ativas</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', margin: 0 }}>
              Controle de Usuários & Verificação CREA / CAU / CNPJ
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Aprovação de selos de chancela técnica oficial para novos cadastros.
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Filtrar por nome ou e-mail..."
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
              style={{ fontSize: '12px', padding: '6px 12px 6px 30px', width: '220px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 8px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Nome</th>
                <th style={{ padding: '10px 8px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>E-mail</th>
                <th style={{ padding: '10px 8px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Perfil</th>
                <th style={{ padding: '10px 8px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Cidade</th>
                <th style={{ padding: '10px 8px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '10px 8px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--text-heading)' }}>{u.name}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 600, 
                      padding: '2px 8px', 
                      background: 'var(--bg-subtle)', 
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-body)'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{u.city}/{u.state}</td>
                  <td style={{ padding: '12px 8px' }}>
                    {u.is_verified ? (
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        padding: '3px 8px', 
                        borderRadius: 'var(--radius-full)', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        color: '#059669',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <ShieldCheck size={12} /> Verificado
                      </span>
                    ) : (
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        padding: '3px 8px', 
                        borderRadius: 'var(--radius-full)', 
                        background: 'rgba(234, 88, 12, 0.1)', 
                        color: 'var(--accent-color)' 
                      }}>
                        Pendente
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    {!u.is_verified && (
                      <button 
                        onClick={() => handleVerify(u.id)}
                        className="btn primary" 
                        style={{ padding: '5px 10px', fontSize: '11px' }}
                      >
                        <CheckCircle2 size={12} /> Aprovar Selo
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
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 12px 0' }}>
          Fila de Moderação de Conteúdo ({moderationItems.filter(i => i.status === 'pendente').length} pendentes)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {moderationItems.map(item => (
            <div key={item.id} style={{ 
              padding: '14px 16px', 
              background: 'var(--bg-subtle)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '10.5px', 
                    fontWeight: 700, 
                    padding: '2px 6px', 
                    borderRadius: 'var(--radius-sm)', 
                    background: 'rgba(234, 88, 12, 0.1)', 
                    color: 'var(--accent-color)' 
                  }}>
                    {item.type.toUpperCase()}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-heading)' }}>{item.title}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Autor: {item.authorName} • Motivo: {item.reason} ({item.reportsCount} denúncias)
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => onResolveItem(item.id, 'aprovado')}
                  className="btn ghost" 
                  style={{ padding: '6px 12px', fontSize: '11.5px', color: '#059669' }}
                >
                  <CheckCircle2 size={13} /> Manter
                </button>
                <button 
                  onClick={() => onResolveItem(item.id, 'removido')}
                  className="btn ghost" 
                  style={{ padding: '6px 12px', fontSize: '11.5px', color: '#EF4444' }}
                >
                  <XCircle size={13} /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
