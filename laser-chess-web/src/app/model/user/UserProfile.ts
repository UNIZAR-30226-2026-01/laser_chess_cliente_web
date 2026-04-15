import { UserRatings } from './UserRatings'

export interface UserProfile {
    id: String;
    username: String;
    avatar: String;
    level     :number;
	xp        :number;
    board_skin: number;
    piece_skin: number;
    win_animation: number;
    ratings: UserRatings;
}