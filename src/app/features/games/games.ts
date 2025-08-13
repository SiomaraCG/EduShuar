import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface GameAndLesson {
  id: string;
  name: string;
  description: string;
  link: string;
  difficulty: string;
  category: string;
}

export interface UserStats {
  totalPoints: number;
  completedGames: number;
  achievements: { level: string; count: number; }[];
}

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './games.html',
  styleUrl: './games.scss'
})
export class Games implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private firestore: Firestore = inject(Firestore);

  selectedGame: GameAndLesson | null = null;
  selectedGameUrl: SafeResourceUrl | null = null;
  showIframeModal = false;

  stats: WritableSignal<UserStats> = signal({
    totalPoints: 0,
    completedGames: 0,
    achievements: []
  });

  games$: Observable<GameAndLesson[]>;
  totalGames = 0;

  constructor() {
    const gamesCollection = collection(this.firestore, 'games_and_lessons');
    const gamesQuery = query(gamesCollection, where('category', '==', 'juego'));
    this.games$ = collectionData(gamesQuery, { idField: 'id' }) as Observable<GameAndLesson[]>;
    this.games$.subscribe(games => this.totalGames = games.length);
  }

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

  selectGame(game: GameAndLesson): void {
    this.selectedGame = game;
    this.selectedGameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(game.link);
    this.showIframeModal = true;
  }

  closeIframeModal(): void {
    this.showIframeModal = false;
    this.selectedGameUrl = null;
    this.selectedGame = null;
  }
}