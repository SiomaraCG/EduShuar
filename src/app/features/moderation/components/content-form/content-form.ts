import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-content-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './content-form.html',
  styleUrls: ['./content-form.scss']
})
export class ContentForm {
  contentForm: FormGroup;

  constructor() {
    this.contentForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      link: new FormControl('', [Validators.required]),
      difficulty: new FormControl('', [Validators.required]),
      category: new FormControl('', [Validators.required])
    });
  }

  onSubmitContent(): void {
    if (this.contentForm.valid) {
      console.log(this.contentForm.value);
      // Here you would typically send the data to a service
      alert('Contenido guardado exitosamente (simulado).');
      this.contentForm.reset();
    } else {
      alert('Por favor, completa todos los campos.');
    }
  }
}
