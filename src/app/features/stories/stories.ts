import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-stories',
  templateUrl: './stories.html',
  styleUrls: ['./stories.scss']
})
export class Stories implements OnInit {
  allStories = [
    {
      title: 'El Origen del Fuego',
      description: 'Cuento ancestral sobre cómo los Shuar obtuvieron el fuego.',
      author: 'Siomara',
      category: 'Origen',
      imageUrl: 'img/inicio.jpg'
    },
    {
      title: 'Nunkui, la Creadora',
      description: 'La historia de la diosa que enseñó a las mujeres a cultivar.',
      author: 'Pedro',
      category: 'Espiritual',
      imageUrl: 'img/inicio.jpg'
    },
    {
      title: 'El Hombre que se Volvió Cascada',
      description: 'Una leyenda sobre la conexión sagrada con la naturaleza.',
      author: 'Pablo',
      category: 'Naturaleza',
      imageUrl: 'img/inicio.jpg'
    },
    {
      title: 'El Ritual de la Tsantsa',
      description: 'Relato sobre el significado profundo de este rito ancestral.',
      author: 'Renato',
      category: 'Ritual',
      imageUrl: 'img/inicio.jpg'
    },
    {
      title: 'La Creación del Hombre',
      description: 'Mito sobre cómo los primeros seres Shuar llegaron al mundo.',
      author: 'Maite',
      category: 'Origen',
      imageUrl: 'img/inicio.jpg'
    },
    {
      title: 'El Espíritu del Tabaco',
      description: 'La importancia de la planta sagrada en la vida espiritual Shuar.',
      author: 'Simba',
      category: 'Espiritual',
      imageUrl: 'img/inicio.jpg'
    }
  ];

  stories: any[] = [];
  selectedCategory: string = 'Todos';

  ngOnInit() {
    this.filterByCategory('Todos');
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'Todos') {
      this.stories = this.allStories;
    } else {
      this.stories = this.allStories.filter(story => story.category === category);
    }
  }
}