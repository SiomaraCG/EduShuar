import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Firestore, collection, query, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Lesson {
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
  selector: 'app-lecciones',
  standalone: true,
  imports: [],
  templateUrl: './lecciones.html',
  styleUrl: './lecciones.scss'
})
export class Lecciones implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private firestore: Firestore = inject(Firestore);

  selectedLesson: Lesson | null = null;
  selectedLessonUrl: SafeResourceUrl | null = null;
  showIframeModal = false;

  stats: WritableSignal<UserStats> = signal({
    totalPoints: 0,
    completedGames: 0,
    achievements: []
  });

  lessons: Lesson[] = [
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

  get totalLessons(): number {
    return this.lessons.length;
  }

  selectLesson(lesson: Lesson): void {
    this.selectedLesson = lesson;
    this.selectedLessonUrl = this.sanitizer.bypassSecurityTrustResourceUrl(lesson.url);
    this.showIframeModal = true;
  }

  closeIframeModal(): void {
    this.showIframeModal = false;
    this.selectedLessonUrl = null;
    this.selectedLesson = null;
  }
}