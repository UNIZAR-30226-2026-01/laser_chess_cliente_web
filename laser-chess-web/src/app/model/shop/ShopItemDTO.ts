// como el del backend
export interface ShopItemDTO {
  item_id: number;
  price: number;
  level_requisite: number;
  item_type: string;   // 'win', 'board', 'piece'
  is_default: boolean;
}