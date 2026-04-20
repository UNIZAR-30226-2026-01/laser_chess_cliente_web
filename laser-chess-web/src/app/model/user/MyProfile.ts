import {UserRatings} from './UserRatings';

export interface MyProfile {
  userId: number;
  username: string;
  mail: String;
  xp: number;
  level: number;
  avatar: number;
  money: number;
  board_skin: number;
  piece_skin: number;
  win_animation: number;
  rankedPoints: number;
  blitzElo?: number;
  rapidElo?: number;
  classicElo?: number;
  extendedElo?: number;
}
