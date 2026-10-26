import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  url: string;
  fileName: string;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly http = inject(HttpClient, { optional: true });
  private readonly apiUrl = `${environment.apiUrl}/storage/upload`;

  private readonly supabaseUrl = 'https://gxjbvbgppabpumctkrrh.supabase.co';
  private readonly supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4amJ2YmdwcGFicHVtY3RrcnJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDU5ODMxMiwiZXhwIjoyMTA2MTc0MzEyfQ.zPJdnuoO06WBYOAZ8da1j1Z4g8sD7OVWDHOrU08y4oI';
  private readonly bucket = 'clinivet-arias';

  /**
   * Sube un archivo a Supabase Storage mediante el backend o directo a Supabase.
   */
  uploadFile(file: File, folder: string = 'mascotas'): Observable<UploadResponse> {
    if (!this.http) {
      return of({
        url: `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${folder}/${file.name}`,
        fileName: file.name,
        size: file.size
      });
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return this.http.post<UploadResponse>(this.apiUrl, formData).pipe(
      catchError(() => this.uploadDirectToSupabase(file, folder))
    );
  }

  /**
   * Subida directa hacia la API REST de Supabase Storage usando fetch nativo con la service_role key.
   */
  uploadDirectToSupabase(file: File, folder: string = 'mascotas'): Observable<UploadResponse> {
    const ext = file.name.split('.').pop() || 'jpg';
    const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${uniqueName}`;
    const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${uniqueName}`;

    return from(
      fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': file.type || 'image/jpeg'
        },
        body: file
      }).then(async (response) => {
        if (!response.ok) {
          const err = await response.text();
          throw new Error('Supabase Storage error: ' + err);
        }
        return {
          url: publicUrl,
          fileName: file.name,
          size: file.size
        };
      })
    );
  }

  /**
   * Sube una imagen en base64 (Data URL) a Supabase Storage.
   */
  uploadBase64(base64Data: string, folder: string = 'mascotas'): Observable<UploadResponse> {
    try {
      const parts = base64Data.split(';base64,');
      const contentType = parts[0].replace('data:', '') || 'image/jpeg';
      const ext = contentType.split('/')[1] || 'jpg';
      const byteCharacters = atob(parts[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });
      const file = new File([blob], `migrated-${Date.now()}.${ext}`, { type: contentType });

      return this.uploadDirectToSupabase(file, folder);
    } catch {
      return of({
        url: base64Data,
        fileName: 'fallback.jpg',
        size: 0
      });
    }
  }
}
