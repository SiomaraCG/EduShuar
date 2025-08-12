import { Component, inject, OnInit, signal, computed, WritableSignal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, doc, updateDoc, deleteDoc, collectionData, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { CloudinaryApi } from '../../core/services/cloudinary-api';

export interface Contribution {
  id: string;
  title: string;
  shuarTitle?: string;
  category: string;
  contentType: string;
  contributor: string;
  submissionDate: any; // Firestore Timestamp
  moderation: { status: 'pending' | 'approved' | 'rejected' };
  fileUrl: string;
}

export interface Word {
  spanish: string;
  shuar: string;
  significado: string;
  category: string; // Added category
  difficulty: string; // Added difficulty
  imageUrl: string;
}

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all';

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, YouTubePlayerModule],
  templateUrl: './moderation.html',
  styleUrls: ['./moderation.scss']
})
export class Moderation implements OnInit {
  private firestore: Firestore = inject(Firestore);
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private cloudinaryApi: CloudinaryApi = inject(CloudinaryApi);
  
  private contributions$: Observable<Contribution[]>;
  contributions: WritableSignal<Contribution[]> = signal([]);
  searchTerm: WritableSignal<string> = signal('');
  statusFilter: WritableSignal<StatusFilter> = signal('all');
  selectedFileUrl: WritableSignal<SafeResourceUrl | null> = signal(null);
  isModalOpen: WritableSignal<boolean> = signal(false);
  youtubeVideoId: WritableSignal<string | null> = signal(null);

  wordForm: FormGroup;
  selectedFile: File | null = null;

  @ViewChild('wordImageInput') wordImageInput!: ElementRef<HTMLInputElement>;

  // New arrays for categories and difficulties
  wordCategories = [
    { id: 'Todo', name: 'Todo' },
    { id: 'Familia', name: 'Familia' },
    { id: 'Hogar', name: 'Hogar' },
    { id: 'Naturaleza', name: 'Naturaleza' },
    { id: 'Plantas', name: 'Plantas' },
    { id: 'Animales', name: 'Animales' },
    { id: 'Cultura', name: 'Cultura' },
    { id: 'Partes del Cuerpo', name: 'Partes del Cuerpo' },
  ];

  difficulties = [
    { id: 'Basica', name: 'Básica' },
    { id: 'Media', name: 'Media' },
    { id: 'Avanzada', name: 'Avanzada' },
  ];

  pendingCount = computed(() => this.contributions().filter(c => c.moderation.status === 'pending').length);
  approvedCount = computed(() => this.contributions().filter(c => c.moderation.status === 'approved').length);
  rejectedCount = computed(() => this.contributions().filter(c => c.moderation.status === 'rejected').length);
  totalCount = computed(() => this.contributions().length);

  filteredContributions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const filter = this.statusFilter();
    let filtered = this.contributions();

