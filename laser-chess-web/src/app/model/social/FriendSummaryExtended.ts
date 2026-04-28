export interface FriendSummaryExtended {
    account_id: number;
    username: string;
    level: number;
    avatar: number;
    xp?: number;
    //se rellenas despues
    blitzElo?: number;
    rapidElo?: number;
    classicElo?: number;
    extendedElo?: number;
}