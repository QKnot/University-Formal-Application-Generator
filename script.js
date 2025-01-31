const { createClient } = window.supabase; // Use the CDN-loaded version instead of ES module

let TEMPLATES = {};

async function loadTemplates() {
    try {
        const response = await fetch('templates.json');
        if (!response.ok) {
            throw new Error('Failed to load templates');
        }
        TEMPLATES = await response.json();
    } catch (error) {
        console.error('Error loading templates:', error);
    }
}

// Initialize Supabase client outside any function
const supabaseClient = createClient(
    'https://wcekcagojgvgkfhbgnfy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjZWtjYWdvamd2Z2tmaGJnbmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyOTA0MTAsImV4cCI6MjA1Mzg2NjQxMH0.hryXIl30caQ_ILCv1iwyjRcRWpJXjJXeVk1e8xRbVrg'
);

// Add window.generatePDF function for the download button
window.generatePDF = async function() {
    const pdfGenerator = new PDFGenerator();
    await pdfGenerator.generatePDF();
};

async function updateStudentData() {
    // Get form values and validate required fields
    const studentId = document.getElementById('studentId')?.value?.trim();
    const password = document.getElementById('studentPassword')?.value?.trim();

    if (!studentId || !password) {
        alert('Student ID and password are required');
        return;
    }

    // Create complete student data object with all fields
    const studentData = {
        student_id: studentId,
        password: password,
        full_name: document.getElementById('studentName')?.value?.trim() || '',
        section: document.getElementById('studentSection')?.value?.trim() || '',
        department: document.getElementById('studentDepartment')?.value?.trim() || '',
        university_name: document.getElementById('studentUniversityName')?.value?.trim() || '',
        contact_info: document.getElementById('contactInfo')?.value?.trim() || ''
    };

    // Validate required fields
    if (!studentData.full_name || !studentData.department || !studentData.university_name) {
        alert('Name, Department, and University Name are required fields');
        return;
    }

    try {
        // Show loading state
        const updateButton = document.getElementById('updateDbButton');
        if (updateButton) {
            updateButton.disabled = true;
            updateButton.textContent = 'Updating...';
        }

        // Check if student exists
        const { data: existingStudent, error: fetchError } = await supabaseClient
            .from('students')
            .select('*')
            .eq('student_id', studentId)
            .maybeSingle();

        if (fetchError) {
            throw fetchError;
        }

        let result;
        
        if (existingStudent) {
            // Update existing student
            if (existingStudent.password === password) {
                const { data, error } = await supabaseClient
                    .from('students')
                    .update({
                        full_name: studentData.full_name,
                        section: studentData.section,
                        department: studentData.department,
                        university_name: studentData.university_name,
                        contact_info: studentData.contact_info
                    })
                    .eq('student_id', studentId)
                    .select();
                
                if (error) throw error;
                result = data;
            } else {
                throw new Error('Incorrect password');
            }
        } else {
            // Insert new student
            const { data, error } = await supabaseClient
                .from('students')
                .insert([studentData])
                .select();
            
            if (error) throw error;
            result = data;
        }

        alert(existingStudent ? 'Student information updated successfully!' : 'New student record created successfully!');
        
        // Refresh the displayed data
        await fetchStudentData(studentId);

    } catch (error) {
        console.error('Error updating student data:', error);
        
        if (error.message === 'Incorrect password') {
            alert('Incorrect password. Please try again.');
        } else if (error.code === '23505') {
            alert('A student with this ID already exists.');
        } else if (error.code === 'PGRST116') {
            alert('Student not found.');
        } else {
            alert(`Error updating database: ${error.message}`);
        }
    } finally {
        // Reset button state
        const updateButton = document.getElementById('updateDbButton');
        if (updateButton) {
            updateButton.disabled = false;
            updateButton.textContent = 'Update Database';
        }
    }
}

