import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Nat8 "mo:core/Nat8";
import Float "mo:core/Float";
import Nat16 "mo:core/Nat16";

module {
  type OldWorkout = {
    muscleGroup : Text;
    exercise : Text;
    sets : Nat8;
    reps : Nat8;
    weight : Float;
    date : Text;
  };

  type OldActor = {
    fitnessData : Map.Map<Principal, List.List<OldWorkout>>;
  };

  type NewWorkout = {
    muscleGroup : Text;
    exercise : Text;
    sets : Nat8;
    reps : Nat8;
    weight : Float;
    duration : Nat16; // New duration field in minutes
    date : Text;
  };

  type NewActor = {
    fitnessData : Map.Map<Principal, List.List<NewWorkout>>;
  };

  public func run(old : OldActor) : NewActor {
    let newFitnessData = old.fitnessData.map<Principal, List.List<OldWorkout>, List.List<NewWorkout>>(
      func(_principal, oldWorkoutList) {
        oldWorkoutList.map<OldWorkout, NewWorkout>(
          func(oldWorkout) {
            {
              oldWorkout with
              duration = 0; // Default old workouts to 0 minutes
            };
          }
        );
      }
    );
    { fitnessData = newFitnessData };
  };
};
