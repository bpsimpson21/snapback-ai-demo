export type TravelInputs = {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  budget: string;
  vibe: "value" | "balanced" | "premium";
  priorities: {
    lowFriction: boolean;
    bestSeats: boolean;
    contentMoments: boolean;
    recovery: boolean;
  };
};

export type OpsSection = {
  title: string;
  items: string[];
};

export type Itinerary = {
  headline: string;
  assumptions: string;
  travel: OpsSection;
  lodging: OpsSection;
  gameDay: OpsSection;
  contentPlan: OpsSection;
  checklist: OpsSection;
  risks: OpsSection;
};
