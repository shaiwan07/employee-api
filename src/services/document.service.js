/**
 * @fileoverview Business logic for the Document Control module (employee side).
 * Employees have read-only access to three document libraries.
 *
 * All three types serve PDFs from static directories on the server:
 *   Method Statements → httpdocs/employeesarea/downloads/methodstatement/<ms1>.pdf
 *   Policies          → httpdocs/employeesarea/downloads/policies/<pol1>.pdf
 *                       (pol4 may override with an external URL set by admin)
 *   COSHH             → httpdocs/employeesarea/downloads/coshh/<cos1>.pdf
 *
 * The download_url field is built here from FILES_BASE_URL so the Flutter app
 * can open or download each document without knowing the server directory layout.
 *
 * @module services/document.service
 */

const DocumentModel = require('../models/document.model');
const { fullUrl } = require('../utils/url.helper');

/**
 * Returns all method statement documents with a download_url for the PDF.
 * The PDF is served from downloads/methodstatement/<reference>.pdf on the web server.
 *
 * @param {string} [search] - Partial match on reference or title.
 * @returns {Promise<Array<{id, reference, title, version, download_url}>>}
 */
const getMethodStatements = async (search) => {
  const rows = await DocumentModel.getMethodStatements(search);
  return rows.map(r => ({
    ...r,
    download_url: r.reference
      ? fullUrl(`downloads/methodstatement/${r.reference}.pdf`)
      : null,
  }));
};

/**
 * Returns all policy documents with a download_url for the PDF.
 * If pol4 (link) is set by admin, that value is used as-is (may be an external URL).
 * Otherwise the URL is constructed from the pol1 reference field.
 *
 * @param {string} [search] - Partial match on reference or title.
 * @returns {Promise<Array<{id, reference, title, version, link, download_url}>>}
 */
const getPolicies = async (search) => {
  const rows = await DocumentModel.getPolicies(search);
  return rows.map(r => ({
    ...r,
    download_url: r.link
      || (r.reference ? fullUrl(`downloads/policies/${r.reference}.pdf`) : null),
  }));
};

/**
 * Returns all COSHH documents with a download_url for the PDF.
 * The PDF is served from downloads/coshh/<reference>.pdf on the web server.
 *
 * @param {string} [search] - Partial match on reference or description.
 * @returns {Promise<Array<{id, reference, title, version, download_url}>>}
 */
const getCoshh = async (search) => {
  const rows = await DocumentModel.getCoshh(search);
  return rows.map(r => ({
    ...r,
    download_url: r.reference
      ? fullUrl(`downloads/coshh/${r.reference}.pdf`)
      : null,
  }));
};

module.exports = { getMethodStatements, getPolicies, getCoshh };
