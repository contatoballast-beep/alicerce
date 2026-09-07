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
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--line)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          CENTRAL DE FAVORITOS & SALVOS
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
          Meus Favoritos ({favorites.length})
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--steel)', marginTop: '2px' }}>
          Acesso rápido aos profissionais, empresas, fornecedores e oportunidades que você salvou.
        </p>
      </div>

      {favorites.length === 0 && !loading ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--paper)' }}>
          <Heart size={32} color="var(--steel)" style={{ margin: '0 auto 8px' }} />
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Nenhum item favoritado ainda</h4>
          <p style={{ fontSize: '12px', color: 'var(--steel)', marginTop: '4px' }}>
            Navegue pelo Catálogo ou pelas Oportunidades e clique no ícone de coração para salvar itens aqui.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {favorites.map((fav) => (
            <div key={fav.id} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="avatar" style={{ width: '36px', height: '36px' }}>
                  {fav.target_type === 'professional' ? <HardHat size={16} /> :
                   fav.target_type === 'company' ? <Building2 size={16} /> :
                   fav.target_type === 'supplier' ? <Truck size={16} /> : <Briefcase size={16} />}
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>{fav.target_title}</h4>
                  <div style={{ fontSize: '11px', color: 'var(--steel)' }}>{fav.target_subtitle || fav.target_type.toUpperCase()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => handleRemove(fav)} 
                  className="btn ghost" 
                  style={{ padding: '5px 8px', color: 'var(--line)', fontSize: '10px' }}
                  title="Remover dos favoritos"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
