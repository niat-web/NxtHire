// client/src/api/applicant.api.js
import api from './axios';

export const submitApplication = (data) => {
  return api.post('/api/applicant/apply', data);
};

export const submitSkillAssessment = (id, data) => {
  return api.post(`/api/applicant/${id}/skill-assessment`, data);
};

export const submitGuidelines = (id, data) => {
  return api.post(`/api/applicant/${id}/guidelines`, data);
};

export const checkApplicationStatus = (id) => {
  return api.get(`/api/applicant/status/${id}`);
};