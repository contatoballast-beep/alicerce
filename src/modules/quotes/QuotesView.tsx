import React, { useState, useEffect } from 'react';
import { QuoteRequest, UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { Truck, CheckCircle2, Clock, MapPin, DollarSign, Plus, ChevronRight, Phone, FileText } from 'lucide-react';

interface QuotesViewProps {
  currentUser: UserProfile;
  onOpenNewQuote: () => void;
}

export const QuotesView: React.FC<QuotesViewProps> = ({ currentUser, onOpenNewQuote }) => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '20px',
        background: 'var(--bg-card)',
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            GESTÃO DE SUPRIMENTOS & INSUMOS
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.02em' }}>
            Cotações & Orçamentos ({quotes.length})
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Negociações diretas de materiais estruturais, cimento, aço e agregados.
          </p>
        </div>
        <button onClick={onOpenNewQuote} className="btn primary" style={{ padding: '10px 18px', fontSize: '13px' }}>
          <Plus size={15} /> Nova Cotação
        </button>
      </div>

      {/* Quotes List */}
      {quotes.length === 0 && !loading ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--bg-card)' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            background: 'var(--primary-bg)', 
            color: 'var(--primary-color)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px' 
          }}>
            <Truck size={28} />
          </div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '6px' }}>
            Nenhuma cotação em andamento
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Solicite orçamentos para sacos de cimento, blocos, areia, brita, aço ou formas diretamente com distribuidores cadastrados.
          </p>
          <button onClick={onOpenNewQuote} className="btn primary" style={{ margin: '0 auto', padding: '10px 20px' }}>
            <Plus size={14} /> Iniciar Primeira Cotação
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {quotes.map((q) => (
            <div key={q.id} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontFamily: 'var(--font-mono)', 
                      color: 'var(--text-muted)', 
                      background: 'var(--bg-subtle)', 
                      padding: '2px 6px', 
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)'
                    }}>
                      {q.id}
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      padding: '3px 8px', 
                      borderRadius: 'var(--radius-full)',
                      background: q.status === 'respondida' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(234, 88, 12, 0.12)',
                      color: q.status === 'respondida' ? '#059669' : 'var(--accent-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {q.status === 'respondida' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {q.status === 'respondida' ? 'Proposta Recebida' : 'Aguardando Fornecedor'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-heading)', margin: '4px 0 2px 0' }}>
                    Para: {q.supplierName || 'Fornecedores da Região'}
                  </h4>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="var(--primary-color)" /> {q.deliveryAddress}, {q.city} - {q.state}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {q.createdAt}
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div style={{ 
                marginTop: '14px', 
                background: 'var(--bg-subtle)', 
                padding: '12px 14px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)' 
              }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '8px' }}>
                  Itens Solicitados ({q.items?.length || 0}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {q.items?.map((it, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        fontSize: '11.5px', 
                        padding: '4px 10px', 
                        background: 'var(--bg-card)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        color: 'var(--text-body)'
                      }}
                    >
                      {it.quantity} {it.unit} de {it.productName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Response Details if available */}
              {q.responses && q.responses.length > 0 && (
                <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} color="var(--primary-color)" /> Proposta Comercial ({q.responses[0].supplierName}):
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                    gap: '10px', 
                    background: 'var(--primary-bg)', 
                    padding: '12px 16px', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(37, 99, 235, 0.15)'
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>PRODUTOS</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
                        R$ {q.responses[0].totalPrice.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>FRETE / DESCARGA</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
                        R$ {q.responses[0].shippingPrice.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>TOTAL GERAL</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary-color)', fontFamily: 'var(--font-mono)' }}>
                        R$ {q.responses[0].totalSum.toLocaleString('pt-BR')}
                      </div>
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
