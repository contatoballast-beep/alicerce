import React, { useState, useEffect } from 'react';
import { QuoteRequest, UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { Truck, CheckCircle2, Clock, MapPin, Plus, AlertTriangle } from 'lucide-react';

interface QuotesViewProps {
  currentUser: UserProfile;
  onOpenNewQuote: () => void;
  onRequireAuth: () => void;
}

export const QuotesView: React.FC<QuotesViewProps> = ({ currentUser, onOpenNewQuote, onRequireAuth }) => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isGuest = !currentUser || currentUser.id === 'usr_guest';

  useEffect(() => {
    if (isGuest) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      const res = await RealApiClient.getQuoteRequests();
      if (res.ok && res.data) setQuotes(res.data.items || []);
      else setError(res.error || 'Erro ao carregar cotações.');
      setLoading(false);
    };
    void load();
  }, [currentUser.id, isGuest]);

  return (
    <div className="ballast-container" style={{ maxWidth: '820px', paddingTop: '32px', paddingBottom: '56px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div className="meta-label" style={{ color: 'var(--azul-lastro)', marginBottom: '4px' }}>COTAÇÕES PRIVADAS</div>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Minhas cotações ({quotes.length})</h1>
        </div>
        {!isGuest && (
          <button type="button" onClick={onOpenNewQuote} className="btn primary">
            <Plus size={15} /> Nova cotação
          </button>
        )}
      </div>

      {isGuest ? (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--steel)', marginBottom: '16px' }}>
            Cotações contêm endereços e dados comerciais protegidos. Entre na sua conta para visualizar ou enviar solicitações.
          </p>
          <button type="button" onClick={onRequireAuth} className="btn primary">Entrar na conta</button>
        </div>
      ) : error ? (
        <div role="alert" className="card" style={{ padding: '24px', borderColor: '#FECDCA', background: 'var(--color-danger-light)', color: 'var(--color-danger)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      ) : loading ? (
        <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--steel)' }}>Carregando suas cotações...</div>
      ) : quotes.length === 0 ? (
        <div className="card" style={{ padding: '44px 24px', textAlign: 'center' }}>
          <Truck size={30} color="#2F5872" style={{ margin: '0 auto 10px' }} />
          <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>Nenhuma cotação registrada</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--steel)', marginBottom: '18px' }}>
            Suas cotações ficam visíveis apenas para você e para o fornecedor autorizado.
          </p>
          <button type="button" onClick={onOpenNewQuote} className="btn primary">
            <Plus size={14} /> Iniciar cotação
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {quotes.map((q) => (
            <div key={q.id} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span className={`badge ${q.status === 'respondida' ? 'verified' : ''}`}>
                    {q.status === 'respondida' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {q.status === 'respondida' ? 'Respondida' : 'Aberta'}
                  </span>
                  <h3 style={{ fontSize: '18px', marginTop: '6px' }}>{q.supplierName || 'Fornecedor'}</h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--steel)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {q.deliveryAddress}, {q.city}/{q.state}
                  </div>
                </div>
                <div className="mono" style={{ fontSize: '11.5px', color: 'var(--steel)' }}>
                  {new Date(q.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {q.items?.map((it, idx) => (
                  <span key={idx} className="badge">{it.quantity} {it.unit} · {it.productName}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
