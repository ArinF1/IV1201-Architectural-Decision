import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          nav: {
            title: 'Job Application System',
            submitApplication: 'Submit Application',
            viewApplications: 'View Applications',
            register: 'Register',
            login: 'Login',
            logout: 'Logout'
          },
          applicationSubmission: {
            title: 'Submit Job Application',
            personalInfo: 'Personal Information',
            personalInfoDesc: 'This information is taken from your registration profile',
            firstName: 'First Name',
            lastName: 'Last Name',
            personNumber: 'Person Number',
            email: 'Email',
            competenceProfile: 'Competence Profile',
            competenceProfileDesc: 'Add your areas of expertise and years of experience',
            areaOfExpertise: 'Area of Expertise',
            yearsOfExperience: 'Years of Experience',
            addCompetence: '+ Add Another Competence',
            availability: 'Availability',
            availabilityDesc: 'Add periods when you are available to work',
            fromDate: 'From Date',
            toDate: 'To Date',
            addPeriod: '+ Add Another Period',
            submit: 'Submit Application',
            submitting: 'Submitting...',
            successMessage: 'Application submitted successfully!',
            errorMessage: 'Failed to submit application',
            loadingCompetencies: 'Loading competencies...',
            failedLoadCompetencies: 'Failed to load competencies',
            selectCompetence: 'Select a competence',
            pleaseSelectCompetence: 'Please select a competence',
            pleaseEnterYears: 'Please enter valid years of experience (0 or more)',
            yearsExceed: 'Years of experience cannot exceed 99.99',
            pleaseSelectStartDate: 'Please select a start date',
            pleaseSelectEndDate: 'Please select an end date',
            endDateAfterStart: 'End date must be after start date'
          },
          applicationList: {
            title: 'Job Applications',
            autoProcess: '🤖 Auto Process',
            refresh: '↻ Refresh',
            sortBy: 'Sort by:',
            filter: 'Filter:',
            submissionDate: 'Submission Date',
            applicantName: 'Applicant Name',
            status: 'Status',
            allApplications: 'All Applications',
            unhandled: 'Unhandled',
            accepted: 'Accepted',
            rejected: 'Rejected',
            noApplications: 'No applications found',
            noApplicationsDesc: 'Try changing the filter',
            competenceProfile: 'Competence Profile',
            availability: 'Availability',
            years: 'years',
            accept: 'Accept',
            reject: 'Reject',
            submitted: 'Submitted',
            loadingApplications: 'Loading applications...'
          },
          registration: {
            title: 'Register',
            firstName: 'First Name',
            lastName: 'Last Name',
            personNumber: 'Person Number',
            email: 'Email',
            username: 'Username',
            password: 'Password',
            register: 'Register',
            registering: 'Registering...',
            errorMessage: 'Registration failed'
          },
          login: {
            title: 'Login',
            username: 'Username',
            password: 'Password',
            login: 'Login',
            loggingIn: 'Logging in...',
            noAccount: "Don't have an account?",
            registerHere: 'Register here',
            errorMessage: 'Login failed'
          },
          common: {
            required: '*',
            loading: 'Loading...',
            error: '⚠️',
            success: '✓'
          }
        }
      },
      sv: {
        translation: {
          nav: {
            title: 'Jobbansökningssystem',
            submitApplication: 'Skicka ansökan',
            viewApplications: 'Visa ansökningar',
            register: 'Registrera',
            login: 'Logga in',
            logout: 'Logga ut'
          },
          applicationSubmission: {
            title: 'Skicka jobbansökan',
            personalInfo: 'Personlig information',
            personalInfoDesc: 'Denna information hämtas från din registreringsprofil',
            firstName: 'Förnamn',
            lastName: 'Efternamn',
            personNumber: 'Personnummer',
            email: 'E-post',
            competenceProfile: 'Kompetensprofil',
            competenceProfileDesc: 'Lägg till dina kompetensområden och års erfarenhet',
            areaOfExpertise: 'Kompetensområde',
            yearsOfExperience: 'Års erfarenhet',
            addCompetence: '+ Lägg till ytterligare kompetens',
            availability: 'Tillgänglighet',
            availabilityDesc: 'Lägg till perioder när du kan arbeta',
            fromDate: 'Från datum',
            toDate: 'Till datum',
            addPeriod: '+ Lägg till ytterligare period',
            submit: 'Skicka ansökan',
            submitting: 'Skickar...',
            successMessage: 'Ansökan har skickats!',
            errorMessage: 'Misslyckades att skicka ansökan',
            loadingCompetencies: 'Laddar kompetenser...',
            failedLoadCompetencies: 'Misslyckades att ladda kompetenser',
            selectCompetence: 'Välj en kompetens',
            pleaseSelectCompetence: 'Vänligen välj en kompetens',
            pleaseEnterYears: 'Vänligen ange giltiga års erfarenhet (0 eller mer)',
            yearsExceed: 'Års erfarenhet kan inte överstiga 99.99',
            pleaseSelectStartDate: 'Vänligen välj ett startdatum',
            pleaseSelectEndDate: 'Vänligen välj ett slutdatum',
            endDateAfterStart: 'Slutdatum måste vara efter startdatum'
          },
          applicationList: {
            title: 'Jobbansökningar',
            autoProcess: '🤖 Automatisk bearbetning',
            refresh: '↻ Uppdatera',
            sortBy: 'Sortera efter:',
            filter: 'Filtrera:',
            submissionDate: 'Inlämningsdatum',
            applicantName: 'Sökandes namn',
            status: 'Status',
            allApplications: 'Alla ansökningar',
            unhandled: 'Ohanterad',
            accepted: 'Godkänd',
            rejected: 'Avvisad',
            noApplications: 'Inga ansökningar hittades',
            noApplicationsDesc: 'Försök ändra filtret',
            competenceProfile: 'Kompetensprofil',
            availability: 'Tillgänglighet',
            years: 'år',
            accept: 'Godkänn',
            reject: 'Avvisa',
            submitted: 'Inskickad',
            loadingApplications: 'Laddar ansökningar...'
          },
          registration: {
            title: 'Registrera',
            firstName: 'Förnamn',
            lastName: 'Efternamn',
            personNumber: 'Personnummer',
            email: 'E-post',
            username: 'Användarnamn',
            password: 'Lösenord',
            register: 'Registrera',
            registering: 'Registrerar...',
            errorMessage: 'Registreringen misslyckades'
          },
          login: {
            title: 'Logga in',
            username: 'Användarnamn',
            password: 'Lösenord',
            login: 'Logga in',
            loggingIn: 'Loggar in...',
            noAccount: 'Har du inget konto?',
            registerHere: 'Registrera här',
            errorMessage: 'Inloggningen misslyckades'
          },
          common: {
            required: '*',
            loading: 'Laddar...',
            error: '⚠️',
            success: '✓'
          }
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
