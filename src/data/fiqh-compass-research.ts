/**
 * Proposed research prompts transcribed from the project roadmap.
 * They identify questions to investigate; they are not findings or scores.
 */
export const issueGroups = [
  {
    id: "sources-transmission",
    title: "Sources and transmission",
    description: "What can establish a binding requirement, and how should transmitted evidence be assessed?",
    issues: [
      { id: "I01", axes: ["A01"], question: "Can an accepted extra-Qurʾānic source establish a prohibition absent from the Qurʾān?" },
      { id: "I02", axes: ["A02"], question: "What legal weight can a report with limited transmission carry?" },
      { id: "I03", axes: ["A01", "A02"], question: "What happens when a report appears to conflict with an accepted general textual principle?" },
      { id: "I04", axes: ["A03"], question: "Can well-established communal practice outweigh a contrary report?" },
      { id: "I05", axes: ["A04"], question: "What population and evidence are needed to establish binding consensus?" },
      { id: "I06", axes: ["A04"], question: "Does the absence of a recorded objection establish consensus?" },
    ],
  },
  {
    id: "reasoning-welfare-custom",
    title: "Reasoning, welfare, and custom",
    description: "How are new cases reasoned through, and when can welfare or custom shape a result?",
    issues: [
      { id: "I07", axes: ["A05"], question: "Can a ruling extend to a new intoxicating substance through an inferred shared cause?" },
      { id: "I08", axes: ["A05"], question: "Can ritual requirements be extended through analogy?" },
      { id: "I09", axes: ["A06"], question: "Can reason establish a binding judgment about harm or injustice without a particular revealed ruling?" },
      { id: "I10", axes: ["A07"], question: "Can public welfare justify a new rule in an otherwise unregulated transaction?" },
      { id: "I11", axes: ["A08"], question: "Can custom determine an unstated term in a contract?" },
      { id: "I12", axes: ["A08", "A09"], question: "Can changed custom change what counts as adequate fulfillment of an obligation?" },
    ],
  },
  {
    id: "context-authority",
    title: "Context and legal authority",
    description: "How do changed circumstances and different roles affect the application of legal positions?",
    issues: [
      { id: "I13", axes: ["A09"], question: "Does a ruling’s application change when its stated operative condition disappears?" },
      { id: "I14", axes: ["A10"], question: "When may a layperson follow a ruling outside an adopted school?" },
      { id: "I15", axes: ["A10"], question: "When may a qualified jurist depart from an inherited position?" },
    ],
  },
  {
    id: "uncertainty-abrogation",
    title: "Uncertainty and supersession",
    description: "How should unresolved evidence, precaution, and claims of abrogation be treated?",
    issues: [
      { id: "I16", axes: ["A11"], question: "What is presumed about an ordinary activity when a prohibition is unestablished?" },
      { id: "I17", axes: ["A11"], question: "How should uncertainty about the performance of a ritual duty be handled?" },
      { id: "I18", axes: ["A11"], question: "What effect should evidentiary uncertainty have on imposing a punishment?" },
      { id: "I19", axes: ["A12"], question: "What establishes abrogation between apparently differing revealed rulings?" },
      { id: "I20", axes: ["A01", "A12"], question: "Can one accepted source type supersede a ruling in another?" },
    ],
  },
] as const;

/** The roadmap's suggested starting points, not completed or scored profiles. */
export const candidateProfiles = [
  {
    id: "al-shafii",
    name: "Al-Shāfiʿī",
    work: "al-Risāla and al-Umm",
    note: "A suggested starting candidate in the roadmap. No positions are encoded here; relevant passages, editions, and attribution still require review.",
    status: "Candidate · evidence review pending",
  },
  {
    id: "al-sarakhsi",
    name: "Al-Sarakhsī",
    work: "Uṣūl and al-Mabsūṭ",
    note: "A suggested starting candidate in the roadmap. No positions are encoded here; relevant passages, editions, and attribution still require review.",
    status: "Candidate · evidence review pending",
  },
  {
    id: "ibn-hazm",
    name: "Ibn Ḥazm",
    work: "al-Iḥkām and al-Muḥallā",
    note: "A suggested starting candidate in the roadmap. No positions are encoded here; relevant passages, editions, and attribution still require review.",
    status: "Candidate · evidence review pending",
  },
] as const;

export const plannedTraditions = ["Ibāḍī", "Zaydī", "Twelver", "specified Qurʾān-alone approaches"] as const;
