import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StorageService, UploadResponse } from './storage.service';
import { environment } from '../../../environments/environment';

describe('StorageService', () => {
  let service: StorageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StorageService]
    });
    service = TestBed.inject(StorageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe subir un archivo a Supabase Storage mediante el backend', () => {
    const mockFile = new File(['mock content'], 'test-pet.jpg', { type: 'image/jpeg' });
    const mockResponse: UploadResponse = {
      url: 'https://gxjbvbgppabpumctkrrh.supabase.co/storage/v1/object/public/clinivet-arias/mascotas/uuid-foto.jpg',
      fileName: 'test-pet.jpg',
      size: 1234
    };

    service.uploadFile(mockFile, 'mascotas').subscribe((res) => {
      expect(res.url).toBe(mockResponse.url);
      expect(res.fileName).toBe(mockResponse.fileName);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/storage/upload`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(mockResponse);
  });
});
