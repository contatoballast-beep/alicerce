import React, { useState, useEffect } from 'react';
import { QuoteRequest, UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { Truck, CheckCircle2, Clock, MapPin, DollarSign, Plus, ChevronRight, Phone } from 'lucide-react';

interface QuotesViewProps {
  currentUser: UserProfile;
  onOpenNewQuote: () => void;
}

export const QuotesView: React.FC<QuotesViewProps> = ({ currentUser, onOpenNewQuote }) => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

  const loadQuotes = async () => {
    setLoading(true);
    const filter = currentUser.role === 'fornecedor' ? { supplierId: currentUser.id } : { userId: currentUser.id };
    const data = await RealApiClient.getQuoteRequests(filter);
    setQuotes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadQuotes();
  }, [currentUser.id, currentUser.role]);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px 16px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--line)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            GESTÃO DE COTAÇÕES DE MATERIAIS
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
            Cotações & Orçamentos ({quotes.length})
          </h2>
        </div>
        <button onClick={onOpenNewQuote} className="btn primary" style={{ fontSize: '10.5px' }}>
          <Plus size={13} /> Nova Cotação
        </button>
      </div>

      {/* Quotes List */}
      {quotes.length === 0 && !loading ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--paper)' }}>
          <Truck size={32} color="var(--steel)" style={{ margin: '0 auto 8px' }} />
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Nenhuma cotação em andamento</h4>
          <p style={{ fontSize: '12px', color: 'var(--steel)', marginTop: '4px', marginBottom: '14px' }}>
            Solicite orçamentos para sacos de cimento, blocos, areia, brita ou aço diretamente com distribuidores.
          </p>
          <button onClick={onOpenNewQuote} className="btn primary" style={{ margin: '0 auto' }}>
            Iniciar Primeira Cotação
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {quotes.map((q) => (
            <div key={q.id} className="card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mono" style={{ fontSize: '10.5px', color: 'var(--steel)' }}>{q.id}</span>
                    <span className={`tag ${q.status === 'respondida' ? 'accent' : 'warn'}`} style={{ fontSize: '9px', textTransform: 'uppercase' }}>
                      {q.status === 'respondida' ? '✓ Proposta Recebida' : 'Aguardando Fornecedor'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
                    Para: {q.supplierName || 'Fornecedores da Região'}
                  </h4>
                  <div style={{ fontSize: '11px', color: 'var(--steel)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={11} /> {q.deliveryAddress}, {q.city} - {q.state}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: '10px', color: 'var(--steel)' }}>{q.createdAt}</div>
                </div>
              </div>

              {/* Items Summary */}
              <div style={{ marginTop: '10px', background: 'var(--paper)', padding: '8px 10px', borderRadius: '3px', border: '1px solid var(--steel-line)' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--steel)', fontWeight: 600, marginBottom: '4px' }}>
                  Itens Solicitados ({q.items?.length || 0}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {q.items?.map((it, idx) => (
                    <span key={idx} className="chip on" style={{ fontSize: '9.5px', padding: '2px 6px' }}>
                      {it.quantity} {it.unit} de {it.productName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Response Details if available */}
              {q.responses && q.responses.length > 0 && (
                <div style={{ marginTop: '10px', borderTop: '1px dashed var(--steel-line)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '4px' }}>
                    Proposta do Fornecedor ({q.responses[0].supplierName}):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', background: 'var(--paper)', padding: '8px', borderRadius: '3px' }}>
                    <div>
                      <div className="mono" style={{ fontSize: '9px', color: 'var(--steel)' }}>PRODUTOS</div>
                      <div className="mono" style={{ fontSize: '11px', fontWeight: 600 }}>R$ {q.responses[0].totalPrice.toLocaleString('pt-BR')}</div>
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: '9px', color: 'var(--steel)' }}>FRETE</div>
                      <div className="mono" style={{ fontSize: '11px', fontWeight: 600 }}>R$ {q.responses[0].shippingPrice.toLocaleString('pt-BR')}</div>
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: '9px', color: 'var(--steel)' }}>TOTAL GERAL</div>
                      <div className="mono" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--line)' }}>R$ {q.responses[0].totalSum.toLocaleString('pt-BR')}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
