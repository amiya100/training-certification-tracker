# Training and Certification Tracking System
A comprehensive platform to track employee training programs, certifications, and validity periods with compliance reporting.


## ✨ Features
📊 **Dashboard & Analytics** - Comprehensive overview with key metrics, employee status tracking, certification expiry alerts, training progress  
👥 **Employee Management** - Create and manage employees in the company  
🎓 **Training Management** - Create and manage training courses  
📋 **Enrollment Tracking** - Assign employees to specific training programs and track progress  
📜 **Certification Management** - Record issued certifications and track expirations  
📈 **Reporting & Compliance** - Generate detailed compliance metrics and export reports in PDF and Excel formats  
🔐 **Security & Authentication** - Secure token-based authentication


## 🌐 Live Deployment
**Live Website:** https://training-certification.netlify.app/  
**Demo Credentials:** Email: skillflow@gmail.com | Password: skillflow1


## 🛠️ Tech Stack
### Backend
- **Framework**: FastAPI
- **Language**: Python
- **ORM**: SQLAlchemy
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Pydantic
- **Time Handling**: pytz
- **Testing**: pytest

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS


## 📊 API Endpoints

### Authentication
- `POST /auth/login` - User login

### Dashboard
- `GET /api/dashboard/dashboard-data` - Comprehensive dashboard metrics

### Employees
- `GET /employees` - List all employees
- `POST /employees` - Create new employee
- `GET /employees/{id}` - Get employee details
- `PUT /employees/{id}` - Update employee
- `DELETE /employees/{id}` - Delete employee

### Departments
- `GET /departments` - List all departments
- `POST /departments` - Create new department
- `PUT /departments/{id}` - Update department
- `DELETE /departments/{id}` - Delete department

### Trainings
- `GET /trainings` - List all trainings
- `POST /trainings` - Create new training
- `GET /trainings/{id}` - Get training details
- `PUT /trainings/{id}` - Update training
- `DELETE /trainings/{id}` - Delete training

### Enrollments
- `GET /enrollments` - List all enrollments
- `POST /enrollments` - Create new enrollment
- `PUT /enrollments/{id}` - Update enrollment
- `PATCH /enrollments/{id}/progress` - Update progress
- `POST /enrollments/{id}/complete` - Mark as completed
- `DELETE /enrollments/{id}` - Delete enrollment

### Certifications
- `GET /certifications` - List all certifications
- `GET /certifications/{id}` - Get certification details

### Compliance Reports
- `POST /api/compliance/report` - Generate compliance report
- `POST /api/compliance/export/{format}` - Export report (pdf/excel)


### Database Configuration
The system uses MySQL with the following main tables:
- `employees` - Employee information
- `departments` - Department information
- `trainings` - Training program details
- `enrollments` - Training enrollment records
- `certifications` - Certification records



---

**Note**: This is a production-ready system with proper authentication, error handling, and security measures. Always use strong passwords and keep your secret keys secure in production environments.
