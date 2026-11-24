import React, { useState, useEffect } from 'react';
import { FavoriteItem, ProfessionalProfile, UserProfile } from '../../types';
import { RealApiClient } from '../../services/realApiClient';
import { Heart, Trash2, Scale, ArrowRight, Compass, AlertTriangle } from 'lucide-react';

interface FavoritesViewProps {
  currentUser: UserProfile;
  compareList: ProfessionalProfile[];
  onOpenCompare: () => void;
  onRemoveCompare: (prof: ProfessionalProfile) => void;
  onOpenArchitectById: (id: string) => void;
  onExploreCatalog: () => void;
  onRequireAuth: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  currentUser,
  compareList,
  onOpenCompare,
  onRemoveCompare,
  onOpenArchitectById,
  onExploreCatalog,
  onRequireAuth,
}) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGuest = !currentUser || currentUser.id === 'usr_guest';

  useEffect(() => {
    if (isGuest) {
      setFavorites([]);
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      const res = await RealApiClient.getFavorites();
      if (res.ok && res.data) setFavorites(res.data);
      else setError(res.error || 'Erro ao carregar seus favoritos.');
      setLoading(false);
    };
    void load();
  }, [currentUser.id, isGuest]);

  const handleRemoveFav = async (fav: FavoriteItem) => {
    const res = await RealApiClient.toggleFavorite({
      targetType: fav.target_type,
      targetId: fav.target_id,
      targetTitle: fav.target_title,
    });
    if (res.ok) {
      setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
    }
  };

  return (
    <div className="ballast-container" style={{ maxWidth: '860px', paddingTop: '32px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div className="meta-label" style={{ color: 'var(--azul-lastro)', marginBottom: '6px' }}>
          SELEÇÃO PESSOAL
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)' }}>Salvos e comparação</h1>
      </div>

      {/* Comparison Shortlist Card */}
      <section className="card" style={{ padding: '22px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '22px', margin: 0 }}>Lista de comparação ({compareList.length}/3)</h2>
            <p style={{ fontSize: '13.5px', color: 'var(--steel)', margin: '4px 0 0 0' }}>
              Compare lado a lado especialidades, localização, credenciais e disponibilidade antes de entrar em contato.
            </p>
          </div>
          {compareList.length >= 2 && (
            <button type="button" onClick={onOpenCompare} className="btn primary">
              <Scale size={15} /> Comparar lado a lado
            </button>
          )}
        </div>

        {compareList.length === 0 ? (
          <div style={{ fontSize: '13.5px', color: 'var(--steel)', padding: '12px 0' }}>
            Nenhum arquiteto selecionado para comparação. No catálogo, clique em <strong>Comparar</strong> em até 3 perfis.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {compareList.map((p) => (
              <div key={p.id} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                  <strong style={{ fontSize: '14px' }}>{p.name}</strong>
                  <button type="button" onClick={() => onRemoveCompare(p)} aria-label={`Remover ${p.name}`} style={{ background: 'none', border: 'none', color: 'var(--steel)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--azul-lastro)', fontWeight: 600 }}>{p.specialty}</div>
                <div style={{ fontSize: '12px', color: 'var(--steel)' }}>{p.city}, {p.state}</div>
                <button type="button" onClick={() => onOpenArchitectById(p.id)} className="btn ghost" style={{ marginTop: 'auto', minHeight: '32px', fontSize: '12px' }}>
                  Ver perfil <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved Favorites from Account */}
      <section className="card" style={{ padding: '22px' }}>
        <h2 style={{ fontSize: '22px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Heart size={18} color="#2F5872" /> Perfis salvos na sua conta ({favorites.length})
        </h2>

        {isGuest ? (
          <div style={{ padding: '18px 0' }}>
            <p style={{ fontSize: '14px', color: 'var(--steel)', marginBottom: '14px' }}>
              Entre na sua conta para sincronizar seus arquitetos favoritos entre dispositivos.
            </p>
            <button type="button" onClick={onRequireAuth} className="btn primary">
              Entrar ou criar conta
            </button>
          </div>
        ) : error ? (
          <div role="alert" style={{ color: 'var(--color-danger)', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={15} /> {error}
          </div>
        ) : loading ? (
          <p style={{ fontSize: '13.5px', color: 'var(--steel)' }}>Carregando salvos...</p>
        ) : favorites.length === 0 ? (
          <div style={{ padding: '20px 0' }}>
            <p style={{ fontSize: '14px', color: 'var(--steel)', marginBottom: '14px' }}>
              Você ainda não salvou nenhum profissional.
            </p>
            <button type="button" onClick={onExploreCatalog} className="btn ghost">
              <Compass size={15} /> Explorar arquitetos
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {favorites.map((fav) => (
              <div
                key={fav.id}
                style={{
                  padding: '14px 16px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14.5px' }}>{fav.target_title}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--steel)' }}>{fav.target_subtitle || fav.target_type}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {fav.target_type === 'professional' && (
                    <button type="button" onClick={() => onOpenArchitectById(fav.target_id)} className="btn primary" style={{ minHeight: '34px', fontSize: '12.5px', padding: '6px 12px' }}>
                      Ver perfil
                    </button>
                  )}
                  <button type="button" onClick={() => handleRemoveFav(fav)} className="btn ghost" style={{ minHeight: '34px', padding: '6px 10px', color: 'var(--color-danger)' }} aria-label="Remover dos salvos">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
