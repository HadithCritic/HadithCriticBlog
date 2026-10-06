/**
 * First-pass question set for the Fiqh Compass research prototype.
 * These items operationalize the roadmap's provisional axes. They are not a
 * validated instrument and do not encode historical jurists' positions.
 */
export const axes = [
  {
    id: "A01",
    title: "Sources of binding law",
    low: "Qurʾānic authorization required",
    high: "Accepted extra-Qurʾānic authority can add requirements",
    note: "This dimension asks what kinds of sources can establish a binding religious requirement.",
  },
  {
    id: "A02",
    title: "Report sufficiency",
    low: "Restrict reports with limited transmission",
    high: "Accept reports that meet stated reliability conditions",
    note: "Authority in principle is distinct from whether a particular report is authentic or sufficient.",
  },
  {
    id: "A03",
    title: "Inherited practice",
    low: "Limited independent evidentiary weight",
    high: "Practice can carry substantial evidentiary weight",
    note: "The relevant community, transmission, and historical period would need to be specified in a real case.",
  },
  {
    id: "A04",
    title: "Consensus",
    low: "Restrict binding force of consensus claims",
    high: "Demonstrable consensus can bind",
    note: "Claims depend on who must agree and what evidence establishes agreement.",
  },
  {
    id: "A05",
    title: "Analogy (qiyās)",
    low: "Restrict rulings extended by inferred analogy",
    high: "Allow qualified analogical extension",
    note: "Interpreting a general text and extending a ruling by analogy are different operations.",
  },
  {
    id: "A06",
    title: "Independent rational judgment",
    low: "Reason alone does not establish a religious ruling",
    high: "Reason can have substantive evidentiary force",
    note: "Ordinary reasoning about facts is distinct from treating reason as a source of legal judgment.",
  },
  {
    id: "A07",
    title: "Public welfare (maṣlaḥa)",
    low: "Welfare needs close textual authorization",
    high: "Welfare can guide otherwise unaddressed cases",
    note: "Religious rulings and administrative regulations may raise different questions.",
  },
  {
    id: "A08",
    title: "Custom (ʿurf)",
    low: "Custom has a limited role in outcomes",
    high: "Valid custom can substantially shape outcomes",
    note: "Custom can clarify facts or terms without necessarily creating a new obligation.",
  },
  {
    id: "A09",
    title: "Context and application",
    low: "Presume continued application across contexts",
    high: "Vary application when relevant context changes",
    note: "A changed fact, a changed application, and a changed rule are not the same thing.",
  },
  {
    id: "A10",
    title: "Adherence to legal authority",
    low: "More latitude to reassess across authorities",
    high: "More commitment to a consistent school or authority",
    note: "A layperson's approach and a qualified jurist's approach should not be assumed to be identical.",
  },
  {
    id: "A11",
    title: "Uncertainty",
    low: "Presume freedom from an unestablished requirement",
    high: "Prefer precaution when responsibility is uncertain",
    note: "Worship, transactions, and punishment may call for different treatment of uncertainty.",
  },
  {
    id: "A12",
    title: "Abrogation (naskh)",
    low: "Restrict claims that one revealed ruling supersedes another",
    high: "Accept supersession under specified evidentiary conditions",
    note: "Within-Qurʾān, within-report, and cross-source claims require separate examination.",
  },
] as const;

export const questions = [
  { id: "Q01", axis: "A01", direction: -1, prompt: "An extra-Qurʾānic source should not by itself establish a new binding religious requirement unless the Qurʾān authorizes that kind of requirement." },
  { id: "Q02", axis: "A01", direction: 1, prompt: "A source accepted as authoritative may establish a binding religious requirement even when the Qurʾān does not state that requirement directly." },
  { id: "Q03", axis: "A02", direction: 1, prompt: "A report that meets a stated reliability standard can carry legal weight even when it is not transmitted through a mass of independent routes." },
  { id: "Q04", axis: "A02", direction: -1, prompt: "For a report to establish a binding rule, broad transmission should generally be required in addition to individual reliability." },
  { id: "Q05", axis: "A03", direction: 1, prompt: "A well-established practice of a relevant early community can count as evidence in its own right, even apart from a report stating the same rule." },
  { id: "Q06", axis: "A03", direction: -1, prompt: "A community's inherited practice should carry little independent legal weight unless its evidentiary basis can be established separately." },
  { id: "Q07", axis: "A04", direction: 1, prompt: "A carefully demonstrated agreement among the relevant qualified scholars can establish a binding legal conclusion." },
  { id: "Q08", axis: "A04", direction: -1, prompt: "A claim that scholars agreed should not bind unless the participants and the evidence for their agreement can be identified." },
  { id: "Q09", axis: "A05", direction: 1, prompt: "A ruling may be extended to a new case when a qualified jurist identifies a relevant shared cause between the cases." },
  { id: "Q10", axis: "A05", direction: -1, prompt: "Inferred analogy should be used cautiously, especially when it would extend a rule into a new domain." },
  { id: "Q11", axis: "A06", direction: 1, prompt: "Reasoned judgments about justice or harm can sometimes support a binding religious conclusion even without a specific text addressing the case." },
  { id: "Q12", axis: "A06", direction: -1, prompt: "Reason can help establish the facts of a case, but a binding religious judgment requires an accepted revelatory or transmitted basis." },
  { id: "Q13", axis: "A07", direction: 1, prompt: "A rule for a genuinely new case may be justified by clear public welfare when no specific source settles the matter." },
  { id: "Q14", axis: "A07", direction: -1, prompt: "Public benefit should guide a binding religious rule only when its connection to accepted textual principles is clear." },
  { id: "Q15", axis: "A08", direction: 1, prompt: "A valid local custom can help determine what counts as fulfilling an obligation when the rule leaves that detail open." },
  { id: "Q16", axis: "A08", direction: -1, prompt: "Custom may clarify the facts or ordinary meaning of a case, but should rarely change its legal outcome." },
  { id: "Q17", axis: "A09", direction: 1, prompt: "When a ruling depends on a factual condition and that condition changes, its application may also need to change." },
  { id: "Q18", axis: "A09", direction: -1, prompt: "A ruling should usually keep the same application across different circumstances unless a recognized legal basis permits an adjustment." },
  { id: "Q19", axis: "A10", direction: 1, prompt: "A person who relies on legal authorities should generally follow a consistent school or qualified authority rather than select isolated rulings case by case." },
  { id: "Q20", axis: "A10", direction: -1, prompt: "A person may reasonably reassess between qualified authorities on particular questions instead of remaining within one school for every issue." },
  { id: "Q21", axis: "A11", direction: -1, prompt: "If a proposed religious requirement has not been established, the starting assumption should be that a person is free of that requirement." },
  { id: "Q22", axis: "A11", direction: 1, prompt: "When responsibility remains uncertain, taking a cautious course is often preferable to relying on the absence of proof." },
  { id: "Q23", axis: "A12", direction: 1, prompt: "One revealed ruling may supersede another when the chronology and evidence for that change are sufficiently established." },
  { id: "Q24", axis: "A12", direction: -1, prompt: "An apparent conflict between revealed rulings should not be called abrogation unless the evidence for supersession is especially clear." },
] as const;

export const answerOptions = [
  { value: "-2", label: "Strongly disagree" },
  { value: "-1", label: "Disagree" },
  { value: "0", label: "Neither agree nor disagree" },
  { value: "1", label: "Agree" },
  { value: "2", label: "Strongly agree" },
  { value: "unknown", label: "I am not sure" },
  { value: "na", label: "Not applicable to my view" },
] as const;

export const contentVersion = "prototype-1";
