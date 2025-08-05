import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './biblioteca.html',
  styleUrl: './biblioteca.scss'
})
export class Biblioteca {
  searchTerm: string = '';
  selectedCategory: string = 'all';
  selectedContentType: string = 'all';

  // Placeholder for your content data
  allContent: any[] = [
    // Example content structure (you'll replace this with actual data from Firestore or a service)
    {
      category: 'medicina',
      type: 'video',
      title: 'Medicina Tradicional Shuar',
      description: 'Conocimientos ancestrales sobre plantas medicinales y prácticas curativas.',
      duration: '30 min',
      views: '560',
      contributor: 'Taish Nunkai',
      actionText: 'Reproducir',
      actionIcon: 'fas fa-play-circle'
    },
    {
      category: 'ceremonias',
      type: 'audio',
      title: 'Ceremonias Sagradas Shuar',
      description: 'Rituales y celebraciones que conectan con la espiritualidad y la naturaleza.',
      duration: '45 min',
      views: '780',
      contributor: 'Yawi Entsakua',
      actionText: 'Reproducir',
      actionIcon: 'fas fa-play-circle'
    },
    {
      category: 'construccion',
      type: 'video',
      title: 'Técnicas de Construcción Shuar',
      description: 'Métodos tradicionales para la edificación de viviendas y estructuras.',
      duration: '25 min',
      views: '320',
      contributor: 'Panki Kintia',
      actionText: 'Ver Video',
      actionIcon: 'fas fa-video'
    },
    {
      category: 'cocina',
      type: 'document',
      title: 'Cocina Tradicional Shuar',
      description: 'Recetas ancestrales y técnicas culinarias de la cultura Shuar.',
      duration: '15 min',
      views: '410',
      contributor: 'Nantu Washiki',
      actionText: 'Ver Receta',
      actionIcon: 'fas fa-book-open'
    },
    {
      category: 'agricultura',
      type: 'image',
      title: 'Agricultura Sostenible Shuar',
      description: 'Prácticas agrícolas respetuosas con el medio ambiente y la tradición.',
      duration: '20 min',
      views: '670',
      contributor: 'Shikiya Kuank',
      actionText: 'Ver Imagen',
      actionIcon: 'fas fa-image'
    }
  ];

  filteredContent: any[] = [];

  constructor() {
    this.filterContent(); // Initial filter
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
}
