import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

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
  selector: 'app-lecciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lecciones.html',
  styleUrl: './lecciones.scss'
})
export class Lecciones implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private firestore: Firestore = inject(Firestore);

  selectedLesson: GameAndLesson | null = null;
  selectedLessonUrl: SafeResourceUrl | null = null;
  showIframeModal = false;

  stats: WritableSignal<UserStats> = signal({
    totalPoints: 0,
    completedGames: 0,
    achievements: []
  });

  lecciones$: Observable<GameAndLesson[]>;

  constructor() {
    const leccionesCollection = collection(this.firestore, 'games_and_lessons');
    const leccionesQuery = query(leccionesCollection, where('category', '==', 'leccion'));
    this.lecciones$ = collectionData(leccionesQuery, { idField: 'id' }) as Observable<GameAndLesson[]>;
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

  selectLesson(lesson: GameAndLesson): void {
    this.selectedLesson = lesson;
    this.selectedLessonUrl = this.sanitizer.bypassSecurityTrustResourceUrl(lesson.link);
    this.showIframeModal = true;
  }

  closeIframeModal(): void {
    this.showIframeModal = false;
    this.selectedLessonUrl = null;
    this.selectedLesson = null;
  }
}
