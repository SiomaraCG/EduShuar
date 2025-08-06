import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Firestore, collection, query, where, getDocs, doc, updateDoc, increment } from '@angular/fire/firestore';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './biblioteca.html',
  styleUrl: './biblioteca.scss'
})
export class Biblioteca implements OnInit {
  private firestore: Firestore = inject(Firestore);
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  searchTerm: string = '';
  selectedCategory: string = 'all';
  selectedContentType: string = 'all';

  allContent: any[] = [];
  filteredContent: any[] = [];

  selectedContent: any | null = null;
  selectedContentUrl: SafeResourceUrl | null = null;
  showIframeModal: boolean = false;

  ngOnInit(): void {
    this.fetchApprovedContributions();
  }

  async fetchApprovedContributions(): Promise<void> {
    const contributionsCollection = collection(this.firestore, 'community-contributions');
    const q = query(contributionsCollection, where('moderation.status', '==', 'approved'));
    const querySnapshot = await getDocs(q);

    this.allContent = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Map Firestore data to match the template's expected structure
      const mappedData = {
        id: doc.id,
        category: data['category'] || '',
        type: data['contentType'] || '',
        title: data['title'] || '',
        shuarTitle: data['shuarTitle'] || '',
        description: data['description'] || '',
        shuarDescription: data['shuarDescription'] || '',
        duration: data['duration'] ? `${data['duration']} min` : '',
        views: data['viewCount'] || 0,
        contributor: data['contributor'] || '',
        fileUrl: data['fileUrl'] || '',
      };
      return mappedData;
    });
    this.filterContent();
  }

  onSearchChange(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filterContent();
  }

  onCategoryChange(event: Event) {
    this.selectedCategory = (event.target as HTMLSelectElement).value;
    this.filterContent();
  }

  onContentTypeChange(type: string) {
    this.selectedContentType = type;
    this.filterContent();
  }

  filterContent() {
    this.filteredContent = this.allContent.filter(item => {
      const matchesCategory = this.selectedCategory === 'all' || item.category === this.selectedCategory;
      const matchesContentType = this.selectedContentType === 'all' || item.type === this.selectedContentType;
      const matchesSearchTerm = item.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                item.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                item.contributor.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesContentType && matchesSearchTerm;
    });
  }

  async openContent(item: any): Promise<void> {
    // Increment view count in Firestore
    const docRef = doc(this.firestore, 'community-contributions', item.id);
    await updateDoc(docRef, { viewCount: increment(1) });

    // Update the local view count immediately for responsiveness
    item.views++;

    if (item.type === 'video' || item.type === 'audio' || item.type === 'image') {
      this.selectedContent = item;
      this.selectedContentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(item.fileUrl);
      this.showIframeModal = true;
    } else {
      window.open(item.fileUrl, '_blank');
    }
  }

  closeIframeModal(): void {
    this.showIframeModal = false;
    this.selectedContentUrl = null;
    this.selectedContent = null;
  }

  async downloadContent(item: any): Promise<void> {
    try {
      const response = await fetch(item.fileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.title || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Optionally, show an error message to the user
      alert('No se pudo descargar el archivo. Por favor, intente de nuevo.');
    }
  }

  getActionText(type: string): string {
    switch (type) {
      case 'video': return 'Ver Video';
      case 'audio': return 'Reproducir';
      case 'image': return 'Ver Imagen';
      case 'document': return 'Ver Documento';
      default: return 'Ver Contenido';
    }
  }

  getActionIcon(type: string): string {
    switch (type) {
      case 'video': return 'fas fa-video';
      case 'audio': return 'fas fa-headphones-alt';
      case 'image': return 'fas fa-image';
      case 'document': return 'fas fa-file-alt';
      default: return 'fas fa-eye';
    }
  }

  getCategoryDisplay(category: string): string {
    switch (category) {
      case 'medicine': return 'Medicina Tradicional';
      case 'ritual': return 'Rituales y Ceremonias';
      case 'music': return 'Música y Danza';
      case 'history': return 'Historia Oral';
      case 'language': return 'Lengua y Vocabulario';
      default: return category;
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'medicine': return 'fas fa-leaf';
      case 'ritual': return 'fas fa-hand-sparkles';
      case 'music': return 'fas fa-music';
      case 'history': return 'fas fa-book';
      case 'language': return 'fas fa-language';
      default: return 'fas fa-folder';
    }
  }

  get totalViews(): number {
    return this.filteredContent.reduce((sum, item) => sum + item.views, 0);
  }
}
