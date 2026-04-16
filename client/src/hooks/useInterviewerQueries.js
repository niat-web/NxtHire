import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { interviewerKeys } from './queryKeys';
import * as interviewerApi from '../api/interviewer.api';

const select = (res) => res.data.data;

export const useInterviewerMetrics = (options) =>
  useQuery({
    queryKey: interviewerKeys.metrics(),
    queryFn: () => interviewerApi.getMetrics(),
    select,
    staleTime: 2 * 60 * 1000,
    ...options,
  });

export const useInterviewerProfile = (options) =>
  useQuery({
    queryKey: interviewerKeys.profile(),
    queryFn: () => interviewerApi.getProfile(),
    select,
    ...options,
  });

export const useAssignedInterviews = (options) =>
  useQuery({
    queryKey: interviewerKeys.assignedInterviews(),
    queryFn: () => interviewerApi.getAssignedInterviews(),
    select,
    staleTime: 30 * 1000,
    ...options,
  });

export const useAssignedDomains = (options) =>
  useQuery({
    queryKey: interviewerKeys.assignedDomains(),
    queryFn: () => interviewerApi.getAssignedDomains(),
    select,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useInterviewerEvaluationSummary = (options) =>
  useQuery({
    queryKey: interviewerKeys.evaluationSummary(),
    queryFn: () => interviewerApi.getInterviewerEvaluationSummary(),
    select,
    staleTime: 60 * 1000,
    ...options,
  });

export const useInterviewerEvaluationData = (params, options) =>
  useQuery({
    queryKey: interviewerKeys.evaluationData(params),
    queryFn: () => interviewerApi.getEvaluationDataForInterviewer(params),
    select,
    staleTime: 60 * 1000,
    ...options,
  });

export const useBookingRequests = (options) =>
  useQuery({
    queryKey: interviewerKeys.bookingRequests(),
    queryFn: () => interviewerApi.getBookingRequests(),
    select,
    staleTime: 30 * 1000,
    ...options,
  });

export const usePaymentHistory = (params, options) =>
  useQuery({
    queryKey: interviewerKeys.paymentHistory(params),
    queryFn: () => interviewerApi.getPaymentHistory(params),
    select,
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });

export const useNotificationPreferences = (options) =>
  useQuery({
    queryKey: interviewerKeys.notificationPreferences(),
    queryFn: () => interviewerApi.getNotificationPreferences(),
    select,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useInvalidateInterviewer = () => {
  const queryClient = useQueryClient();
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: interviewerKeys.all }),
    invalidateMetrics: () => queryClient.invalidateQueries({ queryKey: interviewerKeys.metrics() }),
    invalidateProfile: () => queryClient.invalidateQueries({ queryKey: interviewerKeys.profile() }),
    invalidateInterviews: () => queryClient.invalidateQueries({ queryKey: interviewerKeys.assignedInterviews() }),
    invalidateBookings: () => queryClient.invalidateQueries({ queryKey: interviewerKeys.bookingRequests() }),
    invalidateEvaluation: () => queryClient.invalidateQueries({ queryKey: [...interviewerKeys.all, 'evaluation-data'] }),
    invalidateNotificationPreferences: () => queryClient.invalidateQueries({ queryKey: interviewerKeys.notificationPreferences() }),
  };
};
