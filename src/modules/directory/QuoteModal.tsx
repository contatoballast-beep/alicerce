import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile, SupplierProfile, ProfessionalProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { Plus, Trash2, Send, Loader2, AlertCircle } from 'lucide-react';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSupplier?: SupplierProfile | null;
  targetProfessional?: ProfessionalProfile | null;
  currentUser: UserProfile;
  onSuccess: () => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  targetSupplier,
  targetProfessional,
  currentUser,
  onSuccess,
}) => {
  const [items, setItems] = useState<Array<{ productName: string; quantity: number; unit: string; notes?: string }>>([
    { productName: '', quantity: 1, unit: 'un', notes: '' },
  ]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState(currentUser.city || '');
  const [state, setState] = useState(currentUser.state || 'SP');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => setItems([...items, { productName: '', quantity: 1, unit: 'un', notes: '' }]);
  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };
  const handleItemChange = (idx: number, field: string, value: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validItems = items.filter((it) => it.productName.trim() !== '');
    if (validItems.length === 0 || !deliveryAddress.trim()) {
      setError('Informe o endereço da obra e ao menos um item.');
      return;
    }

    setLoading(true);
    const res = await RealApiClient.createQuoteRequest({
      requesterPhone: phone.trim() || undefined,
      requesterWhatsapp: phone.trim() || undefined,
      supplierId: targetSupplier?.id,
      supplierName: targetSupplier?.name || targetProfessional?.name || 'Fornecedor',
      deliveryAddress: deliveryAddress.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      notes: notes.trim(),
      items: validItems,
    });
    setLoading(false);

    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Erro ao enviar solicitação de cotação.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Solicitar Cotação de Materiais" maxWidth="580px">
      <form onSubmit={handleSubmit} className="form-wrap">
        {error && (
          <div role="alert" style={{ background: 'var(--color-danger-light)', border: '1px solid #FECDCA', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 32px', gap: '8px', alignItems: 'center' }}>
              <input type="text" placeholder="Material / especificação" value={item.productName} onChange={(e) => handleItemChange(idx, 'productName', e.target.value)} required />
              <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))} required />
              <select value={item.unit} onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}>
                <option value="un">un</option>
                <option value="m²">m²</option>
                <option value="m³">m³</option>
                <option value="saco">saco</option>
                <option value="kg">kg</option>
              </select>
              {items.length > 1 ? (
                <button type="button" onClick={() => handleRemoveItem(idx)} aria-label="Remover item" style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}>
                  <Trash2 size={15} />
                </button>
              ) : <div />}
            </div>
          ))}
        </div>

        <button type="button" onClick={handleAddItem} className="btn ghost" style={{ width: '100%', marginBottom: '14px' }}>
          <Plus size={14} /> Adicionar item
        </button>

        <div className="field">
          <label htmlFor="quote-addr">Endereço de entrega *</label>
          <input id="quote-addr" type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required />
        </div>

        <div className="responsive-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
          <div className="field">
            <label htmlFor="quote-city">Cidade *</label>
            <input id="quote-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="quote-state">UF *</label>
            <input id="quote-state" type="text" maxLength={2} value={state} onChange={(e) => setState(e.target.value.toUpperCase())} required />
          </div>
        </div>

        <div className="field">
          <label htmlFor="quote-phone">Telefone para contato (privado)</label>
          <input id="quote-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="quote-notes">Observações</label>
          <textarea id="quote-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button type="submit" disabled={loading} className="btn primary" style={{ width: '100%' }}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Enviar cotação
        </button>
      </form>
    </Modal>
  );
};
