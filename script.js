// constants.js
const TEMPLATES = {
    registrationExtension: {
        subject: 'Application for Semester Registration Payment Extension and Penalty Waiver.',
        introduction: 'I hope this letter finds you in good health. I am writing to kindly request an extension of time to pay the required 40% of the semester registration fees.',
        description: 'I already paid some of my total registration fees. Unfortunately, due to some recent family issues and financial difficulties, I am currently unable to make the full payment within the given timeframe.',
        reason: 'I fully understand the importance of meeting my financial obligations, and I am actively working towards resolving the situation.',
        details: 'I respectfully request that I be granted some additional time to complete the payment without incurring any penalties.',
        closing: 'I would be extremely grateful if my request could be considered and I am allowed to proceed with registration without any penalties. Thank you for your understanding and support during this challenging time.'
    },
    feeExtension: { 
        subject: 'Application for Semester Fee Extension',
        introduction: 'I am writing this application to request an extension for my semester fee payment.',
        description: 'I am requesting a two-week extension for paying my current semester fees.',
        reason: 'Due to unexpected financial circumstances, I require additional time to arrange the payment.',
        details: 'I have always maintained a good payment record in previous semesters.',
        closing: 'I would be grateful if my request for fee extension could be considered. I assure you that I will make the payment within the extended timeline.'
    },
    leaveAbsence: {
        subject: 'Application for Leave of Absence',
        introduction: 'I am writing to request a leave of absence from classes.',
        description: 'I need to take leave for three days, from [start date] to [end date].',
        reason: 'I have a family emergency that requires my immediate attention.',
        details: 'I will ensure to catch up with any missed classes and assignments upon my return.',
        closing: 'I would appreciate your understanding and approval of my leave request.'
    },
    certificateRequest: {
        subject: 'Request for Academic Transcript',
        introduction: 'I am writing to request my academic transcript.',
        description: 'I need an official copy of my academic transcript for further studies application.',
        reason: 'The transcript is required for my graduate school application process.',
        details: 'I need both digital and physical copies of the transcript.',
        closing: 'I would appreciate if you could process my request at your earliest convenience.'
    }
};

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
            contactInfo: document.getElementById('contactInfo').value
        };
    }
}

// preview.js
class PreviewManager {
    constructor() {
        this.previewContent = document.querySelector('.preview-content');
    }

    updatePreview() {
        const formData = FormUtils.getFormData();        
        document.getElementById('preview-date').textContent = formData.date;
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
            Section: ${formData.studentSection}<br>
            Department: ${formData.studentDepartment}<br>
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
            scale: 1.5,
            useCORS: true,
            logging: false,
            width: clone.offsetWidth,
            height: clone.offsetHeight,
            windowWidth: clone.offsetWidth,
            windowHeight: clone.offsetHeight,
            imageTimeout: 0,
            removeContainer: true,
            letterRendering: true
        };

        return await html2canvas(clone, options);
    }

    async createAndSavePDF(canvas) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: false,
            precision: 32 // Increased precision for sharper rendering
        });

        // Increase canvas scale for much higher resolution
        const scale = 4; // Increased scale factor
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = canvas.width * scale;
        scaledCanvas.height = canvas.height * scale;
        const ctx = scaledCanvas.getContext('2d');
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.scale(scale, scale);
        ctx.drawImage(canvas, 0, 0);

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (scaledCanvas.height * imgWidth) / scaledCanvas.width;
        
        // Convert to high quality PNG
        const imgData = scaledCanvas.toDataURL('image/png', 1.0);
        
        // Add image with highest quality settings
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
        
        // Apply PDF compression optimization
        pdf.setProperties({
            title: 'Application',
            creator: 'Application Generator',
            compress: true
        });
        
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