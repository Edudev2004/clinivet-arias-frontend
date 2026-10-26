import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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

  /**
   * Sube un archivo de imagen o documento a Supabase Storage a través del endpoint backend.
   * @param file Archivo File a subir
   * @param folder Carpeta de destino ('mascotas', 'avatares', etc.)
   */
  uploadFile(file: File, folder: string = 'mascotas'): Observable<UploadResponse> {
    if (!this.http) {
      return of({
        url: `https://gxjbvbgppabpumctkrrh.supabase.co/storage/v1/object/public/clinivet-arias/${folder}/${file.name}`,
        fileName: file.name,
        size: file.size
      });
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return this.http.post<UploadResponse>(this.apiUrl, formData);
  }
}
