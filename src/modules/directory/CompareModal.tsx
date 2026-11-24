import React from 'react';
import { Modal } from '../../components/Modal';
import { ProfessionalProfile } from '../../types';
import { formatAvailability } from '../../utils/compatibility';
import { ShieldCheck, Trash2, ArrowRight, FileText } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ProfessionalProfile[];
  onRemove: (prof: ProfessionalProfile) => void;
  onOpenProfile: (prof: ProfessionalProfile) => void;
  onRequestProposal: (prof: ProfessionalProfile) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemove,
  onOpenProfile,
  onRequestProposal,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Comparar arquitetos (${items.length}/3)`} maxWidth="880px">
      {items.length === 0 ? (
        <p style={{ fontSize: '14px', color: 'var(--steel)', textAlign: 'center', padding: '24px 0' }}>
          Selecione até 3 profissionais no catálogo para comparar especialidades, experiência, localização e disponibilidade.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '10px', width: '160px', color: 'var(--steel)', fontSize: '11.5px', textTransform: 'uppercase' }}>
                  Critério
                </th>
                {items.map((p) => (
                  <th key={p.id} style={{ textAlign: 'left', padding: '10px', minWidth: '190px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--grafite)' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--azul-lastro)', fontWeight: 600 }}>{p.specialty}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(p)}
                        aria-label={`Remover ${p.name} da comparação`}
                        style={{ background: 'none', border: 'none', color: 'var(--steel)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={labelCell}>Localização</td>
                {items.map((p) => (
                  <td key={p.id} style={valCell}>{p.city}, {p.state}</td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={labelCell}>Área de atuação</td>
                {items.map((p) => (
                  <td key={p.id} style={valCell}>{p.serviceArea || `${p.city}, ${p.state}`}</td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={labelCell}>Credencial</td>
                {items.map((p) => (
                  <td key={p.id} style={valCell}>
                    {p.isVerified ? (
                      <span className="badge verified"><ShieldCheck size={12} /> Verificado</span>
                    ) : p.creaCauNumber ? (
                      <span className="badge declared">Declarado: {p.creaCauNumber}</span>
                    ) : (
                      'Não informado'
                    )}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={labelCell}>Experiência</td>
                {items.map((p) => (
                  <td key={p.id} style={valCell}>{p.experienceYears ? `${p.experienceYears} anos` : 'Não informada'}</td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={labelCell}>Tipos de projeto</td>
                {items.map((p) => (
                  <td key={p.id} style={valCell}>{p.projectTypes?.length ? p.projectTypes.join(', ') : p.specialty}</td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={labelCell}>Estilos</td>
                {items.map((p) => (
                  <td key={p.id} style={valCell}>{p.styles?.length ? p.styles.join(', ') : '—'}</td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={labelCell}>Investimento</td>
                {items.map((p) => (
                  <td key={p.id} style={valCell}>{p.investmentRanges?.length ? p.investmentRanges.join(', ') : 'A combinar'}</td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={labelCell}>Disponibilidade</td>
                {items.map((p) => (
                  <td key={p.id} style={valCell}>{formatAvailability(p.availability).label}</td>
                ))}
              </tr>
              <tr>
                <td style={labelCell}>Ações</td>
                {items.map((p) => (
                  <td key={p.id} style={valCell}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn primary"
                        style={{ width: '100%', minHeight: '34px', fontSize: '12.5px', padding: '6px 10px' }}
                        onClick={() => {
                          onClose();
                          onRequestProposal(p);
                        }}
                      >
                        <FileText size={13} /> Solicitar proposta
                      </button>
                      <button
                        type="button"
                        className="btn ghost"
                        style={{ width: '100%', minHeight: '34px', fontSize: '12.5px', padding: '6px 10px' }}
                        onClick={() => {
                          onClose();
                          onOpenProfile(p);
                        }}
                      >
                        Ver perfil <ArrowRight size={13} />
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};

const labelCell: React.CSSProperties = {
  padding: '10px',
  fontWeight: 600,
  color: 'var(--steel)',
  fontSize: '12.5px',
  verticalAlign: 'top',
};

const valCell: React.CSSProperties = {
  padding: '10px',
  color: 'var(--grafite)',
  verticalAlign: 'top',
};
