export const TABLERO_ACE = `LAD,,,,EAD,KA,EAD,DAL,,
        ,,DAU,,,,,,,
        ,,,DRR,,,,,,
        DAD,,DRU,,SAD,SAL,,DAL,,DRR
        DAL,,DRR,,SRR,SRU,,DAD,,DRU
        ,,,,,,DAL,,,
        ,,,,,,,DRD,,
        ,,DRR,ERU,KR,ERU,,,,LRU`

export const TABLERO_CURIOSITY = `LAD,,,,EAD,KA,EAD,SAL,,
              ,,,,,,,,,
              ,,,DRR,,,DAD,,,
              DAD,DRU,,,DRL,SAL,,,DAL,DRR
              DAL,DRR,,,SRR,DAR,,,DAD,DRU
              ,,,DRU,,,DAL,,,
              ,,,,,,,,,
              ,,SRR,ERU,KR,ERU,,,,LRU`

export const TABLERO_GRAIL = `LAD,,,,DAU,EAD,DAL,,,
          ,,,,,KA,,,,
          DAD,,,,DAU,EAD,SAL,,,
          DAL,,SAD,,DRR,,DRL,,,
          ,,,DAR,,DAL,,SRD,,DRR
          ,,,SRL,ERU,DRD,,,,DRU
          ,,,,KR,,,,,
          ,,,DRR,ERU,DRD,,,,LRU`

export const TABLERO_SOPHIE = `LAD,,,,KA,DRR,DAL,,,
            ,,,EAD,,EAR,,,,DRU
            DAD,,,,DAU,DAL,,SRL,,DRR
            ,,,,,,,SAD,,
            ,,SRD,,,,,,,
            DAL,,SAL,,DRR,DRD,,,,DRU
            DAD,,,,ERL,,ERU,,,
            ,,,DRR,DAL,KR,,,,LRU`

export const TABLERO_MERCURY = `LAR,,,,DAU,KA,DAL,,,SRL
            ,,,,,EAD,DAL,,,
            DAL,,,SAL,,EAD,,,,
            DAD,,,,DRR,,,,DRU,
            ,DAD,,,,DAL,,,,DRU
            ,,,,ERU,,SRL,,,DRR
            ,,,DRR,ERU,,,,,
            SAL,,,DRR,KR,DRD,,,,LRL`

            
export const TABLERO_VACIO = `,,,,,,,,,
            ,,,,,,,,,
            ,,,,,,,,,
            ,,,,,,,,,
            ,,,,,,,,,
            ,,,,,,,,,
            ,,,,,,,,,
            ,,,,,,,,,`

export const BOARD_TO_ID: Record<string, number> = {
  ACE: 1,
  CURIOSITY: 2,
  GRAIL: 3,
  MERCURY: 4,
  SOPHIE: 5,
};

