# University Formal Application Generator

A web-based tool that helps students generate professional formal applications and letters for university purposes. The application supports both PDF and DOCX format outputs with a live preview feature.

## Features

- **Live Preview**: See your application format in real-time as you type
- **Multiple Export Options**: Generate applications in both PDF and DOCX formats
- **Template System**: Access and search through pre-defined templates for common application types
- **Student Data Management**: Save and retrieve student information for faster application generation
- **Responsive Design**: Works seamlessly across different devices and screen sizes
- **Word Count Tracking**: Monitor the length of your application in real-time
- **Database Integration**: Secure storage and retrieval of student information via Supabase

## Technologies Used

- **Frontend**:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
  - [html2canvas](https://github.com/niklasvh/html2canvas) for HTML to canvas conversion
  - [docx](https://github.com/dolanmiu/docx) for DOCX file generation

- **Backend**:
  - [Supabase](https://supabase.com/) for database management and authentication

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection for database functionality

### Installation

1. Clone the repository:
```bash
git clone https://github.com/QKnot/University-Formal-Application-Generator.git
```

2. Navigate to the project directory:
```bash
cd University-Formal-Application-Generator
```

3. Open `index.html` in your web browser or set up a local server.

### Configuration

1. Update the Supabase configuration in `script.js` with your own credentials:
```javascript
const supabaseClient = createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
);
```

## Usage

1. Fill in the application details in the form fields:
   - Date
   - Recipient information
   - Subject
   - Application content
   - Student information

2. Use the live preview tab to review your application

3. Generate your application in either PDF or DOCX format using the download buttons

4. Optionally save your information to the database for future use

## Features in Detail

### Template System
- Search through pre-defined templates
- Quick-fill application content based on selected templates
- Customizable template content

### Student Data Management
- Save student information for future use
- Automatic retrieval of saved data
- Secure password protection for data access

### Document Generation
- Professional PDF formatting
- DOCX format support for easy editing
- Consistent styling across different output formats

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Authors

- [Rahul Kumar Ghosh](https://qknot.github.io/Portfolio/)
- [Raul Jobel Baroi](https://sickkick1213.github.io/My_Portfolio/)

## License

This project is licensed under standard copyright laws. All rights reserved.

## Acknowledgments

- University administration staff for providing input on application formats
- The open-source community for providing the tools and libraries used in this project
- All contributors who have helped to improve this application

## Support

For support, please open an issue in the GitHub repository or contact the developers through their portfolio websites.