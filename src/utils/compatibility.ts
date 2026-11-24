import { ClientBriefing, ProfessionalProfile } from '../types';

export const PROJECT_TYPES = [
  'Arquitetura Residencial',
  'Reforma e Retrofit',
  'Arquitetura de Interiores',
  'Arquitetura Comercial',
  'Paisagismo',
  'Arquitetura Sustentável',
];

export const ARCHITECTURAL_STYLES = [
  'Contemporâneo',
  'Minimalista',
  'Brasileiro e Natural',
  'Industrial',
  'Clássico Atemporal',
  'Biofílico',
];

export const INVESTMENT_RANGES = [
  'Até R$ 150 mil',
  'R$ 150 mil a R$ 500 mil',
  'R$ 500 mil a R$ 1,5 milhão',
  'Acima de R$ 1,5 milhão',
];

export const PROJECT_STAGES = [
  'Apenas estudando possibilidades',
  'Tenho terreno ou imóvel definido',
  'Quero reformar um imóvel existente',
  'Preciso de aprovação e projeto executivo',
];

export const PROJECT_TIMELINES = [
  'Início imediato (até 30 dias)',
  'Nos próximos 2 a 3 meses',
  'De 3 a 6 meses',
  'Sem pressa — planejamento de longo prazo',
];

export function formatAvailability(availability?: string): { label: string; tone: 'success' | 'warn' | 'neutral' } {
  if (availability === 'agenda_limitada') return { label: 'Agenda limitada', tone: 'warn' };
  if (availability === 'lista_espera') return { label: 'Lista de espera', tone: 'neutral' };
  return { label: 'Disponível para novos projetos', tone: 'success' };
}

/**
 * Transparent compatibility explanation between client briefing and architect profile.
 * Never invents arbitrary quality ratings — only cites real matching attributes.
 */
export function getCompatibilityReasons(
  prof: ProfessionalProfile,
  briefing: ClientBriefing | null
): string[] {
  if (!briefing) return [];
  const reasons: string[] = [];

  if (briefing.city) {
    const c = briefing.city.toLowerCase();
    if (
      prof.city?.toLowerCase().includes(c) ||
      prof.serviceArea?.toLowerCase().includes(c)
    ) {
      reasons.push(`Atua na região de ${briefing.city}`);
    } else if (briefing.state && prof.state?.toUpperCase() === briefing.state.toUpperCase()) {
      reasons.push(`Atende no estado de ${briefing.state.toUpperCase()}`);
    }
  }

  if (briefing.projectType) {
    const pt = briefing.projectType.toLowerCase();
    const matchesType =
      prof.projectTypes?.some((t) => t.toLowerCase().includes(pt) || pt.includes(t.toLowerCase())) ||
      prof.specialty?.toLowerCase().includes(pt);
    if (matchesType) {
      reasons.push(`Atuação em ${briefing.projectType}`);
    }
  }

  if (briefing.stylePreferences?.length && prof.styles?.length) {
    const matchedStyles = prof.styles.filter((s) =>
      briefing.stylePreferences.some((pref) => pref.toLowerCase() === s.toLowerCase())
    );
    if (matchedStyles.length > 0) {
      reasons.push(`Afinidade estética: ${matchedStyles.slice(0, 2).join(', ')}`);
    }
  }

  if (briefing.budgetRange && prof.investmentRanges?.includes(briefing.budgetRange)) {
    reasons.push(`Experiência na faixa ${briefing.budgetRange}`);
  }

  if (prof.availability === 'disponivel') {
    reasons.push('Agenda aberta para novos projetos');
  }

  if (prof.isVerified) {
    reasons.push('Registro profissional verificado pela Ballast');
  }

  return reasons.slice(0, 4);
}
