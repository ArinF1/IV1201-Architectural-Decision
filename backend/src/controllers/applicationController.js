const applicationService = require('../model/service/applicationService');
const decisionMakingService = require('../model/service/decisionMakingService');
const { HttpError } = require('../errors/httpsError');

/**
 * Handles the creation of a new application.
 * Extracts application data from request body including person_id, competencies, and availabilities.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function for error handling.
 * @returns {Promise<void>} Sends a 201 Created response with the application data.
 */
exports.postApplication = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new HttpError(401, 'Unauthorized', 'UNAUTHORIZED');
        }

        const person_id = req.user.id;
        const competencies = req.body.competencies;
        const availabilities = req.body.availabilities;

        const result = await applicationService.sendApplication({
            person_id: person_id,
            competencies: competencies,
            availabilities: availabilities,
        });

        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Gets a paginated list of applications. Recruiter-only (role_id 1).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
exports.getApplications = async (req, res, next) => {
    try {
        const roleId = req.user && req.user.role_id;
        if (roleId !== 1) {
            throw new HttpError(403, 'Forbidden', 'FORBIDDEN');
        }

        const page = req.query.page;
        const pageSize = req.query.pageSize;
        const hideEmpty = req.query.hideEmpty !== 'false';
        const sortBy = req.query.sortBy || 'status';

        const filters = {
            status: req.query.status || 'all',
            competenceName: req.query.competence || undefined,
            minExperience: req.query.minExperience || undefined,
            availFrom: req.query.availFrom || undefined,
            availTo: req.query.availTo || undefined,
        };

        const result = await applicationService.getApplicationsPage(page, pageSize, hideEmpty, filters, sortBy);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }

};

/**
 * Updates the status of a specific application (accepted/rejected/unhandled).
 * Recruiter-only (role_id 1).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
exports.patchApplicationStatus = async (req, res, next) => {
    try {
        const roleId = req.user && req.user.role_id;
        if (roleId !== 1) {
            throw new HttpError(403, 'Forbidden', 'FORBIDDEN');
        }

        const applicationId = req.params.id;
        const newStatus = req.body.status;

        const result = await applicationService.updateStatus(applicationId, newStatus);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};


/**
 * Retrieves all available competencies.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends a 200 OK response with an array of competencies.
 */
exports.getCompetencies = async (req, res, next) => {
    try {
        const competencies = await applicationService.getCompetencies();
        res.status(200).json({ success: true, data: competencies });
    } catch (error) {
        next(error);
    }
};

/**
 * Processes all unhandled applications with automated decision-making.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends a 200 OK response with processing results.
 */
exports.autoProcessApplications = async (req, res, next) => {
    try {
        const result = await decisionMakingService.processUnhandledApplications();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};