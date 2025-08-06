import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './games.html',
  styleUrl: './games.scss'
})
export class Games {
  private sanitizer = inject(DomSanitizer);

  selectedGameUrl: SafeResourceUrl | null = null;

  games: ExternalGame[] = [
    {
      id: 'game1',
      name: 'Juego de Memoria',
      url: 'https://wayground.com/join?gc=24186172', 
      description: 'Un juego clásico de memoria para entrenar tu mente.',
    },
    {
      id: 'game2',
      name: 'Ahorcado de Palabras',
      url: 'https://wayground.com/join?gc=24186172', 
      description: 'Adivina la palabra oculta antes de que se agoten tus intentos.',
    },
    {
      id: 'game3',
      name: 'Quiz de Cultura Shuar',
      url: 'https://wayground.com/join?gc=24186172', 
      description: 'Pon a prueba tus conocimientos sobre la cultura Shuar.',
    },
  ];

  selectGame(gameUrl: string): void {
    this.selectedGameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(gameUrl);
  }
}

interface ExternalGame {
  id: string;
  name: string;
  url: string;
  description: string;
}
