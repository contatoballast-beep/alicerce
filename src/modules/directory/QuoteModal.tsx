import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { UserProfile, SupplierProfile, ProfessionalProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { Plus, Trash2, Send, CheckCircle2, ShoppingCart, Loader2 } from 'lucide-react';

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
    { productName: '', quantity: 1, unit: 'un', notes: '' }
  ]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState(currentUser.city || 'São Paulo');
  const [state, setState] = useState(currentUser.state || 'SP');
  const [phone, setPhone] = useState(currentUser.phone || currentUser.whatsapp || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { productName: '', quantity: 1, unit: 'un', notes: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(it => it.productName.trim() !== '');
    if (validItems.length === 0) return;

    setLoading(true);

    await RealApiClient.createQuoteRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterPhone: phone,
      requesterWhatsapp: phone,
      supplierId: targetSupplier?.id,
      supplierName: targetSupplier?.name || targetProfessional?.name || 'Fornecedores Gerais',
      deliveryAddress,
      city,
      state,
      notes,
      items: validItems
    });

    setLoading(false);
    onSuccess();
    onClose();
  };

  const title = targetSupplier 
    ? `Cotar Materiais com ${targetSupplier.name}`
    : targetProfessional 
    ? `Solicitar Orçamento com ${targetProfessional.name}`
    : 'Nova Cotação de Materiais';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="560px">
      <form onSubmit={handleSubmit} className="form-wrap" style={{ padding: 0 }}>
        
        <div style={{ background: 'var(--paper)', border: '1px solid var(--steel-line)', padding: '10px 14px', borderRadius: '3px', marginBottom: '14px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingCart size={14} color="var(--accent)" /> Lista de Itens para Cotação
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--steel)', marginTop: '2px' }}>
            Adicione os materiais ou serviços necessários com quantidades estimadas.
          </div>
        </div>

        {/* Dynamic Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 70px 30px', gap: '6px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Ex: Cimento CP-II (saco 50kg)" 
                value={item.productName}
                onChange={e => handleItemChange(idx, 'productName', e.target.value)}
                required
                style={{ fontSize: '12px' }}
              />
              <input 
                type="number" 
                placeholder="Qtd" 
                min="1"
                value={item.quantity}
                onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                required
                style={{ fontSize: '12px' }}
              />
              <select 
                value={item.unit}
                onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                style={{ fontSize: '11px', padding: '8px 4px', border: '1px solid var(--steel-line)', borderRadius: '3px', background: 'var(--white)' }}
              >
                <option value="un">un</option>
                <option value="saco">sacos</option>
                <option value="m³">m³</option>
                <option value="m²">m²</option>
                <option value="kg">kg</option>
                <option value="ton">ton</option>
                <option value="barra">barras</option>
                <option value="diária">diárias</option>
              </select>
              {items.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => handleRemoveItem(idx)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--line)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button 
          type="button" 
          onClick={handleAddItem}
          className="btn ghost" 
          style={{ width: '100%', justifyContent: 'center', marginBottom: '14px', fontSize: '10.5px' }}
        >
          <Plus size={12} /> Adicionar Outro Item à Cotação
        </button>

        {/* Location & Contact */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
          <div className="field">
            <label>Endereço de Entrega / Obra</label>
            <input 
              type="text" 
              placeholder="Ex: Av. das Indústrias, 500" 
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Cidade</label>
            <input 
              type="text" 
              value={city}
              onChange={e => setCity(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>UF</label>
            <input 
              type="text" 
              value={state}
              onChange={e => setState(e.target.value)}
              maxLength={2}
              required
            />
          </div>
        </div>

        <div className="field">
          <label>WhatsApp / Telefone para Retorno da Proposta</label>
          <input 
            type="text" 
            placeholder="(11) 98765-4321" 
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Observações Adicionais / Prazo Desejado</label>
          <textarea 
            rows={2} 
            placeholder="Ex: Necessidade de descarga no local com caminhão munck até sexta-feira."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Enviar Solicitação de Cotação Real
        </button>
      </form>
    </Modal>
  );
};
