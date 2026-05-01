export const ACE = `LAD,,,,EAD,KA,EAD,DAL,,
        ,,DAU,,,,,,,
        ,,,DRR,,,,,,
        DAD,,DRU,,SAD,SAL,,DAL,,DRR
        DAL,,DRR,,SRR,SRU,,DAD,,DRU
        ,,,,,,DAL,,,
        ,,,,,,,DRD,,
        ,,DRR,ERU,KR,ERU,,,,LRU`

export const CURIOSITY = `LAD,,,,EAD,KA,EAD,SAL,,
              ,,,,,,,,,
              ,,,DRR,,,DAD,,,
              DAD,DRU,,,DRL,SAL,,,DAL,DRR
              DAL,DRR,,,SRR,DAR,,,DAD,DRU
              ,,,DRU,,,DAL,,,
              ,,,,,,,,,
              ,,SRR,ERU,KR,ERU,,,,LRU`

export const GRAIL = `LAD,,,,DAU,EAD,DAL,,,
          ,,,,,KA,,,,
          DAD,,,,DAU,EAD,SAL,,,
          DAL,,SAD,,DRR,,DRL,,,
          ,,,DAR,,DAL,,SRD,,DRR
          ,,,SRL,ERU,DRD,,,,DRU
          ,,,,KR,,,,,
          ,,,DRR,ERU,DRD,,,,LRU`

export const SOPHIE = `LAD,,,,KA,DRR,DAL,,,
            ,,,EAD,,EAR,,,,DRU
            DAD,,,,DAU,DAL,,SRL,,DRR
            ,,,,,,,SAD,,
            ,,SRD,,,,,,,
            DAL,,SAL,,DRR,DRD,,,,DRU
            DAD,,,,ERL,,ERU,,,
            ,,,DRR,DAL,KR,,,,LRU`

export const MERCURY = `LAR,,,,DAU,KA,DAL,,,SRL
            ,,,,,EAD,DAL,,,
            DAL,,,SAL,,EAD,,,,
            DAD,,,,DRR,,,,DRU,
            ,DAD,,,,DAL,,,,DRU
            ,,,,ERU,,SRL,,,DRR
            ,,,DRR,ERU,,,,,
            SAL,,,DRR,KR,DRD,,,,LRL`

            
export const VACIO = `,,,,,,,,,
            ,,,,,,,,,
            ,,,,,,,,,
            ,,,,,,,,,
            ,,,,,,,,,
            ,,,,,,,,,
            ,,,,,,,,,
            ,,,,,,,,,`

export const BOARD_TO_ID: Record<string, number> = {
  Ace: 0,
  Curiosity: 1,
  Grail: 2,
  Mercury: 3,
  Sophie: 4,
};

export const ID_TO_BOARD: Record<number, string> = {
  0: 'Ace',
  1: 'Curiosity',
  2: 'Grail',
  3: 'Mercury',
  4: 'Sophie',
};