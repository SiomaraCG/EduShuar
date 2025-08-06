import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { finalize } from 'rxjs/operators';
import { 
    Firestore, 
    collection, 
    addDoc, 
    Timestamp 
} from '@angular/fire/firestore';
import { CloudinaryApi } from '../../core/services/cloudinary-api'; // Importamos el nuevo servicio
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-contribuir',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,HttpClientModule],
  templateUrl: './contribuir.html',
  styleUrls: ['./contribuir.scss'],
})
export class ContribuirComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private firestore: Firestore = inject(Firestore);
  private cloudinaryApi = inject(CloudinaryApi); // Inyectamos el servicio

  activeTab: 'form' | 'guidelines' = 'form';
  contributionForm!: FormGroup;
  uploadProgress = 0;
  isUploading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  fileAcceptTypes = 'audio/*,video/*,image/*';
  private uploadSub: Subscription | null = null;

  contentTypes = [
    { id: 'audio', name: 'Audio', icon: 'fas fa-volume-up', accept: 'audio/*' },
    { id: 'video', name: 'Video', icon: 'fas fa-video', accept: 'video/*' },
    { id: 'image', name: 'Imagen', icon: 'fas fa-image', accept: 'image/*' },
  ];

  categories = [
    { id: 'medicine', name: 'Medicina Tradicional' },
    { id: 'ritual', name: 'Rituales y Ceremonias' },
    { id: 'music', name: 'Música y Danza' },
    { id: 'history', name: 'Historia Oral' },
    { id: 'language', name: 'Lengua y Vocabulario' },
  ];

  ngOnInit(): void {
    this.contributionForm = this.fb.group({
      contentType: ['image', Validators.required],
      file: [null, Validators.required],
      title: ['', Validators.required],
      shuarTitle: [''],
      description: ['', Validators.required],
      shuarDescription: [''],
      category: ['', Validators.required],
      tags: [''],
      contributor: [''],
      location: [''],
      culturalImportance: [''],
      ageRestriction: ['all'],
      permissions: [false, Validators.requiredTrue],
      respect: [false, Validators.requiredTrue],
    });
    this.selectContentType('image');
  }

  ngOnDestroy(): void {
    if (this.uploadSub) {
      this.uploadSub.unsubscribe();
    }
  }

  selectContentType(typeId: string): void {
    this.contributionForm.get('contentType')?.setValue(typeId);
    const selectedType = this.contentTypes.find(t => t.id === typeId);
    this.fileAcceptTypes = selectedType ? selectedType.accept : '*';
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.contributionForm.patchValue({ file: input.files[0] });
    } else {
      this.contributionForm.patchValue({ file: null });
    }
  }

  onSubmit(): void {
    if (this.contributionForm.invalid) {
      this.contributionForm.markAllAsTouched();
      return;
    }

    this.isUploading = true;
    this.successMessage = null;
    this.errorMessage = null;
    this.uploadProgress = 0;

    const { file, ...formValue } = this.contributionForm.value;

    this.uploadSub = this.cloudinaryApi.upload(file).pipe(
      finalize(() => {
        this.isUploading = false;
      })
    ).subscribe(async (result) => {
      this.uploadProgress = result.progress;
      if (result.error) {
        this.errorMessage = 'Hubo un error al subir el archivo. Por favor, inténtalo de nuevo.';
        this.isUploading = false;
      }
      if (result.url) {
        const contributionData = {
          ...formValue,
          tags: formValue.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
          fileUrl: result.url, 
          moderation: { status: 'pending' },
          submissionDate: Timestamp.now(),
        };

        try {
          const contributionsCollection = collection(this.firestore, 'community-contributions');
          await addDoc(contributionsCollection, contributionData);
          this.successMessage = '¡Tu contribución ha sido enviada con éxito para su revisión!';
          this.resetForm();
        } catch (dbError) {
          console.error('Error al guardar en Firestore:', dbError);
          this.errorMessage = 'El archivo se subió, pero no se pudo guardar la contribución. Contacta a soporte.';
        }
      }
    });
  }

  onCancel(): void {
    if (this.uploadSub) {
      this.uploadSub.unsubscribe();
    }
    this.resetForm();
  }

  public resetForm(): void {
    this.isUploading = false;
    this.uploadProgress = 0;
    this.contributionForm.reset({
      contentType: 'image',
      file: null,
      title: '',
      shuarTitle: '',
      description: '',
      shuarDescription: '',
      category: '',
      tags: '',
      contributor: '',
      location: '',
      culturalImportance: '',
      ageRestriction: 'all',
      permissions: false,
      respect: false,
    });

    

    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
    }, 8000);

    
  }
}
