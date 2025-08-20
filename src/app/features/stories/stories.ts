import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { FormsModule } from '@angular/forms'; // For filters

export interface Story {
  id: string;
  title: string;
  shuarTitle?: string;
  description?: string;
  category: string;
  author: string;
  fileUrl: string;
  type: string;
  views?: number; // Added for progress tracking/consistency with biblioteca
  isCompleted?: boolean; // For progress tracking
}

@Component({
  standalone: true,
  imports: [CommonModule, YouTubePlayerModule, FormsModule],
  selector: 'app-stories',
  templateUrl: './stories.html',
  styleUrls: ['./stories.scss']
})
export class Stories implements OnInit {
  private firestore: Firestore = inject(Firestore);
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  historiaOralStories: WritableSignal<Story[]> = signal([]);
  filteredStories: WritableSignal<Story[]> = signal([]); // For filtered content
  selectedContentType: string = 'all'; // For content type filter

  selectedContent: Story | null = null;
  selectedContentUrl: SafeResourceUrl | null = null;
  youtubeVideoId: string | null = null;
  showIframeModal: boolean = false;

  constructor() {
    const storiesCollection = collection(this.firestore, 'community-contributions');
    const q = query(storiesCollection,
                  where('moderation.status', '==', 'approved'),
                  where('category', '==', 'history'));

    const stories$ = collectionData(q, { idField: 'id' }).pipe(
      map(items => items.map(item => ({
        id: item['id'],
        title: item['title'],
        shuarTitle: item['shuarTitle'],
        description: item['description'],
        category: item['category'],
        author: item['contributor'],
        type: item['contentType'] || 'text',
        views: item['viewCount'] || 0,
        isCompleted: false, // Initialize as not completed
      }) as Story))
    );

    stories$.subscribe(data => {
      this.historiaOralStories.set(data);
      this.loadProgressFromLocalStorage(); // Load progress after stories are set
      this.filterStories(); // Apply initial filter
    });
  }

  ngOnInit(): void {
    this.loadYouTubeApi();
  }

  // --- Content Display Logic (from Biblioteca) ---
  openContent(item: Story): void {
    this.selectedContent = item;
    this.youtubeVideoId = this.getYouTubeVideoId(item.fileUrl);

    if (item.type === 'video' && this.youtubeVideoId) {
      this.showIframeModal = true;
    } else if (item.type === 'video' || item.type === 'audio' || item.type === 'image' || item.type === 'document') {
      this.selectedContentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(item.fileUrl);
      this.showIframeModal = true;
    } else {
      window.open(item.fileUrl, '_blank');
    }
  }

  closeIframeModal(): void {
    // Mark content as completed when modal is closed
    if (this.selectedContent) {
      const currentStories = this.historiaOralStories();
      const updatedStories = currentStories.map(story =>
        story.id === this.selectedContent?.id ? { ...story, isCompleted: true } : story
      );
      this.historiaOralStories.set(updatedStories);
      this.saveProgressToLocalStorage(); // Save progress
      this.filterStories(); // Re-apply filter to update view
    }

    this.showIframeModal = false;
    this.selectedContent = null;
    this.selectedContentUrl = null;
    this.youtubeVideoId = null;
  }

  getYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  loadYouTubeApi() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }

  // --- Dynamic Button Text ---
  getActionText(type: string): string {
    const actions: { [key: string]: string } = {
      video: 'Mostrar Video',
      audio: 'Reproducir Audio',
      image: 'Mostrar Imagen',
      document: 'Mostrar Documento',
      text: 'Mostrar Texto',
    };
    return actions[type] || 'Mostrar Contenido';
  }

  // --- Content Filtering ---
  onContentTypeChange(type: string): void {
    this.selectedContentType = type;
    this.filterStories();
  }

  filterStories(): void {
    this.filteredStories.set(
      this.historiaOralStories().filter(story => {
        const matchesContentType = this.selectedContentType === 'all' || story.type === this.selectedContentType;
        return matchesContentType;
      })
    );
  }

  // --- Progress Tracking (for YouTube videos) ---
  onPlayerStateChange(event: any): void {
    // YT.PlayerState.ENDED is 0
    if (event.data === 0 && this.selectedContent) {
      const currentStories = this.historiaOralStories();
      const updatedStories = currentStories.map(story =>
        story.id === this.selectedContent?.id ? { ...story, isCompleted: true } : story
      );
      this.historiaOralStories.set(updatedStories);
      this.saveProgressToLocalStorage(); // Save progress
      this.filterStories(); // Re-apply filter to update view
    }
  }

  // --- Local Storage Persistence ---
  private localStorageKey = 'shuarStoriesProgress';

  private loadProgressFromLocalStorage(): void {
    const savedProgress = localStorage.getItem(this.localStorageKey);
    if (savedProgress) {
      const completedStoryIds: string[] = JSON.parse(savedProgress);
      const currentStories = this.historiaOralStories();
      const updatedStories = currentStories.map(story => ({
        ...story,
        isCompleted: completedStoryIds.includes(story.id)
      }));
      this.historiaOralStories.set(updatedStories);
    }
  }

  private saveProgressToLocalStorage(): void {
    const completedStoryIds = this.historiaOralStories()
      .filter(story => story.isCompleted)
      .map(story => story.id);
    localStorage.setItem(this.localStorageKey, JSON.stringify(completedStoryIds));
  }

  get completedStoriesCount(): number {
    return this.historiaOralStories().filter(story => story.isCompleted).length;
  }

  get totalStoriesCount(): number {
    return this.historiaOralStories().length;
  }

  get progressPercentage(): number {
    if (this.totalStoriesCount === 0) {
      return 0;
    }
    return (this.completedStoriesCount / this.totalStoriesCount) * 100;
  }
}
