const applicationRepo = require('../../integration/repositories/applicationRepo');
const ApplicationDTO = require('../dto/applicationDTO');
const { sequelize } = require('../../integration/persistence');
const { HttpError } = require('../../errors/httpsError');

class ApplicationService {

    /**
     * Creates a new application with competencies and availabilities.
     * @param {Object} applicationData - The application data.
     * @param {number} applicationData.person_id - The ID of the person submitting.
     * @param {Array} applicationData.competencies - Array of competence profiles.
     * @param {Array} applicationData.availabilities - Array of availability periods.
     * @return {Object} The created application data.
     */
    async sendApplication(applicationData) {
        this.validateApplicationSubmission(applicationData);

        return sequelize.transaction(async function (transaction) {
            return applicationRepo.submitApplication(applicationData, transaction);
        });
    }


    /**
     * Validates the application data for submission. Checks for required fields and correct formats.
     * @param {Object} applicationData - The application submission data.
     */
    validateApplicationSubmission(applicationData) {
        if (!applicationData || !applicationData.person_id) {
            throw new HttpError(400, "Person ID is required", "BAD_REQUEST");
        }

        if (!applicationData.competencies || applicationData.competencies.length === 0) {
            throw new HttpError(400, "At least one competence is required", "BAD_REQUEST");
        }

        if (!applicationData.availabilities || applicationData.availabilities.length === 0) {
            throw new HttpError(400, "At least one availability period is required", "BAD_REQUEST");
        }


        // Validate competencies
        for (const comp of applicationData.competencies) {
            if (!comp.competence_id || comp.years_of_experience === undefined || comp.years_of_experience === null) {
                throw new HttpError(400, "Each competence must have competence_id and years_of_experience", "BAD_REQUEST");
            }
            if (Number(comp.years_of_experience) < 0) {
                throw new HttpError(400, "Years of experience can't be negative", "BAD_REQUEST");
            }
        }

        // Validate availabilities
        for (const avail of applicationData.availabilities) {
            if (!avail.from_date || !avail.to_date) {
                throw new HttpError(400, "Each availability must have from_date and to_date", "BAD_REQUEST");
            }
            if (new Date(avail.from_date) > new Date(avail.to_date)) {
                throw new HttpError(400, "from_date cannot be after to_date", "BAD_REQUEST");
            }
        }
    }

    /**
     * Gets all available competencies.
     * @return {Array} Array of competence objects.
     */
    async getCompetencies() {
        const competencies = await applicationRepo.listCompetencies();
        if (!competencies) {
            throw new Error("Failed to retrieve competencies");
        }
        return competencies;
    }

    /**
     * Merges duplicate competence entries for an applicant by summing years of experience.
     * @param {Array} profiles - Raw competenceProfile rows.
     * @returns {Array} Deduplicated and summed profiles.
     */
    mergeCompetences(profiles) {
        const map = new Map();
        for (const cp of profiles) {
            const key = (cp.competence && cp.competence.name ? cp.competence.name : '').toLowerCase();
            if (map.has(key)) {
                map.get(key).yearsOfExperience += Number(cp.years_of_experience) || 0;
            } else {
                map.set(key, {
                    competenceId: cp.competence_id,
                    competenceName: cp.competence ? cp.competence.name : null,
                    yearsOfExperience: Number(cp.years_of_experience) || 0,
                });
            }
        }
        return Array.from(map.values());
    }

    /**
     * Returns total years of experience across all competence profiles in a DTO.
     * @param {ApplicationDTO} app
     * @returns {number}
     */
    totalExperience(app) {
        return (app.competenceProfiles || []).reduce((sum, cp) => sum + (Number(cp.yearsOfExperience) || 0), 0);
    }

    /**
     * Gets applications for a specific page with optional filtering and sorting.
     * Filtering and sorting are applied over the full dataset; pagination is applied last.
     * @param {number} page - The page number (1-indexed).
     * @param {number} pageSize - The number of applications per page.
     * @param {boolean} hideEmpty - Whether to hide empty applications.
     * @param {Object} filters - Optional filter criteria (competenceName, minExperience, availFrom, availTo, status).
     * @param {string} sortBy - Sort key: 'status' | 'experience'.
     * @returns {Object} The paginated applications and metadata.
     */
    async getApplicationsPage(page, pageSize, hideEmpty, filters = {}, sortBy = 'status') {
        const STATUS_ORDER = { unhandled: 0, accepted: 1, rejected: 2 };
        const safePage = Number(page) || 1;
        const safePageSize = Math.min(Number(pageSize) || 10, 100);

        if (safePage < 1 || safePageSize < 1) {
            throw new HttpError(400, "Invalid page or pageSize", "BAD_REQUEST");
        }

        // Repo returns full filtered list (no DB-level limit/offset)
        const rawApplications = await applicationRepo.listApplications(
            {
                competenceName: filters.competenceName,
                minExperience: filters.minExperience,
                availFrom: filters.availFrom,
                availTo: filters.availTo,
            },
            hideEmpty !== false
        );

        // Map to DTOs with merged competences
        let dtoApplications = rawApplications.map(app => {
            const p = app.person || {};
            const mergedProfiles = this.mergeCompetences(p.competenceProfiles || []);

            return new ApplicationDTO({
                applicationId: app.application_id,
                personId: p.person_id,
                personNumber: p.pnr,
                fullName: `${p.name || ""} ${p.surname || ""}`.trim(),
                status: app.status || "unhandled",
                competenceProfiles: mergedProfiles,
                availabilities: (p.availabilities || []).map(a => ({
                    fromDate: a.from_date,
                    toDate: a.to_date
                }))
            });
        });

        // Filter by status (derived field, not in DB)
        if (filters.status && filters.status !== 'all') {
            dtoApplications = dtoApplications.filter(app => app.status === filters.status);
        }

        // Sort full dataset
        dtoApplications.sort((a, b) => {
            if (sortBy === 'experience') {
                return this.totalExperience(b) - this.totalExperience(a);
            }
            // Default: sort by status triage order
            const ao = STATUS_ORDER[a.status] ?? 99;
            const bo = STATUS_ORDER[b.status] ?? 99;
            return ao - bo;
        });

        const totalCount = dtoApplications.length;
        const totalPages = Math.ceil(totalCount / safePageSize) || 1;
        const offset = (safePage - 1) * safePageSize;
        const paged = dtoApplications.slice(offset, offset + safePageSize);

        return { page: safePage, pageSize: safePageSize, totalCount, totalPages, applications: paged };
    }


}

module.exports = new ApplicationService();