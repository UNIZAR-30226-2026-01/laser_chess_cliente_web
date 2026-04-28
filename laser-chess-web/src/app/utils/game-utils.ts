import { Injectable } from '@angular/core';
import { TipoPieza } from '../model/game/TipoPieza';
import { PiezaData } from '../model/game/PiezaData';

const COL_LETTERS_AZUL = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const COL_LETTERS_ROJO = ['j', 'i', 'h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

@Injectable({
  providedIn: 'root',
})
export class GameUtils {

  cont = 0; // Contador para asignar ids únicos a las piezas
  /*
     Actualiza el tablero de juego añadiendo la pieza (parseo de pieza)
      @param codigo: string -> contenido de la pieza
      @param x: number -> coordenada x de la pieza
      @param y: number -> coordenada y de la pieza
     */
    parsearPiezaCompacta(
        codigo: string,
        x: number,
        y: number,
        id: number
      ): PiezaData | null {

        if (codigo === '') return null;

        codigo.split('');
        const tipoLetra = codigo[0];
        const colorLetra = codigo[1];
        const direccionLetra = codigo[2] ?? 'U';

        const tipos: Record<string, TipoPieza> = {
          'L': TipoPieza.LASER,
          'K': TipoPieza.REY,
          'D': TipoPieza.DEFLECTOR,
          'S': TipoPieza.SWITCH,
          'E': TipoPieza.ESCUDO
        };

        const rotaciones: Record<string, number> = {
          'U': 180,
          'R': 270,
          'D': 0,
          'L': 90
        };

        return {
          id,
          x,
          y,
          tipoPieza: tipos[tipoLetra],
          rotation: rotaciones[direccionLetra],
          esMia: colorLetra === 'A'
        };
      }
  
    
    isCasillaRestringida(x: number, y: number): 'azul' | 'rojo' | null {
    
      // Casillas Hélice azul
      if ( x == 1 || ( x == 9 &&  ( y == 1 ||  y == 8 ))) {
        return 'azul';
      }
  
      // Casillas Hélice rojo
      if ( x == 10 || ( x == 2 && ( y == 1  || y == 8 ))) {
        return 'rojo';
      }
  
      return null;
      
    }
  
    
      
      // Hay que revisarlo
  
  /*
      @param board: representación del tablero inicial
    */
    importarTablero(board: string): PiezaData[] {
      const piezasFinal: PiezaData[] = [];

      const filasTablero = board.split('\n');

      for (let j = 0; j < filasTablero.length; j++) {
        const piezas = filasTablero[j].split(',');

        for (let i = 0; i < piezas.length; i++) {
          const codigo = piezas[i].trim();

          if (codigo !== '') {
            const pieza = this.parsearPiezaCompacta(codigo, i + 1, j + 1, this.cont);

            if (pieza) {
              piezasFinal.push(pieza);
              this.cont++;
            }
          }
        }
      }

      return piezasFinal;
    }
    toChess(x: number, y: number, soyAzul: boolean): string {
      if (soyAzul){
          return `${COL_LETTERS_AZUL[x-1]}${8 - y + 1}`;
      }else{
          return `${COL_LETTERS_ROJO[x-1]}${y}`;
      }
      
    }

  // Y la inversa para cuando recibas del backend -> hay que revisarlo
    fromChess(coord: string, soyAzul: boolean): {x: number, y: number} {
      console.log("estoy traduciendo");
     
  
      const colLetter = coord[0];
      const rowDigit = parseInt(coord[1]);
      let x: number, y: number;
      if (soyAzul) {
        x = COL_LETTERS_AZUL.indexOf(colLetter) + 1;
        y = 9 - rowDigit;   // porque toChess: y_ajedrez = 9 - y_interna
      } else {
        x = COL_LETTERS_ROJO.indexOf(colLetter) + 1;
        y = rowDigit;       // para rojo, la fila de ajedrez es la misma que la interna
      }
      return { x, y };
  
  
    }

    
}
