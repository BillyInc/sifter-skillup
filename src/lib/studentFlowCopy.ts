export interface FlowCueCopy {
  here: string;
  next: string;
}

export const START_CHOICE_CUE: FlowCueCopy = {
  here: "You are choosing the starting point that matches you today.",
  next: "Continue opens only the questions for that path. You can return here and start a different path.",
};

export function startingPointCue(choice: string | null | undefined): FlowCueCopy {
  switch (choice) {
    case "ss1_secondary":
      return {
        here: "SS1. You will add your school, your stream, and the O-level subjects you take.",
        next: "You can also type a programme you are considering. Continue opens a preview first. View universities then shows each university and its own O-level and UTME subjects.",
      };
    case "ss2_secondary":
      return {
        here: "SS2. You will check your stream and O-level subjects before SS3.",
        next: "You can also type a programme you are considering. Continue opens a preview first. View universities then shows each university and its own O-level and UTME subjects.",
      };
    case "ss3_secondary":
      return {
        here: "SS3. You will say how much you already know about the programme and the university.",
        next: "If you do not know the programme, start from your subjects. If you know the programme, you will see universities. If you know both, you open that university's page.",
      };
    case "jamb":
      return {
        here: "UTME. You are preparing from a tutorial centre or on your own.",
        next: "The same three choices follow: subjects only, programme only, or programme and university. A university page shows that university's O-level subjects, UTME subjects, and what the programme can lead to.",
      };
    case "student":
      return {
        here: "Undergraduate. You already study at a university.",
        next: "Choose your university and the programme name it uses. Continue opens what that programme teaches and the fields it can lead to.",
      };
    case "educator":
      return {
        here: "Educator. You are setting up a place that guides students.",
        next: "Continue asks for that institution. Student guidance then follows the same programme, field, and saved-plan path.",
      };
    default:
      return START_CHOICE_CUE;
  }
}

export function secondarySetupCue(classLabel: string): FlowCueCopy {
  return {
    here: `${classLabel}. Your stream decides which O-level subjects are shown first.`,
    next: "Choose at least five subjects, or type a programme such as nursing. Continue opens a preview. View universities shows each university's own requirements.",
  };
}

export function admissionDoorCue(door: string | null | undefined, isSs3: boolean): FlowCueCopy {
  const place = isSs3 ? "SS3" : "UTME";
  if (door === "unsure") {
    return {
      here: `${place}. You do not know the programme yet.`,
      next: "Choose your stream and subjects. Continue lists programmes those subjects can reach. Open one for a preview, then View universities.",
    };
  }
  if (door === "know_what") {
    return {
      here: `${place}. You know the programme and still need a university.`,
      next: "Type the programme. You will see the universities that offer it, each with its own O-level and UTME requirements. You can compare universities on that page.",
    };
  }
  if (door === "know_where") {
    return {
      here: `${place}. You know the programme and the university.`,
      next: "Type both. Continue opens that programme at that university, with its O-level subjects, its UTME subjects, and the fields it can lead to.",
    };
  }
  return {
    here: `${place}. Choose the question you want answered first.`,
    next: "Subjects find a programme. A programme name lists universities. A programme and a university open that page directly.",
  };
}

export const UNDERGRADUATE_SETUP_CUE: FlowCueCopy = {
  here: "You are naming the university and programme you already study.",
  next: "Choose your university, then the programme name it uses. Continue opens that programme. Read what it teaches, then open a field.",
};

export function programmePreviewCue(programmeName: string): FlowCueCopy {
  return {
    here: `Preview of ${programmeName}, before a university is selected.`,
    next: "Press View universities. Select one to see its O-level subjects, its UTME subjects, and what you can study after it.",
  };
}

export function universityListCue(): FlowCueCopy {
  return {
    here: "These are the universities recorded for this programme.",
    next: "Open one university. Its page shows that university's O-level requirements, its UTME subjects, and the fields the programme can lead to.",
  };
}

export function universitySelectedCue(universityName: string): FlowCueCopy {
  return {
    here: `Admission information for ${universityName}.`,
    next: "Read this university's O-level requirements and UTME subjects first. Then open a field below to continue into what you can study.",
  };
}

export const UNDERGRADUATE_PROGRAMME_CUE: FlowCueCopy = {
  here: "This is the programme you study.",
  next: "Read what it teaches, then open a field below. Use Add this to keep a choice. Save the plan, then print it from Saved.",
};

export function fieldHandoffCue(hasSocialSciences: boolean): FlowCueCopy {
  return {
    here: "These fields are the next step after the programme.",
    next: hasSocialSciences
      ? "Open Social Sciences to see how Sociology continues. Choose a way to investigate, use Add this, then save the plan and print it from Saved."
      : "Open a field to see how your studies continue. Use Add this to keep a choice, then save the plan and print it from Saved.",
  };
}

export function d078FieldCue(methodSelected: boolean): FlowCueCopy {
  return methodSelected
    ? {
        here: "Social Sciences. The page now shows only what your selected method or design supports.",
        next: "Open an area, then a role if you want one. Add this sends a choice to your learning plan. Save it, then open Saved to print.",
      }
    : {
        here: "Social Sciences, the next page after Sociology.",
        next: "Choose one or more ways to investigate. Areas and roles update to that choice. Add this keeps a choice in your learning plan.",
      };
}

export const D078_AREA_LIST_CUE: FlowCueCopy = {
  here: "These areas match the method or design you selected.",
  next: "Select an area to open it. Roles come after the area. Add this keeps a choice in your learning plan.",
};

export const D078_AREA_CUE: FlowCueCopy = {
  here: "You are in an area linked to the method or design you selected.",
  next: "Read what this area covers, then open a role. Add this keeps the learning you want. The tray on this page is your plan.",
};

export const D078_ROLE_CUE: FlowCueCopy = {
  here: "You are on a role inside the area you opened.",
  next: "Add the learning you want to keep. Open the learning plan, save it, then print the saved copy from Saved.",
};

export const TRAY_EMPTY_CUE: FlowCueCopy = {
  here: "Your learning plan is empty.",
  next: "Use Add this on a field, area, or role. Then open this plan and save it. Saved is where you print.",
};

export const TRAY_CUE: FlowCueCopy = {
  here: "This tray is your learning plan for the route you are building.",
  next: "Save keeps this version. Open Saved to print or download it. Print appears after Review is complete.",
};

export function guidanceStepCue(step: string): FlowCueCopy {
  if (step === "subgroups") {
    return {
      here: "Areas inside the field you chose.",
      next: "Open an area to see its roles. You can return to the field from the back button.",
    };
  }
  if (step === "roles") {
    return {
      here: "Roles in the area you opened.",
      next: "Keep the roles you want, then go to Review. Review is the last check before printing.",
    };
  }
  if (step === "review") {
    return {
      here: "Review. This is the last check before a saved report.",
      next: "Complete Review, then use Print / download. The same copy stays in Saved.",
    };
  }
  return {
    here: "Fields connected to your programme.",
    next: "Choose one field. For Sociology, Social Sciences is the field that continues the degree. Areas and roles come after the field.",
  };
}

export function savedReportCue(ready: boolean): FlowCueCopy {
  return ready
    ? {
        here: "Saved. This version can be printed.",
        next: "Print / save report opens this version. A university's requirements are included when that university is on the version.",
      }
    : {
        here: "Saved. Printing needs a named institution attached to your profile or report context.",
        next: "Attach the university, school, or tutorial centre you attend to your profile or report details, then return here to print.",
      };
}
