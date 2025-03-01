const { createClient } = window.supabase; // Use the CDN-loaded version instead of ES module

let TEMPLATES = {};

async function loadTemplates() {
    try {
        const response = await fetch('jsonData/templates.json');
        if (!response.ok) throw new Error('Failed to load templates');
        TEMPLATES = await response.json();
        
        // Initialize templates directly in the search instance
        if (window.applicationInstance?.templateSearch) {
            window.applicationInstance.templateSearch.setTemplates(TEMPLATES);
        }
    } catch (error) {
        console.error('Error loading templates:', error);
    }
}
// Load universities into select dropdown
async function loadUniversities() {
    try {
        const response = await fetch('jsonData/universities.json');
        if (!response.ok) {
            throw new Error('Failed to load universities');
        }
        const data = await response.json();
        const dataList = document.getElementById('university-list');
        if (!dataList) {
            throw new Error('Could not find university-list element');
        }
        // Clear existing options
        dataList.innerHTML = '';
        // Add new options
        data.forEach(university => {
            const option = document.createElement('option');
            option.value = university.name;
            dataList.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading universities:', error);
    }
}
// Load student universities into datalist
async function loadStudentUniversities() {
    try {
        const response = await fetch('jsonData/universities.json');
        if (!response.ok) {
            throw new Error('Failed to load student universities');
        }
        const data = await response.json();
        const dataList = document.getElementById('student-university-list');
        if (!dataList) {
            throw new Error('Could not find student-university-list element');
        }
        // Clear existing options
        dataList.innerHTML = '';
        // Add new options
        data.forEach(university => {
            const option = document.createElement('option');
            option.value = university.name;
            dataList.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading student universities:', error);
    }
}
// Load student departments into datalist
async function loadStudentDepartments() {
    try {
        const response = await fetch('jsonData/departments.json');
        if (!response.ok) {
            throw new Error('Failed to load student departments');
        }
        const data = await response.json();
        const dataList = document.getElementById('department-list');
        if (!dataList) {
            throw new Error('Could not find department-list element');
        }
        // Clear existing options
        dataList.innerHTML = '';
        // Add new options
        data.departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            dataList.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading student departments:', error);
    }
}


async function loadTeacherDesignation() {
    try {
        const response = await fetch('jsonData/designation.json');
        if (!response.ok) {
            throw new Error('Failed to load teacher designation');
        }
        const data = await response.json();
        const dataList = document.getElementById('designation-list');
        if (!dataList) {
            throw new Error('Could not find designation-list element');
        }
        // Clear existing options
        dataList.innerHTML = '';
        // Add new options
        data.forEach(designation => {
            const option = document.createElement('option');
            option.value = designation.name;
            dataList.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading teacher designation:', error);
    }
}
// Load departments into datalist
async function loadDepartments() {
    try {
        const response = await fetch('jsonData/departments.json');
        if (!response.ok) {
            throw new Error('Failed to load departments');
        }
        const data = await response.json();
        const dataList = document.getElementById('department-list');
        if (!dataList) {
            throw new Error('Could not find department-list element');
        }
        // Clear existing options
        dataList.innerHTML = '';
        // Add new options
        data.departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            dataList.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

// Initialize Supabase client outside any function
const supabaseClient = createClient(
    'https://wcekcagojgvgkfhbgnfy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjZWtjYWdvamd2Z2tmaGJnbmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyOTA0MTAsImV4cCI6MjA1Mzg2NjQxMH0.hryXIl30caQ_ILCv1iwyjRcRWpJXjJXeVk1e8xRbVrg'
);


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
                // 'contactInfo': data.contact_info
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

    static countBodyWords() {
        const bodyFields = ['date', 'designation', 'universityName', 'department', 'subject', 'gender', 'introduction', 'description', 'reason', 'details', 'closing', 'studentName', 'studentId', 'studentSection', 'studentDepartment', 'studentUniversityName', 'contactInfo'];
        let totalWords = 0;

        bodyFields.forEach(field => {
            const text = document.getElementById(field).value.trim();
            totalWords += text ? text.split(/\s+/).length : 0;
        });

        return totalWords;
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
        
        // Update word count display
        const wordCount = FormUtils.countBodyWords();
        this.updateElement('preview-word-count', 
            `Word Count: ${wordCount} / 200 words (${Math.round(wordCount/200*100)}% of typical page)`);
        
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
            ${formData.studentDepartment}<br>
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
        
        // Match exact preview styling
        Object.assign(clone.style, {
            width: '210mm',
            minHeight: '297mm',
            padding: '25.4mm',
            position: 'fixed',
            left: '-9999px',
            lineHeight: '1.5',
            fontFamily: 'Times New Roman, serif',
            fontSize: '12pt',
            textAlign: 'justify',
            backgroundColor: '#ffffff'
        });

        // Apply consistent styling to all text elements
        const elements = clone.querySelectorAll('div');
        elements.forEach(element => {
            element.style.fontFamily = 'Times New Roman, serif';
            element.style.fontSize = '12pt';
            
            // Match preview margins
            if (element.id === 'preview-recipient' || element.id === 'preview-signature') {
                element.style.lineHeight = '1.6';
            }
            
            if (['preview-date', 'preview-recipient', 'preview-subject', 'preview-salutation', 'preview-body'].includes(element.id)) {
                element.style.marginBottom = '1.5rem';
            }
            
            if (element.id === 'preview-signature') {
                element.style.marginTop = '2rem';
            }
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
            compress: true,
            putOnlyUsedFonts: true,
            floatPrecision: 16
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
        
        const imgData = scaledCanvas.toDataURL('image/jpeg', 1.0);
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        
        const studentId = document.getElementById('studentId')?.value?.trim() || 'unknown';
        const currentDate = new Date().toISOString().slice(0,10); 
        const name = (document.getElementById('pdfName')?.value?.trim() || `${studentId}_Application_${currentDate}`).replace(/\s+/g, '_');
        pdf.save(`${name}.pdf`);
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
//docs generator class
class DocxGenerator {
    constructor() {
        this.spinner = document.getElementById('loadingSpinner');
    }

    async generateDOCX() {
        if (!FormUtils.validateRequiredFields()) {
            return;
        }

        this.showSpinner();

        try {
            if (typeof docx === 'undefined') {
                throw new Error('DOCX library not loaded');
            }

            const formData = FormUtils.getFormData();
            const doc = this.createDocument(formData);
            await this.saveDocument(doc);
        } catch (error) {
            console.error('Error generating DOCX:', error);
            alert('Error generating DOCX. Please try again.');
        } finally {
            this.hideSpinner();
        }
    }

    createDocument(formData) {
        const doc = new docx.Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: docx.convertInchesToTwip(1),
                            right: docx.convertInchesToTwip(1),
                            bottom: docx.convertInchesToTwip(1),
                            left: docx.convertInchesToTwip(1),
                        },
                    },
                },
                children: [
                    // Date
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: formData.date,
                                bold: true,
                                size: 24, // 12pt font
                            }),
                        ],
                        spacing: {
                            after: 300,
                            line: 360,
                            lineRule: "auto"
                        },
                        alignment: docx.AlignmentType.LEFT
                    }),

                    // Recipient Information
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "To",
                                size: 24
                            }),
                            new docx.TextRun({
                                text: formData.designation,
                                break: 1,
                                size: 24
                            }),
                            new docx.TextRun({
                                text: formData.department || '',
                                break: formData.department ? 1 : 0,
                                size: 24
                            }),
                            new docx.TextRun({
                                text: formData.universityName,
                                break: 1,
                                size: 24
                            }),
                        ],
                        spacing: {
                            after: 300,
                            line: 360,
                            lineRule: "auto"
                        },
                        alignment: docx.AlignmentType.LEFT
                    }),

                    // Subject
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `Subject: ${formData.subject}`,
                                bold: true,
                                size: 24
                            }),
                        ],
                        spacing: {
                            after: 300,
                            line: 360,
                            lineRule: "auto"
                        },
                        alignment: docx.AlignmentType.LEFT
                    }),

                    // Salutation
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `Dear ${formData.gender},`,
                                size: 24
                            }),
                        ],
                        spacing: {
                            after: 300,
                            line: 360,
                            lineRule: "auto"
                        },
                        alignment: docx.AlignmentType.LEFT
                    }),

                    // Body Content
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: `${formData.introduction} ${formData.description} ${formData.reason}`,
                                size: 24
                            }),
                        ],
                        spacing: {
                            after: 300,
                            line: 360,
                            lineRule: "auto"
                        },
                        alignment: docx.AlignmentType.JUSTIFIED
                    }),

                    // Details (if available)
                    ...(formData.details ? [new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: formData.details,
                                size: 24
                            }),
                        ],
                        spacing: {
                            after: 300,
                            line: 360,
                            lineRule: "auto"
                        },
                        alignment: docx.AlignmentType.JUSTIFIED
                    })] : []),

                    // Closing
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: formData.closing,
                                size: 24
                            }),
                        ],
                        spacing: {
                            after: 300,
                            line: 360,
                            lineRule: "auto"
                        },
                        alignment: docx.AlignmentType.JUSTIFIED
                    }),

                    // Signature
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Yours sincerely,",
                                size: 24
                            }),
                            new docx.TextRun({
                                text: "",
                                break: 2,
                                size: 24
                            }),
                            new docx.TextRun({
                                text: formData.studentName,
                                size: 24
                            }),
                            new docx.TextRun({
                                text: `ID: ${formData.studentId}`,
                                break: 1,
                                size: 24
                            }),
                            ...(formData.studentSection ? [new docx.TextRun({
                                text: `Section: ${formData.studentSection}`,
                                break: 1,
                                size: 24
                            })] : []),
                            new docx.TextRun({
                                text: formData.studentDepartment,
                                break: 1,
                                size: 24
                            }),
                            new docx.TextRun({
                                text: formData.studentUniversityName,
                                break: 1,
                                size: 24
                            }),
                            ...(formData.contactInfo ? [new docx.TextRun({
                                text: formData.contactInfo,
                                break: 1,
                                size: 24
                            })] : []),
                        ],
                        spacing: {
                            line: 360,
                            lineRule: "auto"
                        },
                        alignment: docx.AlignmentType.LEFT
                    }),
                ],
            }],
        });

        return doc;
    }

    async saveDocument(doc) {
        try {
            const blob = await docx.Packer.toBlob(doc);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const studentId = document.getElementById('studentId')?.value?.trim() || 'unknown';
            const currentDate = new Date().toISOString().slice(0,10); 
            const name = document.getElementById('pdfName')?.value?.trim() || `${studentId}_Application_${currentDate}`;
            link.download = `${name}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            throw new Error(`Error saving document: ${error.message}`);
        }
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
        this.docxGenerator = new DocxGenerator();
        this.templateSearch = new TemplateSearch();
        // Initialize template search after creation
        this.templateSearch.setTemplates(TEMPLATES);
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
            // Form updates
            document.querySelectorAll('input, textarea, select').forEach(element => {
                element.addEventListener('input', () => this.previewManager.updatePreview());
            });

            // Download buttons
            const downloadBtn = document.querySelector('.download-btn');
            const downloadDocxBtn = document.querySelector('.download-docx-btn');

            if (downloadBtn) {
                const newDownloadBtn = downloadBtn.cloneNode(true);
                downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);
                newDownloadBtn.addEventListener('click', () => this.pdfGenerator.generatePDF());
            }

            if (downloadDocxBtn) {
                const newDownloadDocxBtn = downloadDocxBtn.cloneNode(true);
                downloadDocxBtn.parentNode.replaceChild(newDownloadDocxBtn, downloadDocxBtn);
                newDownloadDocxBtn.addEventListener('click', () => this.docxGenerator.generateDOCX());
            }

            // Tab switching
            document.querySelectorAll('.tab-button').forEach(button => {
                button.addEventListener('click', () => this.handleTabSwitch(button));
            });
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
                    element.value = template[field] || '';
                    element.dispatchEvent(new Event('input', { bubbles: true }));
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
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load templates first
        await loadTemplates();
        
        // Initialize the application manager
        window.applicationInstance = new ApplicationManager();
        
        // Load other data
        await Promise.all([
            loadUniversities(),
            loadTeacherDesignation(),
            loadDepartments(),
            loadStudentUniversities(),
            loadStudentDepartments()
        ]);
        
        // Initialize student ID listener
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
// Add this to your script.js file

class TemplateSearch {
    constructor() {
        this.searchInput = null;
        this.searchResults = null;
        this.templates = {};
        this.selectedTemplate = null;
        this.onTemplateSelect = null;
        this.initializeSearchUI();
        this.addEventListeners();
    }

    initializeSearchUI() {
        // Create search container
        const templateSection = document.querySelector('.template-section');
        if (!templateSection) {
            console.error('Template section not found');
            return;
        }

        const searchContainer = document.createElement('div');
        searchContainer.className = 'form-group template-search';
        
        // Create search input
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.id = 'template-search';
        this.searchInput.className = 'form-control';
        this.searchInput.placeholder = 'Search templates...';
        
        // Create search results container
        this.searchResults = document.createElement('div');
        this.searchResults.className = 'template-search-results';
        this.searchResults.style.cssText = `
            display: none;
            position: absolute;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            max-height: 300px;
            overflow-y: auto;
            width: 100%;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        
        // Add elements to DOM
        searchContainer.appendChild(this.searchInput);
        searchContainer.appendChild(this.searchResults);
        
        // Insert before template select
        const templateSelect = document.getElementById('template-select');
        if (templateSelect && templateSelect.parentElement) {
            templateSection.insertBefore(searchContainer, templateSelect.parentElement);
        } else {
            templateSection.appendChild(searchContainer);
        }
    }

    addEventListeners() {
        if (!this.searchInput || !this.searchResults) return;

        // Debounced search handler
        let searchTimeout;
        this.searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.handleSearch(), 300);
        });

        // Show results on focus
        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.trim()) {
                this.showResults();
            }
        });

        // Handle clicks outside search
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.template-search')) {
                this.hideResults();
            }
        });

        // Prevent clicks within results from bubbling
        this.searchResults.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    setTemplates(templates) {
        this.templates = templates;
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.trim().toLowerCase();

        if (!searchTerm) {
            this.hideResults();
            return;
        }

        const results = this.searchTemplates(searchTerm);
        this.displayResults(results);
    }

    searchTemplates(searchTerm) {
        if (!this.templates || typeof this.templates !== 'object') {
            console.error('Templates not properly loaded:', this.templates);
            return [];
        }

        return Object.entries(this.templates)
            .filter(([key, template]) => {
                const searchableText = [
                    key,
                    template.subject,
                    template.introduction,
                    template.description,
                    template.reason,
                    template.details,
                    template.closing
                ].filter(Boolean).join(' ').toLowerCase();
                
                return searchableText.includes(searchTerm);
            })
            .map(([key, template]) => ({
                key,
                ...template
            }));
    }

    displayResults(results) {
        if (!this.searchResults) return;

        this.searchResults.innerHTML = '';
        
        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'template-result no-results';
            noResults.style.padding = '10px';
            noResults.textContent = 'No templates found';
            this.searchResults.appendChild(noResults);
        } else {
            results.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = 'template-result';
                resultElement.style.cssText = `
                    padding: 10px;
                    cursor: pointer;
                    border-bottom: 1px solid #eee;
                    transition: background-color 0.2s;
                `;
                
                resultElement.innerHTML = `
                    <div style="font-weight: bold">${this.formatTemplateName(result.key)}</div>
                    <div style="color: #666; font-size: 0.9em">${result.subject || ''}</div>
                `;
                
                resultElement.addEventListener('mouseenter', () => {
                    resultElement.style.backgroundColor = '#f5f5f5';
                });
                
                resultElement.addEventListener('mouseleave', () => {
                    resultElement.style.backgroundColor = 'white';
                });
                
                resultElement.addEventListener('click', () => {
                    this.selectTemplate(result.key);
                });
                
                this.searchResults.appendChild(resultElement);
            });
        }
        
        this.showResults();
    }

    formatTemplateName(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    selectTemplate(templateKey) {
        // Update template select dropdown
        const templateSelect = document.getElementById('template-select');
        if (templateSelect) {
            templateSelect.value = templateKey;
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            templateSelect.dispatchEvent(event);
        }
        
        // Populate template directly
        const template = this.templates[templateKey];
        if (template) {
            this.populateTemplate(template);
        }
        
        // Call the callback if it exists
        if (this.onTemplateSelect) {
            this.onTemplateSelect(templateKey);
        }
        
        this.hideResults();
        this.searchInput.value = '';
        this.selectedTemplate = templateKey;
    }

    populateTemplate(template) {
        const fields = ['subject', 'introduction', 'description', 'reason', 'details', 'closing'];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.value = template[field] || '';
                // Trigger input event to update preview
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }

    showResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'block';
        }
    }

    hideResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
    }
}
