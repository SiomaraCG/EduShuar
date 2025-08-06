import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, getDocs, doc, updateDoc, deleteDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

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

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './moderation.html',
  styleUrls: ['./moderation.scss']
})
export class Moderation implements OnInit {
  private firestore: Firestore = inject(Firestore);
  contributions$: Observable<Contribution[]>;

  constructor() {
    const contributionsCollection = collection(this.firestore, 'community-contributions');
    this.contributions$ = collectionData(contributionsCollection, { idField: 'id' }) as Observable<Contribution[]>;
  }

  ngOnInit(): void {}

  async approveContribution(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'community-contributions', id);
    try {
      await updateDoc(docRef, { 'moderation.status': 'approved' });
      console.log(`Contribution ${id} approved successfully.`);
    } catch (error) {
      console.error('Error approving contribution:', error);
    }
  }

  async deleteContribution(id: string): Promise<void> {
    if (confirm('¿Estás seguro de que quieres eliminar esta contribución permanentemente?')) {
      const docRef = doc(this.firestore, 'community-contributions', id);
      try {
        await deleteDoc(docRef);
        console.log(`Contribution ${id} deleted successfully.`);
      } catch (error) {
        console.error('Error deleting contribution:', error);
      }
    }
  }

  getCategoryDisplay(category: string): string {
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
}
