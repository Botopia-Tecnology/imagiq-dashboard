/**
 * Barrel export para las columnas de banners
 * Facilita la importación y mantiene la API limpia
 */

export { createBannerColumns } from "./column-definitions";
export type { BannerColumnActions } from "./column-definitions";

// También exportamos las celdas por si se necesitan usar individualmente
export { BannerNameCell } from "./cells/banner-name-cell";
export { BannerStatusCell } from "./cells/banner-status-cell";
export { BannerActionsCell } from "./cells/banner-actions-cell";
export {
  BannerDescriptionCell,
  BannerCtaCell,
  BannerColorCell,
  BannerCoordinatesCell,
  BannerLinkCell,
  BannerPlacementCell,
} from "./cells/simple-cells";

// Exportar constantes
export { statusColors, statusLabels, placementLabels } from "./constants";
export type { BannerStatus } from "./constants";
