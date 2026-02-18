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
 *  Retrieves a paginated list of applications for recruiters, with optional filtering to hide empty applications.
 *  Checks that user has role_id 1 before proceeding.
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

        const result = await applicationService.getApplicationsPage(page, pageSize, hideEmpty);
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