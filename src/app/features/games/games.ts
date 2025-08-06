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

  selectedGame: ExternalGame | null = null;
  selectedGameUrl: SafeResourceUrl | null = null;
  showIframeModal = false;

  stats = {
    totalPoints: '11,750',
    completedGames: 8,
    achievements: [
      { level: 'Básico', count: 2 },
      { level: 'Intermedio', count: 4 },
      { level: 'Avanzado', count: 2 },
    ]
  };

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

  get totalGames(): number {
    return this.games.length;
  }

  selectGame(game: ExternalGame): void {
    this.selectedGame = game;
    this.selectedGameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(game.url);
    this.showIframeModal = true;
  }

  closeIframeModal(): void {
    this.showIframeModal = false;
    this.selectedGameUrl = null;
    this.selectedGame = null;
  }
}

interface ExternalGame {
  id: string;
  name: string;
  url: string;
  description: string;
}