// Updated fetch function to properly handle all fields
async function fetchStudentData(studentId) {
    try {
        const { data, error } = await supabaseClient
            .from('students')
            .select('*')
            .eq('student_id', studentId)
            .maybeSingle();

        if (error) throw error;

        if (data) {
            // Update all form fields with fetched data
            const fields = {
                'studentName': data.full_name,
                'studentSection': data.section,
                'studentDepartment': data.department,
                'studentUniversityName': data.university_name,
                'contactInfo': data.contact_info
            };

            for (const [id, value] of Object.entries(fields)) {
                const element = document.getElementById(id);
                if (element) {
                    element.value = value || ''; // Handle null/undefined values
                }
            }
        } else {
            // Clear all form fields if no student found
            const fields = ['studentName', 'studentSection', 'studentDepartment', 'studentUniversityName', 'contactInfo'];
            fields.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.value = '';
                }
            });
        }
    } catch (error) {
        console.error('Error fetching student data:', error);
        alert(`Error fetching student data: ${error.message}`);
    }
}

class FormUtils {
    static formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    static getFormData() {
        const formData = {};
        const fields = [
            'date', 'designation', 'universityName', 'department', 'subject',
            'gender', 'introduction', 'description', 'reason', 'details',
            'closing', 'studentName', 'studentId', 'studentSection',
            'studentDepartment', 'studentUniversityName', 'contactInfo'
        ];

        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                formData[field] = element.value;
            }
        });

        if (formData.date) {
            formData.date = this.formatDate(formData.date);
        }

        return formData;
    }

    static validateRequiredFields() {
        const requiredFields = [
            'date',
            'designation', 
            'universityName',
            'subject',
            'gender',
            'introduction',
            'description',
            'reason',
            'closing',
            'studentName',
            'studentId',
            'studentDepartment',
            'studentUniversityName'
        ];

        let isValid = true;
        let emptyFields = [];

        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element) {
                console.error(`Element with id '${field}' not found`);
                isValid = false;
                return;
            }
            if (!element.value.trim()) {
                isValid = false;
                emptyFields.push(field.replace(/([A-Z])/g, ' $1').toLowerCase());
                element.classList.add('error');
            } else {
                element.classList.remove('error');
            }
        });

        if (!isValid) {
            alert(`Please fill in all required fields:\n${emptyFields.join('\n')}`);
        }

        return isValid;
    }
}

class PreviewManager {
    constructor() {
        this.previewContent = document.querySelector('.preview-content');
    }

    updatePreview() {
        const formData = FormUtils.getFormData();
        
        // Update preview sections
        this.updateElement('preview-date', `<strong>${formData.date || ''}</strong>`);
        this.updateElement('preview-recipient', this.generateRecipientHTML(formData));
        this.updateElement('preview-subject', `<strong>Subject: ${formData.subject || ''}</strong>`);
        this.updateElement('preview-salutation', `Dear ${formData.gender || ''},`);
        this.updateElement('preview-body', this.generateBodyHTML(formData));
        this.updateElement('preview-signature', this.generateSignatureHTML(formData));
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = content;
        }
    }

    generateRecipientHTML(formData) {
        return `
            To<br>
            ${formData.designation}<br>
            ${formData.department ? formData.department + '<br>' : ''}
            ${formData.universityName}
        `;
    }

    generateBodyHTML(formData) {
        const bodyContent = [
            formData.introduction + ' ' + formData.description + ' ' + formData.reason,
            formData.details,
            formData.closing
        ].filter(Boolean).join('\n\n');
        
        return bodyContent.split('\n').join('<br>');
    }

    generateSignatureHTML(formData) {
        return `
            Yours sincerely,<br><br>
            ${formData.studentName}<br>
            ID: ${formData.studentId}<br>
            ${formData.studentSection ? `Section: ${formData.studentSection}<br>` : ''}
            Department of ${formData.studentDepartment}<br>
            ${formData.studentUniversityName}<br>
            ${formData.contactInfo ? formData.contactInfo : ''}
        `;
    }
}

class PDFGenerator {
    constructor() {
        this.spinner = document.getElementById('loadingSpinner');
        if (!this.spinner) {
            console.error('Loading spinner element not found');
        }
    }

    async generatePDF() {
        if (!FormUtils.validateRequiredFields()) {
            return;
        }

        this.showSpinner();
        
        try {
            const content = document.querySelector('.preview-content');
            if (!content) {
                throw new Error('Preview content element not found');
            }

            const clone = this.createContentClone(content);
            const canvas = await this.generateCanvas(clone);
            document.body.removeChild(clone);
            
            await this.createAndSavePDF(canvas);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            this.hideSpinner();
        }
    }

