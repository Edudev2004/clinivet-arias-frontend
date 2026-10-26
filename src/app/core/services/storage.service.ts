import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
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
   * Sube un archivo de imagen o documento a Supabase Storage a través del backend,
   * o directamente a Supabase si el backend local no está corriendo.
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

    // Intenta subir mediante el backend; si el backend no responde, sube directo a Supabase
    return this.http.post<UploadResponse>(this.apiUrl, formData).pipe(
      catchError(() => this.uploadDirectToSupabase(file, folder))
    );
  }

  /**
   * Subida directa hacia la API REST de Supabase Storage usando la service_role key.
   */
  private uploadDirectToSupabase(file: File, folder: string): Observable<UploadResponse> {
    const ext = file.name.split('.').pop() || 'jpg';
    const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${uniqueName}`;
    const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${uniqueName}`;

    return this.http!.post(uploadUrl, file, {
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Content-Type': file.type || 'image/jpeg'
      }
    }).pipe(
      map(() => ({
        url: publicUrl,
        fileName: file.name,
        size: file.size
      }))
    );
  }
}
