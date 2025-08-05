import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dictionary.html',
  styleUrl: './dictionary.scss'
})
export class Dictionary {
  searchTerm: string = '';
  selectedCategory: string = 'all';
  selectedDifficulty: string = 'all';

  allWords: any[] = [
    {
      shuarWord: 'Nunkui',
      spanishTranslation: 'Diosa de la tierra y la fertilidad',
      category: 'cultura',
      difficulty: 'avanzado',
      pronunciationAudio: 'audio/nunkui.mp3',
      imageUrl: 'img/nunkui.jpg',
      context: 'Nunkui es una figura central en la mitología Shuar.'
    },
    {
      shuarWord: 'Yawi',
      spanishTranslation: 'Jaguar',
      category: 'animales',
      difficulty: 'intermedio',
      pronunciationAudio: 'audio/yawi.mp3',
      imageUrl: 'img/yawi.jpg',
      context: 'El yawi es un animal sagrado para los Shuar.'
    },
    {
      shuarWord: 'Uwi',
      spanishTranslation: 'Chicha de yuca',
      category: 'cocina',
      difficulty: 'basico',
      pronunciationAudio: 'audio/uwi.mp3',
      imageUrl: 'img/uwi.jpg',
      context: 'La uwi es la bebida tradicional Shuar.'
    },
    {
      shuarWord: 'Etsa',
      spanishTranslation: 'Sol',
      category: 'naturaleza',
      difficulty: 'basico',
      pronunciationAudio: 'audio/etsa.mp3',
      imageUrl: 'img/etsa.jpg',
      context: 'Etsa es el dios del sol en la cultura Shuar.'
    },
    {
      shuarWord: 'Kaa',
      spanishTranslation: 'Árbol',
      category: 'naturaleza',
      difficulty: 'basico',
      pronunciationAudio: 'audio/kaa.mp3',
      imageUrl: 'img/kaa.jpg',
      context: 'El kaa es fundamental en el ecosistema amazónico.'
    },
    {
      shuarWord: 'Panki',
      spanishTranslation: 'Serpiente',
      category: 'animales',
      difficulty: 'intermedio',
      pronunciationAudio: 'audio/panki.mp3',
      imageUrl: 'img/panki.jpg',
      context: 'La panki es un animal respetado en la selva.'
    },
    {
      shuarWord: 'Aents',
      spanishTranslation: 'Persona',
      category: 'cultura',
      difficulty: 'basico',
      pronunciationAudio: 'audio/aents.mp3',
      imageUrl: 'img/aents.jpg',
      context: 'Aents se refiere a la gente Shuar.'
    },
    {
      shuarWord: 'Jempue',
      spanishTranslation: 'Casa',
      category: 'hogar',
      difficulty: 'basico',
      pronunciationAudio: 'audio/jempue.mp3',
      imageUrl: 'img/jempue.jpg',
      context: 'Las jempue son construidas con materiales de la selva.'
    },
    {
      shuarWord: 'Naari',
      spanishTranslation: 'Nombre',
      category: 'familia',
      difficulty: 'basico',
      pronunciationAudio: 'audio/naari.mp3',
      imageUrl: 'img/naari.jpg',
      context: 'Cada naari tiene un significado especial.'
    },
    {
      shuarWord: 'Wapik',
      spanishTranslation: 'Medicina',
      category: 'medicina',
      difficulty: 'intermedio',
      pronunciationAudio: 'audio/wapik.mp3',
      imageUrl: 'img/wapik.jpg',
      context: 'El wapik es usado para curar diversas enfermedades.'
    },
    {
      shuarWord: 'Arutam',
      spanishTranslation: 'Espíritu ancestral',
      category: 'cultura',
      difficulty: 'avanzado',
      pronunciationAudio: 'audio/arutam.mp3',
      imageUrl: 'img/arutam.jpg',
      context: 'Buscar el arutam es parte de la iniciación Shuar.'
    },
    {
      shuarWord: 'Shuar',
      spanishTranslation: 'Gente',
      category: 'cultura',
      difficulty: 'basico',
      pronunciationAudio: 'audio/shuar.mp3',
      imageUrl: 'img/shuar.jpg',
      context: 'Los Shuar son un pueblo indígena de la Amazonía.'
    }
  ];
  filteredWords: any[] = [];

  constructor() {
    this.filterWords(); // Initial filter
  }

  onSearchChange(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filterWords();
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.filterWords();
  }

  onDifficultyChange(difficulty: string) {
    this.selectedDifficulty = difficulty;
    this.filterWords();
  }

  filterWords() {
    this.filteredWords = this.allWords.filter(word => {
      const matchesCategory = this.selectedCategory === 'all' || word.category === this.selectedCategory;
      const matchesDifficulty = this.selectedDifficulty === 'all' || word.difficulty === this.selectedDifficulty;
      const matchesSearchTerm = word.shuarWord.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                word.spanishTranslation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                (word.context && word.context.toLowerCase().includes(this.searchTerm.toLowerCase()));
      return matchesCategory && matchesDifficulty && matchesSearchTerm;
    });
  }

  playAudio(audioUrl: string) {
    const audio = new Audio(audioUrl);
    audio.play();
  }
}