    createContentClone(content) {
        const clone = content.cloneNode(true);
        document.body.appendChild(clone);
        
        Object.assign(clone.style, {
            width: '210mm',
            padding: '20mm 30mm',
            position: 'fixed',
            left: '-9999px',
            lineHeight: '1.6',
            fontFamily: 'Times New Roman, serif',
            fontSize: '12pt',
            textAlign: 'justify',
            marginBottom: '12pt'
        });

        return clone;
    }

    async generateCanvas(clone) {
        const options = {
            scale: 2,
            useCORS: true,
            logging: false,
            width: clone.offsetWidth,
            height: clone.offsetHeight,
            windowWidth: clone.offsetWidth,
            windowHeight: clone.offsetHeight,
            imageTimeout: 0,
            backgroundColor: '#ffffff'
        };

        return await html2canvas(clone, options);
    }

    async createAndSavePDF(canvas) {
        if (!window.jspdf) {
            throw new Error('jsPDF library not loaded');
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const scale = 2;
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = canvas.width * scale;
        scaledCanvas.height = canvas.height * scale;
        const ctx = scaledCanvas.getContext('2d');
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
        
        ctx.scale(scale, scale);
        ctx.drawImage(canvas, 0, 0);

        const imgWidth = 210;
        const imgHeight = (scaledCanvas.height * imgWidth) / scaledCanvas.width;
        
        const imgData = scaledCanvas.toDataURL('image/jpeg', 0.8);
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        
        pdf.save(`application_${new Date().toISOString().slice(0,10)}.pdf`);
    }

    showSpinner() {
        if (this.spinner) {
            this.spinner.style.display = 'flex';
        }
    }

    hideSpinner() {
        if (this.spinner) {
            this.spinner.style.display = 'none';
        }
    }
}

class ApplicationManager {
    constructor() {
        this.previewManager = new PreviewManager();
        this.pdfGenerator = new PDFGenerator();
        this.initializeEventListeners();
        this.initializeUpdateButton();
    }

    initializeUpdateButton() {
        const updateBtn = document.getElementById('updateDbButton');
        if (updateBtn) {
            updateBtn.addEventListener('click', updateStudentData);
        }
    }

    initializeEventListeners() {
        try {
            // Template selection
            const templateSelect = document.getElementById('template-select');
            if (templateSelect) {
                templateSelect.addEventListener('change', (e) => {
                    if (TEMPLATES[e.target.value]) {
                        this.populateTemplate(TEMPLATES[e.target.value]);
                    }
                });
            }

            // Tab switching
            document.querySelectorAll('.tab-button').forEach(button => {
                button.addEventListener('click', () => this.handleTabSwitch(button));
            });

            // Form updates
            document.querySelectorAll('input, textarea, select').forEach(element => {
                element.addEventListener('input', () => this.previewManager.updatePreview());
            });

            // PDF generation
            const downloadBtn = document.querySelector('.download-btn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    this.pdfGenerator.generatePDF();
                });
            }
        } catch (error) {
            console.error('Error initializing event listeners:', error);
        }
    }

    populateTemplate(template) {
        try {
            const fields = ['subject', 'introduction', 'description', 'reason', 'details', 'closing'];
            fields.forEach(field => {
                const element = document.getElementById(field);
                if (element) {
                    element.value = template[field];
                }
            });
            this.previewManager.updatePreview();
        } catch (error) {
            console.error('Error populating template:', error);
        }
    }

    handleTabSwitch(button) {
        try {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const tabContent = document.getElementById(button.dataset.tab);
            if (tabContent) {
                tabContent.classList.add('active');
            }
            
            if (button.dataset.tab === 'preview') {
                this.previewManager.updatePreview();
            }
        } catch (error) {
            console.error('Error handling tab switch:', error);
        }
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load templates first
        await loadTemplates();
        
        // Initialize the application manager
        const app = new ApplicationManager();
        
        // Add event listener for student ID input
        const studentIdInput = document.getElementById('studentId');
        if (studentIdInput) {
            studentIdInput.addEventListener('input', (e) => {
                const studentId = e.target.value;
                if (studentId.length >= 5) {
                    fetchStudentData(studentId);
                }
            });
        }
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});