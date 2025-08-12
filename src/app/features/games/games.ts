import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Firestore, collection, query, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Game {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface UserStats {
  totalPoints: number;
  completedGames: number;
  achievements: { level: string; count: number; }[];
}

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [],
  templateUrl: './games.html',
  styleUrl: './games.scss'
})
export class Games implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private firestore: Firestore = inject(Firestore);

  selectedGame: Game | null = null;
  selectedGameUrl: SafeResourceUrl | null = null;
  showIframeModal = false;

  stats: WritableSignal<UserStats> = signal({
    totalPoints: 0,
    completedGames: 0,
    achievements: []
  });

  games: Game[] = [
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

  ngOnInit(): void {
    this.fetchUserStats();
  }

  fetchUserStats(): void {
    const statsCollection = collection(this.firestore, 'userStats');
    const statsQuery = query(statsCollection);
    const userStats$ = collectionData(statsQuery) as Observable<UserStats[]>;

    userStats$.subscribe(data => {
      if (data.length > 0) {
        this.stats.set(data[0]);
      } else {
        this.stats.set({
          totalPoints: 0,
          completedGames: 0,
          achievements: [
            { level: 'Básico', count: 0 },
            { level: 'Intermedio', count: 0 },
            { level: 'Avanzado', count: 0 },
          ]
        });
      }
    });
  }

  get totalGames(): number {
    return this.games.length;
  }

  selectGame(game: Game): void {
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
