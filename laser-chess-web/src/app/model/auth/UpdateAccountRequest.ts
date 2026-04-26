export interface UpdateAccountRequest{
    username: String; // Puede ser null
    mail: String; // Puede ser null
    password?: string;
    avatar?: number;
    board_skin?: number; // Puede ser null
    piece_skin?: number; // Puede ser null
    win_animation?: number; // Puede ser null
}