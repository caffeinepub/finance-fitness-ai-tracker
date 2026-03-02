import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Transaction {
    date: string;
    description: string;
    category: Variant_saving_other_investment_needs;
    amount: number;
}
export interface MealLog {
    date: string;
    portionSize: string;
    estimatedCalories: number;
    mealName: string;
}
export type WorkoutSplit = {
    __kind__: "pushPullLegs";
    pushPullLegs: null;
} | {
    __kind__: "upperLower";
    upperLower: null;
} | {
    __kind__: "custom";
    custom: string;
} | {
    __kind__: "fullBody";
    fullBody: null;
} | {
    __kind__: "broSplit";
    broSplit: null;
};
export interface Workout {
    weight: number;
    duration: number;
    date: string;
    reps: number;
    sets: number;
    exercise: string;
    muscleGroup: string;
}
export interface DailyMetrics {
    date: string;
    calories: number;
    steps: bigint;
}
export interface UserProfile {
    height?: number;
    fitnessGoal: Variant_cut_bulk;
    preferredCurrency: string;
    goalWeight?: number;
    bodyWeight?: number;
    profession?: string;
    workoutSplit?: WorkoutSplit;
    income?: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_cut_bulk {
    cut = "cut",
    bulk = "bulk"
}
export enum Variant_saving_other_investment_needs {
    saving = "saving",
    other = "other",
    investment = "investment",
    needs = "needs"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyMetrics(): Promise<Array<DailyMetrics>>;
    getMealLogs(): Promise<Array<MealLog>>;
    getTransactions(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkouts(): Promise<Array<Workout>>;
    isCallerAdmin(): Promise<boolean>;
    logDailyMetrics(metrics: DailyMetrics): Promise<void>;
    logMeal(mealLog: MealLog): Promise<void>;
    logTransaction(transaction: Transaction): Promise<void>;
    logWorkout(workout: Workout): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateFinanceProfile(income: number | null, profession: string | null): Promise<void>;
    updateFitnessProfile(bodyWeight: number | null, height: number | null, goalWeight: number | null, workoutSplit: WorkoutSplit | null): Promise<void>;
}
