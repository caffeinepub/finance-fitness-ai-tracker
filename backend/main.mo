import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Nat16 "mo:core/Nat16";
import Iter "mo:core/Iter";
import Nat8 "mo:core/Nat8";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type WorkoutSplit = {
    #pushPullLegs;
    #upperLower;
    #fullBody;
    #broSplit;
    #custom : Text;
  };

  public type UserProfile = {
    preferredCurrency : Text;
    fitnessGoal : {
      #cut;
      #bulk;
    };
    income : ?Float;
    profession : ?Text;
    bodyWeight : ?Float;
    height : ?Float;
    goalWeight : ?Float;
    workoutSplit : ?WorkoutSplit;
  };

  module UserProfile {
    public func compare(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      switch (Text.compare(p1.preferredCurrency, p2.preferredCurrency)) {
        case (#equal) { Text.compare(p1.preferredCurrency, p2.preferredCurrency) };
        case (order) { order };
      };
    };
  };

  public type Workout = {
    muscleGroup : Text;
    exercise : Text;
    sets : Nat8;
    reps : Nat8;
    weight : Float;
    duration : Nat16;
    date : Text;
  };

  module Workout {
    public func compare(w1 : Workout, w2 : Workout) : Order.Order {
      switch (Text.compare(w1.muscleGroup, w2.muscleGroup)) {
        case (#equal) {
          switch (Text.compare(w1.exercise, w2.exercise)) {
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  let conversionRates = Map.empty<Text, Float>();
  conversionRates.add("lbs_to_kg", 0.453592);

  public type DailyMetrics = {
    calories : Nat16;
    steps : Nat;
    date : Text;
  };

  public type Transaction = {
    description : Text;
    amount : Float;
    category : {
      #investment;
      #saving;
      #needs;
      #other;
    };
    date : Text;
  };

  module Transaction {
    public func compare(t1 : Transaction, t2 : Transaction) : Order.Order {
      Text.compare(t1.description, t2.description);
    };
  };

  public type MealLog = {
    mealName : Text;
    portionSize : Text;
    estimatedCalories : Nat16;
    date : Text;
  };

  let fitnessData = Map.empty<Principal, List.List<Workout>>();
  let dailyMetrics = Map.empty<Principal, List.List<DailyMetrics>>();
  let financeData = Map.empty<Principal, List.List<Transaction>>();
  let mealLogs = Map.empty<Principal, List.List<MealLog>>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Add to ActionHistory here (using transactions, dailyMetrics, mealLog, Workout)
  // Go through all entries and concatenate to one List

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view current profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getWorkouts() : async [Workout] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workouts");
    };
    switch (fitnessData.get(caller)) {
      case (null) { [] };
      case (?workouts) { workouts.toArray().sort() };
    };
  };

  public shared ({ caller }) func logWorkout(workout : Workout) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log workouts");
    };
    let workoutList = switch (fitnessData.get(caller)) {
      case (null) { List.empty<Workout>() };
      case (?list) { list };
    };
    workoutList.add(workout);
    fitnessData.add(caller, workoutList);
  };

  public shared ({ caller }) func logDailyMetrics(metrics : DailyMetrics) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log metrics");
    };
    let metricsList = switch (dailyMetrics.get(caller)) {
      case (null) { List.empty<DailyMetrics>() };
      case (?list) { list };
    };
    metricsList.add(metrics);
    dailyMetrics.add(caller, metricsList);
  };

  public query ({ caller }) func getDailyMetrics() : async [DailyMetrics] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view metrics");
    };
    switch (dailyMetrics.get(caller)) {
      case (null) { [] };
      case (?metrics) { metrics.toArray() };
    };
  };

  public shared ({ caller }) func logMeal(mealLog : MealLog) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log meals");
    };
    let mealList = switch (mealLogs.get(caller)) {
      case (null) { List.empty<MealLog>() };
      case (?list) { list };
    };
    mealList.add(mealLog);
    mealLogs.add(caller, mealList);
  };

  public query ({ caller }) func getMealLogs() : async [MealLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view meal logs");
    };
    switch (mealLogs.get(caller)) {
      case (null) { [] };
      case (?meals) { meals.toArray() };
    };
  };

  public shared ({ caller }) func logTransaction(transaction : Transaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log transactions");
    };
    let transactionList = switch (financeData.get(caller)) {
      case (null) { List.empty<Transaction>() };
      case (?list) { list };
    };
    transactionList.add(transaction);
    financeData.add(caller, transactionList);
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    switch (financeData.get(caller)) {
      case (null) { [] };
      case (?transactions) { transactions.toArray() };
    };
  };

  public shared ({ caller }) func updateFinanceProfile(income : ?Float, profession : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update finance profile");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          income;
          profession;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func updateFitnessProfile(bodyWeight : ?Float, height : ?Float, goalWeight : ?Float, workoutSplit : ?WorkoutSplit) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update fitness profile");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        let updatedProfile = {
          profile with
          bodyWeight;
          height;
          goalWeight;
          workoutSplit;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };
};
