/**
 * Modelos de datos para el módulo de vacunación de mascotas (RF-24 / APF2).
 */

export interface VacunaAplicada {
  id: string;
  mascotaId: string;
  mascotaNombre?: string;
  vacunaId?: string;
  nombreVacuna: string;
  fechaAplicacion: string;
  proximaFecha?: string | null;
  veterinarioId: string;
  veterinarioNombre?: string;
  lote?: string | null;
  consultaId?: string | null;
  createdAt?: string;
}

export interface VacunaAplicadaRequest {
  nombreVacuna: string;
  fechaAplicacion: string;
  proximaFecha?: string | null;
  veterinarioId: string;
  lote?: string | null;
  consultaId?: string | null;
}

export type EstadoVacuna = 'VIGENTE' | 'PROXIMA_VENCER' | 'VENCIDA' | 'SIN_REFUERZO';

export interface EvaluacionVacuna {
  estado: EstadoVacuna;
  diasRestantes: number | null;
  mensaje: string;
  badgeClass: string;
}

/**
 * Función utilitaria para evaluar el estado de vigencia de una vacuna aplicada (RF-24).
 * Regla: Próxima a vencer si diasRestantes <= 30 y >= 0. Vencida si < 0.
 */
export function evaluarVigenciaVacuna(proximaFecha?: string | null): EvaluacionVacuna {
  if (!proximaFecha) {
    return {
      estado: 'SIN_REFUERZO',
      diasRestantes: null,
      mensaje: 'Dosis única / Sin refuerzo',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200'
    };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaRefuerzo = new Date(proximaFecha + 'T00:00:00');
  const diferenciaMs = fechaRefuerzo.getTime() - hoy.getTime();
  const diasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0) {
    const diasVencida = Math.abs(diasRestantes);
    return {
      estado: 'VENCIDA',
      diasRestantes,
      mensaje: `Refuerzo atrasado (${diasVencida} día${diasVencida === 1 ? '' : 's'})`,
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-300'
    };
  }

  if (diasRestantes <= 30) {
    return {
      estado: 'PROXIMA_VENCER',
      diasRestantes,
      mensaje: diasRestantes === 0 ? '¡Vence hoy!' : `Próxima a vencer (en ${diasRestantes} día${diasRestantes === 1 ? '' : 's'})`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300'
    };
  }

  return {
    estado: 'VIGENTE',
    diasRestantes,
    mensaje: `Vigente (${diasRestantes} días restantes)`,
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300'
  };
}
