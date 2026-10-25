import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StudentService } from './services/student';
import { Student } from './Model/student.model';
import { Navbar } from './Section/navbar/navbar';
import { Footer } from './Section/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar, Footer], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);

  studentForm!: FormGroup;
  studentsList = signal<Student[]>([]);
  
  isEditMode = false;
  selectedStudentId: any = null;
  // এডিট করার সময় পুরানো studentNo ধরে রাখার জন্য ভেরিয়েবল
  selectedStudentNo: number | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadStudents();
  }

  initForm(): void {
    this.studentForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      course: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18), Validators.max(60)]]
    });
  }

  loadStudents(): void {
    this.studentService.getStudents().subscribe({
      next: (data: any) => {
        const rawData = Array.isArray(data) ? data : (data.students || []);
        this.studentsList.set(rawData);
      },
      error: (err) => console.error('Error fetching students', err)
    });
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const formValues = this.studentForm.value;

    if (this.isEditMode && this.selectedStudentId !== null) {
      // ৪ নম্বর রিকোয়ারমেন্ট আপডেট: পুরানো studentNo সহ ডাটা পাঠানো হচ্ছে যেন এটি ডাটাবেজ থেকে মুছে না যায়
      const updatedStudent: Student = {
        ...formValues,
        id: this.selectedStudentId,
        studentNo: this.selectedStudentNo ?? undefined
      };

      this.studentService.updateStudent(this.selectedStudentId, updatedStudent).subscribe({
        next: () => {
          this.loadStudents();
          this.resetFormState();
        },
        error: (err) => console.error('Error updating student', err)
      });
    } else {
      // ৩ নম্বর রিকোয়ারমেন্ট: নতুন স্টুডেন্ট যোগ করা
      const newStudent: Student = { ...formValues };
      this.studentService.addStudent(newStudent).subscribe({
        next: () => {
          this.loadStudents();
          this.resetFormState();
        },
        error: (err) => console.error('Error adding student', err)
      });
    }
  }

  onEdit(student: Student): void {
    if (student.id === undefined) return;
    this.isEditMode = true;
    this.selectedStudentId = student.id;
    // এডিট মোডে যাওয়ার সময় studentNo ব্যাকআপে রেখে দেওয়া হচ্ছে
    this.selectedStudentNo = student.studentNo ?? null; 
    this.studentForm.patchValue(student);
  }

  onDelete(id: any): void {
    if (id === undefined) return;

    if (confirm('Are you sure you want to delete this student record?')) {
      this.studentService.deleteStudent(id).subscribe({
        next: () => {
          this.loadStudents();
        },
        error: (err) => console.error('Error deleting student', err)
      });
    }
  }

  resetFormState(): void {
    this.studentForm.reset();
    this.isEditMode = false;
    this.selectedStudentId = null;
    this.selectedStudentNo = null;
  }
}
