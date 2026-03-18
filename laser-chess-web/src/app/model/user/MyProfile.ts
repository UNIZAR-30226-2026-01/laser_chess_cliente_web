import {UserRatings} from './UserRatings';

export interface MyProfile {
    id: String;
    mail: String;
    username: String;
    avatar: number;
    level: number;
    xp: number;
    money: number;
    board_skin: number;
    piece_skin: number;
    win_animatio: number;
    ratings: UserRatings;
}