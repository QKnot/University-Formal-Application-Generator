// constants.js
// Fetch templates from JSON file
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

// Load templates when the script starts
loadTemplates();

// utils.js
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
        return {
            date: this.formatDate(document.getElementById('date').value),
            designation: document.getElementById('designation').value,
            universityName: document.getElementById('universityName').value,
            department: document.getElementById('department').value,
            subject: document.getElementById('subject').value,
            gender: document.getElementById('gender').value,
            introduction: document.getElementById('introduction').value,
            description: document.getElementById('description').value,
            reason: document.getElementById('reason').value,
            details: document.getElementById('details').value,
            closing: document.getElementById('closing').value,
            studentName: document.getElementById('studentName').value,
            studentId: document.getElementById('studentId').value,
            studentSection: document.getElementById('studentSection').value,
            studentDepartment: document.getElementById('studentDepartment').value,
            studentUniversityName: document.getElementById('studentUniversityName').value,
            contactInfo: document.getElementById('contactInfo').value
        };
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

// preview.js
class PreviewManager {
    constructor() {
        this.previewContent = document.querySelector('.preview-content');
    }

    updatePreview() {
        const formData = FormUtils.getFormData();        
        document.getElementById('preview-date').innerHTML = `<strong>${formData.date}</strong>`;
        document.getElementById('preview-recipient').innerHTML = this.generateRecipientHTML(formData);
        document.getElementById('preview-subject').innerHTML = `<strong>Subject: ${formData.subject}</strong>`;
        document.getElementById('preview-salutation').textContent = `Dear ${formData.gender},`;
        document.getElementById('preview-body').innerHTML = this.generateBodyHTML(formData);
        document.getElementById('preview-signature').innerHTML = this.generateSignatureHTML(formData);
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

// pdfGenerator.js
class PDFGenerator {
    constructor() {
        this.spinner = document.getElementById('loadingSpinner');
    }

    async generatePDF() {
        if (!FormUtils.validateRequiredFields()) {
            return;
        }

        this.showSpinner();
        
        try {
            const content = document.querySelector('.preview-content');
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
        this.spinner.style.display = 'flex';
    }

    hideSpinner() {
        this.spinner.style.display = 'none';
    }
}

// app.js
class ApplicationManager {
    constructor() {
        this.previewManager = new PreviewManager();
        this.pdfGenerator = new PDFGenerator();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Template selection
        document.getElementById('template-select').addEventListener('change', (e) => {
            if (TEMPLATES[e.target.value]) {
                this.populateTemplate(TEMPLATES[e.target.value]);
            }
        });

        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => this.handleTabSwitch(button));
        });

        // Form updates
        document.querySelectorAll('input, textarea, select').forEach(element => {
            element.addEventListener('input', () => this.previewManager.updatePreview());
        });

        // PDF generation
        document.querySelector('.download-btn').addEventListener('click', () => {
            this.pdfGenerator.generatePDF();
        });
    }

    populateTemplate(template) {
        const fields = ['subject', 'introduction', 'description', 'reason', 'details', 'closing'];
        fields.forEach(field => {
            document.getElementById(field).value = template[field];
        });
        this.previewManager.updatePreview();
    }

    handleTabSwitch(button) {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
        
        if (button.dataset.tab === 'preview') {
            this.previewManager.updatePreview();
        }
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    new ApplicationManager();
});