    if (term) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.shuarTitle?.toLowerCase().includes(term) ||
        this.getCategoryDisplay(c.category).toLowerCase().includes(term) ||
        c.contributor.toLowerCase().includes(term)
      );
    }

    return filtered;
  });

  constructor() {
    const contributionsCollection = collection(this.firestore, 'community-contributions');
    this.contributions$ = collectionData(contributionsCollection, { idField: 'id' }) as Observable<Contribution[]>;

    this.wordForm = new FormGroup({
      spanish: new FormControl('', [Validators.required]),
      shuar: new FormControl('', [Validators.required]),
      significado: new FormControl('', [Validators.required]),
      category: new FormControl('', [Validators.required]), // Added category
      difficulty: new FormControl('', [Validators.required]), // Added difficulty
      image: new FormControl<File | null>(null, [Validators.required])
    });
  }

  ngOnInit(): void {
    this.contributions$.subscribe(data => {
      this.contributions.set(data);
    });
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      const file = event.target.files[0];
      this.wordForm.patchValue({ image: file });
      this.selectedFile = file;
    }
  }

  onSubmitWord(): void {
    if (this.wordForm.invalid) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    if (!this.selectedFile) {
      alert('Por favor, selecciona una imagen.');
      return;
    }

    this.cloudinaryApi.upload(this.selectedFile).subscribe(result => {
      if (result.url) {
        const newWord: Word = {
          spanish: this.wordForm.value.spanish,
          shuar: this.wordForm.value.shuar,
          significado: this.wordForm.value.significado,
          category: this.wordForm.value.category, // Added category
          difficulty: this.wordForm.value.difficulty, // Added difficulty
          imageUrl: result.url
        };

        const dictionaryCollection = collection(this.firestore, 'dictionary');
        addDoc(dictionaryCollection, newWord).then(() => {
          alert('Palabra guardada exitosamente');
          this.wordForm.reset();
          this.selectedFile = null;
          // Clear the file input explicitly
          if (this.wordImageInput) {
            this.wordImageInput.nativeElement.value = '';
          }
        }).catch(error => {
          console.error('Error guardando la palabra:', error);
          alert('Hubo un error al guardar la palabra.');
        });
      } else if (result.error) {
        console.error('Cloudinary upload error:', result.error);
        alert('Hubo un error al subir la imagen.');
      }
    });
  }

  setFilter(filter: StatusFilter) {
    this.statusFilter.set(filter);
  }

  openModal(url: string) {
    const videoId = this.getYouTubeVideoId(url);
    if (videoId) {
      this.youtubeVideoId.set(videoId);
    } else {
      this.selectedFileUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedFileUrl.set(null);
    this.youtubeVideoId.set(null);
  }

  getYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  async approveContribution(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'community-contributions', id);
    try {
      await updateDoc(docRef, { 'moderation.status': 'approved' });
    } catch (error) {
      console.error('Error approving contribution:', error);
    }
  }

  async rejectContribution(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'community-contributions', id);
    try {
      await updateDoc(docRef, { 'moderation.status': 'rejected' });
    } catch (error) {
      console.error('Error rejecting contribution:', error);
    }
  }

  async deleteContribution(id: string): Promise<void> {
    if (confirm('¿Estás seguro de que quieres eliminar esta contribución permanentemente?')) {
      const docRef = doc(this.firestore, 'community-contributions', id);
      try {
        await deleteDoc(docRef);
      } catch (error) {
        console.error('Error deleting contribution:', error);
      }
    }
  }

  getCategoryDisplay(category: string): string {
    if (!category) {
      return 'Sin categoría';
    }
    const categories: { [key: string]: string } = {
      medicine: 'Medicina Tradicional',
      ritual: 'Rituales y Ceremonias',
      music: 'Música y Danza',
      history: 'Historia Oral',
      language: 'Lengua y Vocabulario',
    };
    return categories[category] || category;
  }

  getContentTypeDisplay(contentType: string): string {
    const types: { [key: string]: string } = {
      audio: 'Audio',
      video: 'Video',
      image: 'Imagen',
      document: 'Documento',
    };
    return types[contentType] || contentType;
  }

  getContentTypeIcon(contentType: string): string {
    const icons: { [key: string]: string } = {
      audio: 'fas fa-headphones-alt',
      video: 'fas fa-video',
      image: 'fas fa-image',
      document: 'fas fa-file-alt',
    };
    return icons[contentType] || 'fas fa-question-circle';
  }
}

export interface Word {
  spanish: string;
  shuar: string;
  significado: string;
  category: string; // Added category
  difficulty: string; // Added difficulty
  imageUrl: string;
}

const contentTypes = [
  { id: 'audio', name: 'Audio', icon: 'fas fa-volume-up', accept: 'audio/*' },
  { id: 'video', name: 'Video', icon: 'fas fa-video', accept: 'video/*' },
  { id: 'image', name: 'Imagen', icon: 'fas fa-image', accept: 'image/*' },
  { id: 'document', name: 'Documento', icon: 'fas fa-file-alt', accept: 'application/pdf' },
];

const categories = [
  { id: 'medicine', name: 'Medicina Tradicional' },
  { id: 'ritual', name: 'Rituales y Ceremonias' },
  { id: 'music', name: 'Música y Danza' },
  { id: 'history', name: 'Historia Oral' },
  { id: 'language', name: 'Lengua y Vocabulario' },
];