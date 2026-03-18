import { TimeMode } from '../user/TimeMode'

export interface RankingEntry{
    id: String;
    username: String;
    avatar: String;
    // 2 posibles casos:--------------------------------------------------------
    // 1. backend nos devuelve el elo concreto de un modo de tiempo:
    elo: number;
    timeMode: TimeMode
    // o -----------------------------------------------------------------------
    // 2. emplear userRatings, tener todo guardado y a la hora de elegir
    //    cuál mostrar se emplea entry.ratings.blitz y tal
    // val ratings: UserRatings

}