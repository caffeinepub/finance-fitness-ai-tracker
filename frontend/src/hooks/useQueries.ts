import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Workout, DailyMetrics, Transaction, MealLog } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateFinanceProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ income, profession }: { income: number | null; profession: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateFinanceProfile(income, profession);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateFitnessProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bodyWeight,
      height,
      goalWeight,
    }: {
      bodyWeight: number | null;
      height: number | null;
      goalWeight: number | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateFitnessProfile(bodyWeight, height, goalWeight);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Workouts ─────────────────────────────────────────────────────────────────

export function useGetWorkouts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Workout[]>({
    queryKey: ['workouts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkouts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useLogWorkout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workout: Workout) => {
      if (!actor) throw new Error('Actor not available');
      return actor.logWorkout(workout);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

// ─── Daily Metrics ────────────────────────────────────────────────────────────

export function useGetDailyMetrics() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyMetrics[]>({
    queryKey: ['dailyMetrics'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailyMetrics();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useLogDailyMetrics() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metrics: DailyMetrics) => {
      if (!actor) throw new Error('Actor not available');
      return actor.logDailyMetrics(metrics);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyMetrics'] });
    },
  });
}

// ─── Meal Logs ────────────────────────────────────────────────────────────────

export function useGetMealLogs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MealLog[]>({
    queryKey: ['mealLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMealLogs();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useLogMeal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealLog: MealLog) => {
      if (!actor) throw new Error('Actor not available');
      return actor.logMeal(mealLog);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealLogs'] });
      queryClient.invalidateQueries({ queryKey: ['dailyMetrics'] });
    },
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useGetTransactions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useLogTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Transaction) => {
      if (!actor) throw new Error('Actor not available');
      return actor.logTransaction(transaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
