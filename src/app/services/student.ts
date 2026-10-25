import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, take } from 'rxjs';
import { Student } from '../Model/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/students'; 

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  addStudent(student: Student): Observable<Student> {
    return this.getStudents().pipe(
      take(1),
      switchMap((students: Student[]) => {
        let nextNo = 1;
        if (students && students.length > 0) {
          const nos = students
            .map(s => s.studentNo)
            .filter(no => no !== undefined && !isNaN(no)) as number[];
          if (nos.length > 0) {
            nextNo = Math.max(...nos) + 1;
          } else {
            nextNo = students.length + 1;
          }
        }
        
        const completeStudent: Student = {
          ...student,
          studentNo: nextNo
        };
        
        return this.http.post<Student>(this.apiUrl, completeStudent, this.httpOptions);
      })
    );
  }

  updateStudent(id: any, student: Student): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student, this.httpOptions);
  }

  deleteStudent(id: any): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions);
  }
}
