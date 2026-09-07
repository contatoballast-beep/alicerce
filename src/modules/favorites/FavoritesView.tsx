import React, { useState, useEffect } from 'react';
import { FavoriteItem, UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { Heart, Trash2, ExternalLink, HardHat, Building2, Truck, Briefcase } from 'lucide-react';

interface FavoritesViewProps {
  currentUser: UserProfile;
  onOpenItem: (favorite: FavoriteItem) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ currentUser, onOpenItem }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    setLoading(true);
    const favs = await RealApiClient.getFavorites(currentUser.id);
    setFavorites(favs);
    setLoading(false);
  };

  useEffect(() => {
    loadFavorites();
  }, [currentUser.id]);

  const handleRemove = async (fav: FavoriteItem) => {
    await RealApiClient.toggleFavorite({
      userId: currentUser.id,
      targetType: fav.target_type,
      targetId: fav.target_id,
      targetTitle: fav.target_title,
    });
    setFavorites(favorites.filter(f => f.id !== fav.id));
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px' }}>
      
      <div style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '20px 24px', 
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          CENTRAL DE SALVOS & FAVORITOS
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-heading)', margin: 0, letterSpacing: '-0.02em' }}>
          Meus Favoritos ({favorites.length})
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Acesso rápido aos engenheiros, construtoras, distribuidores e demandas de obra que você favoritou.
        </p>
      </div>

      {favorites.length === 0 && !loading ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--bg-card)' }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            background: 'rgba(234, 88, 12, 0.1)', 
            color: 'var(--accent-color)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px' 
          }}>
            <Heart size={28} />
          </div>
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '6px' }}>
            Nenhum item favoritado ainda
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>
            Navegue pelo Catálogo Técnico ou pelas Oportunidades de Obra e clique no ícone de coração para salvar perfis e demandas.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {favorites.map((fav) => (
            <div key={fav.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'var(--primary-bg)', 
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {fav.target_type === 'professional' ? <HardHat size={20} /> :
                   fav.target_type === 'company' ? <Building2 size={20} /> :
                   fav.target_type === 'supplier' ? <Truck size={20} /> : <Briefcase size={20} />}
                </div>
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-heading)', margin: '0 0 2px 0' }}>{fav.target_title}</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{fav.target_subtitle || fav.target_type.toUpperCase()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleRemove(fav)} 
                  className="btn ghost" 
                  style={{ padding: '6px 10px', color: '#EF4444', fontSize: '11px' }}
                  title="Remover dos favoritos"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
