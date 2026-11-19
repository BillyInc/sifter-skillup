/** Return only a distinct learner deliverable from combined task/output copy.
 * When the source does not distinguish an output from the task, do not repeat
 * the task as if it were a second deliverable.
 */
export function studentOutputCopy(expectedOutput?: string | null, contextualUse?: string | null): string {
  let expected = String(expectedOutput ?? "").replace(/\s+/g, " ").trim();
  const contextual = String(contextualUse ?? "").replace(/\s+/g, " ").trim();
  const outputMarker = /\b(?:A defensible output is|Output(?:\s+(?:includes?|should|is|may|would))?)\s*:?\s*/i;
  const initialMarker = outputMarker.exec(expected);
  if (initialMarker?.index !== undefined) {
    const outputStart = initialMarker.index + initialMarker[0].length;
    const trailingNotes = expected.slice(outputStart).search(/\b(?:Task|Guardrail|Route note)\s*:/i);
    if (trailingNotes >= 0) expected = expected.slice(0, outputStart + trailingNotes);
  }
  const marker = outputMarker.exec(expected);
  if (marker && marker.index !== undefined) {
    return expected.slice(marker.index + marker[0].length).replace(/^[\s:;,.\-–—]+/, "").trim();
  }
  if (expected && expected.toLocaleLowerCase() !== contextual.toLocaleLowerCase()) {
    if (/\b(?:Task|Guardrail|Route note)\s*:/i.test(expected)) return "";
    return expected;
  }
  const contextualMarker = /\bOutput(?:,\s*if evidenced later)?\s*:\s*/i.exec(contextual);
  if (contextualMarker?.index !== undefined) {
    return contextual
      .slice(contextualMarker.index + contextualMarker[0].length)
      .split(/\b(?:Task|Guardrail|Route note)\s*:/i, 1)[0]
      .replace(/^[\s:;,.-]+/, "")
      .trim();
  }
  return "";
}

export function studentContextSections(value?: string | null) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  const markers = [...text.matchAll(/\b(Route note|Task|Output|Guardrail)\s*:/gi)];
  const meaning = markers.length ? text.slice(0, markers[0].index).trim() : text;
  const sections: Record<string, string> = {};
  markers.forEach((match, index) => {
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = markers[index + 1]?.index ?? text.length;
    const kind = match[1].toLowerCase();
    if (kind !== "route note") sections[kind] = text.slice(contentStart, contentEnd).trim();
  });
  return { meaning, task: sections.task, output: sections.output, guardrail: sections.guardrail };
}

const TECHNICAL_GLOSSES: Array<[RegExp, string]> = [
  // Exact, context-specific definitions come first so a broad match such as
  // "model", "outcome" or "data" cannot stand in for the actual method term.
  [/\bagent[- ]based models?\b/i, "agent-based model (a computer simulation in which represented people or groups follow stated rules and interact, letting researchers explore what group patterns those interactions could produce; the result is a modelled possibility, not a prediction of exactly how real people will act)"],
  [/\bbinary outcomes\b/i, "binary outcomes (results that each have only two possible categories, such as yes/no or used/not used)"],
  [/\bbinary outcome\b/i, "binary outcome (a result with only two possible categories, such as yes/no or used/not used)"],
  [/\bgeneralized linear models?\b/i, "generalized linear model (a statistical approach that relates measured information to an outcome such as a count or yes/no answer, where a straight-line model of the outcome would not fit)"],
  [/\bgeneralised linear models?\b/i, "generalised linear model (a statistical approach that relates measured information to an outcome such as a count or yes/no answer, where a straight-line model of the outcome would not fit)"],
  [/\bimpact evaluation\b/i, "impact evaluation (an assessment that compares a programme's results with a credible estimate of what might have happened without it, to judge whether the programme contributed to a change; the design and its assumptions limit how strong that conclusion can be)"],
  [/\bprocess evaluation\b/i, "process evaluation (an assessment of how a programme was carried out, whom it reached, what activities took place and what helped or obstructed delivery; it explains implementation, not by itself whether the programme caused an outcome)"],
  [/\blogic models?\b/i, "logic model (a map linking a programme's resources and activities to its immediate products and intended changes, while making the steps and assumptions visible)"],
  [/\bmodel diagnostics\b/i, "model diagnostics (checks of whether a model reproduces important features in the data and whether its assumptions fit the analysis; the right checks depend on the kind of model)"],
  [/\bmodel fit\b/i, "model fit (how closely a calculation's predicted pattern matches the pattern seen in data; a close match alone does not show that the calculation or its assumptions are correct)"],
  [/\bnull hypothesis\b/i, "null hypothesis (the starting assumption in a statistical test that the specified difference, relationship or effect is absent; the test asks whether the data would be unusual under that assumption)"],
  [/\bODD protocols?\b/i, "ODD protocol (a three-part description—Overview, Design concepts, and Details—of a computer-run study where represented people or groups follow rules; it shows what the study includes and how it works)"],
  [/\bodds ratios?\b/i, "odds ratio (a number comparing two groups' odds, where odds means how many people have an outcome for each person who does not; it describes how the outcome's odds differ between groups, not proof that one factor caused the other)"],
  [/\bsocial network analysis\b/i, "social network analysis (a way to represent people or organizations and the relationships between them, then examine patterns such as who is connected to whom; the result depends on which relationships were recorded)"],
  [/\btraining data\b/i, "training data (the examples a computer model uses to learn a pattern; if the examples do not reflect the people or cases it will meet later, its results may not transfer)"],
  [/\btest data\b/i, "test data (examples kept separate from model-building and tuning, then used at the end to check how well the model works on cases it has not already learned from)"],
  [/\bvalidation data\b/i, "validation data (examples kept separate from model training and used to compare or tune model choices before a final test)"],
  [/\bdigital traces?\b/i, "digital trace (a record created when someone uses a digital service, such as a post, search or transaction; it shows only what that service records, not the person's full life or views)"],
  [/\bexperimental\b/i, "experimental (in a study, deliberately changing or assigning a condition and measuring what follows; when describing a tool or approach, still being tried and not yet established)"],
  [/\bscoping reviews?\b/i, "scoping review (a planned review that maps the kinds of studies, ideas and evidence available on a broad topic and identifies gaps; it does not necessarily judge which intervention works best)"],
  [/\bstatistical tests?\b/i, "statistical test (a calculation that checks whether study results would be unusual under a stated assumption, such as there being no difference between groups)"],
  [/\bprobability distributions?\b/i, "probability distribution (a description of the values a quantity could take and how likely each value or range is under stated conditions)"],
  [/\bstandard errors?\b/i, "standard error (an estimate of how much a study result, such as an average, would change if researchers repeated the same process with a different group of people or records; it captures one source of uncertainty, not every possible source of error)"],
  [/\bdegrees of freedom\b/i, "degrees of freedom (a count of how many values in a calculation can vary independently after its constraints are taken into account; the exact meaning depends on the test or model)"],
  [/\bvariance\b/i, "variance (a measure of how spread out values are around their average, calculated from their squared distances from that average; larger variance means greater spread)"],
  [/\bconfidence level\b/i, "confidence level (the long-run percentage of intervals produced by a stated method that would contain the value being estimated if the same study process were repeated)"],
  [/\bnon[- ]?response bias\b/i, "nonresponse bias (a survey error that can arise when people who do not respond differ in relevant ways from those who do, so the answers may not represent the group the survey aimed to describe)"],
  [/\bsurvey weights?\b/i, "survey weight (a number that gives a response more or less influence when calculating a survey result, to reflect who was selected or to match known totals; this cannot correct differences the survey did not measure)"],
  [/\bmeasurement error\b/i, "measurement error (the difference between the value recorded and the quality or event the researcher intended to measure)"],
  [/\bPearson(?:'s)? correlation coefficient\b/i, "Pearson correlation coefficient (a number from -1 to +1 describing the direction and strength of a straight-line relationship between two numerical measures; it does not by itself show cause and effect)"],
  [/\bSpearman(?:'s)? rank correlation\b/i, "Spearman rank correlation (a measure that orders values first and checks whether higher ranks on one measure tend to go with higher or lower ranks on another; it can describe a steady rise or fall that is not a straight line)"],
  [/\btest statistic\b/i, "test statistic (a number calculated from study data and used to judge how unusual the result would be under a stated assumption)"],
  [/\bhypothesis testing\b/i, "hypothesis testing (a procedure for comparing study results with a stated starting assumption, such as no group difference; the result does not prove that the alternative explanation is true)"],
  [/\bempirical evidence\b/i, "empirical evidence (information gathered by observing or measuring events, or by examining records; it must still be checked for gaps, errors and fit with the question)"],
  [/\bprior probability\b/i, "prior probability (a starting number that represents how likely a possibility is before new information is considered)"],
  [/\bposterior probability\b/i, "posterior probability (an updated number that represents how likely a possibility is after new information is considered)"],
  [/\bBayesian\b/i, "Bayesian (an approach that combines an initial estimate of what may be true with observed data to produce an updated estimate; the starting assumptions and evidence both matter)"],
  [/\bstructured interviews?\b/i, "structured interview (a planned conversation in which each participant is asked the same questions in the same order, making answers easier to compare but leaving less room for follow-up)"],
  [/\bprecision\b/i, "precision (among the cases a model labels as positive, the share that truly are positive; it answers how often a positive label is right)"],
  [/\brecall\b/i, "recall (among all cases that truly are positive, the share a model successfully finds; it answers how many positive cases were missed)"],
  [/\bmeasurement invariance\b/i, "measurement invariance (evidence that a test or questionnaire measures an idea in a sufficiently similar way across groups or times before their scores are compared)"],
  [/\blatent means?\b/i, "latent mean (the estimated group average for an idea that cannot be observed directly, such as trust, inferred from answers to several questions)"],
  [/\bfactor loadings?\b/i, "factor loading (a number showing how strongly a question's answers relate to a proposed underlying idea, such as trust)"],
  [/\bitem fit\b/i, "item fit (a check of whether answers to a particular question follow the pattern expected from the scoring method being used)"],
  [/\bclassical test theory\b/i, "classical test theory (a measurement framework that treats a test score as a person's underlying score plus measurement error; observed scores are therefore not perfectly exact)"],
  [/\bexperimental research\b/i, "experimental research (a study in which researchers assign or change a condition and measure what follows; how people are assigned and protected determines which conclusions the study can support)"],
  [/\bnon[- ]experimental research\b/i, "non-experimental research (a study that observes existing conditions or records without assigning people to a changed condition; it can show patterns, but other differences may help explain them)"],
  [/\bdescriptive research\b/i, "descriptive research (a study that records and summarizes what is happening, such as how common an experience is, without necessarily testing why it happens)"],
  [/\bhistorical research\b/i, "historical research (a study that uses records, objects and accounts from the past to examine earlier events or change; researchers check who created each source, when and why, and whether it is authentic and accurate)"],
  [/\bcognitive pretesting\b/i, "cognitive pretesting (trying questions with a small number of people and asking how they understood and answered them, to find wording that causes confusion before wider use)"],
  [/\bPearson(?:'s)? correlation\b/i, "Pearson correlation (a number describing how closely two numerical measures follow a straight-line pattern; it ranges from -1 to +1, and a relationship alone does not show that one measure caused the other)"],
  [/\bSpearman(?:'s)? correlation\b/i, "Spearman correlation (a measure that first puts values in order and checks whether higher ranks on one measure tend to go with higher or lower ranks on another; it can describe a steady rise or fall that is not a straight line)"],
  [/\banalysis of variance\b/i, "analysis of variance (a test that compares averages across groups by comparing how far the group averages are apart with the spread of values within the groups; it can show that at least one average differs, but not which one)"],
  [/\bregression discontinuity\b/i, "regression discontinuity (a study design that compares cases just above and below a rule-based cutoff, such as a score that determines eligibility; it can show a local effect if nearby cases are comparable and the rule was not manipulated)"],
  [/\blinear regression\b/i, "linear regression (a method that estimates how an outcome changes on average with one or more measured factors by fitting a straight-line relationship; it describes association unless the study design supports a cause-and-effect claim)"],
  [/\bANOVA\b/, "ANOVA (analysis of variance: a way to compare groups' average measurements by comparing how far their averages are apart with how much individual results vary within each group; it can show that at least one average differs, but not which groups differ)"],
  [/\bexact tests\b/i, "exact tests (statistical tests that calculate probabilities from the possible results under a stated assumption, rather than relying on a formula that works well only with large samples; different exact tests have different assumptions)"],
  [/\bexact test\b/i, "exact test (a statistical test that calculates probability from the possible results under a stated assumption, rather than relying on a formula that works well only with large samples; each exact test has its own assumptions)"],
  [/\bAUC\b/, "AUC (area under a curve comparing how well a model ranks cases with an outcome above cases without it across different decision cutoffs; it summarizes ranking, not whether predicted chances are accurate or fair across groups)"],
  [/\bchi-square tests\b/i, "chi-square tests (calculations that compare actual category counts with counts predicted under a stated starting assumption, such as no relationship between two categories; they assess whether the counts differ from that expectation, but do not explain why)"],
  [/\bchi-square test\b/i, "chi-square test (a calculation that compares actual category counts with counts predicted under a stated starting assumption, such as no relationship between two categories; it assesses whether counts differ from that expectation, but does not explain why)"],
  [/\bchi-square\b/i, "chi-square (a calculation that summarizes how far actual category counts differ from the counts predicted by a stated starting assumption)"],
  [/\bquasi-experimental research\b/i, "quasi-experimental research (a study that compares groups or timing to assess whether a programme or policy may have contributed to a result, without assigning people by chance; pre-existing group differences may still explain some of the result)"],
  [/\bARIMA\b/, "ARIMA (autoregressive integrated moving average: a method for describing or predicting values recorded over time using earlier values and earlier prediction errors; its assumptions must fit the data)"],
  [/\bARMA\b/, "ARMA (autoregressive moving average: a method for describing values recorded over time using earlier values and earlier prediction errors; its assumptions must fit the data)"],
  [/\bcombined research designs\b/i, "combined research designs (plans that use two or more ways to gather or analyse information in one study and explain how their results will be connected)"],
  [/\bcombined research design\b/i, "combined research design (a plan that uses two or more ways to gather or analyse information in one study and explains how their results will be connected)"],
  [/\bbehavioural research\b/i, "behavioural research (research into how people think and act, and how other people and settings influence those actions)"],
  [/\bsocial sciences\b/i, "social sciences (fields that study people, groups, institutions and how societies work and change)"],
  [/\bsocial science\b/i, "social science (a field that studies people, groups, institutions and how societies work and change)"],
  [/\bresearch\b/i, "research (a planned process of asking a question, gathering information and checking what it can show)"],
  [/\bresearch question\b/i, "research question (the focused question a study is designed to answer; it guides what information is needed and how it should be examined)"],
  [/\bevidence\b/i, "evidence (information examined to help answer a question or support a conclusion)"],
  [/\bmethods\b/i, "methods (planned ways to gather or examine information to answer questions)"],
  [/\bmethod\b/i, "method (a planned way to gather or examine information to answer a question)"],
  [/\bdata\b(?!-(?:intensive|driven|based))\b/i, "data (recorded information about people, places, events or interactions—such as survey answers, counts, documents or location records—that researchers organize and examine; what gets recorded and what is missing limit the conclusions)"],
  [/\bstatistical\b/i, "statistical (using numbers and mathematical rules to summarize patterns, compare groups or show how uncertain a result may be)"],
  [/\bnetwork\b/i, "network (people or organizations represented along with the relationships that connect them)"],
  [/\btheory\b/i, "theory (an explanation of how or why a social pattern or process may occur, which evidence can support, refine or challenge)"],
  [/\bculture\b/i, "culture (shared ways of life, including beliefs, practices, language and expectations that people learn and shape together)"],
  [/\binequality\b/i, "inequality (unequal access to resources, opportunities, rights or influence among people or groups)"],
  [/\bsocial structure\b/i, "social structure (lasting relationships and arrangements that shape how people and groups live and interact)"],
  [/\bethics review\b/i, "ethics review (a review of a study plan to consider possible harm, participants' rights, privacy and safeguards; it can recommend protections but cannot promise that no harm will occur)"],
  [/\bresearch ethics committee\b/i, "research ethics committee (a group that reviews proposed studies involving people and checks whether participant protections are adequate)"],
  [/\bprivacy\b/i, "privacy (a person's ability to control access to information about them and how it is used or shared)"],
  [/\brepresentativeness\b/i, "representativeness (how well the people, places or records studied reflect the wider group the researcher wants to understand)"],
  [/\bsocial institutions\b/i, "social institutions (lasting arrangements and organizations that shape shared life, such as family life, education and government)"],
  [/\bsocial institution\b/i, "social institution (a lasting arrangement or organization that shapes shared life, such as family life, education or government)"],
  [/\binstitutions\b/i, "institutions (established organizations or arrangements that shape social life, such as families, schools, courts or governments)"],
  [/\binstitution\b/i, "institution (an established organization or arrangement that shapes social life, such as a family, school, court or government)"],
  [/\bcurriculum\b/i, "curriculum (the planned subjects, learning activities and outcomes in a programme of study)"],
  [/\bprogramme evaluation\b/i, "programme evaluation (a planned study of how a programme was delivered, whom it reached, what changed and why; the questions determine which parts to assess)"],
  [/\bprogram evaluation\b/i, "program evaluation (a planned study of how a program was delivered, whom it reached, what changed and why; the questions determine which parts to assess)"],
  [/\bevaluation\b/i, "evaluation (a planned assessment using evidence to judge how a programme, policy or action is designed or delivered, whom it reaches and what changes; only suitable comparison designs can assess whether it caused a change)"],
  [/\btheory of change\b/i, "theory of change (an explanation or map of how a programme's activities are expected to lead to intended changes, including the assumptions along the way; it describes how the programme is meant to work, not proof that it does)"],
  [/\bcausal inference\b/i, "causal inference (an assessment of whether an action helped bring about a result by comparing what happened with an estimate of what would have happened without the action; the comparison cannot be observed directly, so the design and its assumptions matter)"],
  [/\bcausal\b/i, "causal (about whether one event, action or condition helped bring about another result; two things changing together is not enough to show that one caused the other)"],
  [/\bquasi-experimental\b/i, "quasi-experimental (a study that compares groups or timing to judge whether a programme or policy may have led to a result when people were not assigned by chance; groups may already differ, so other factors could help explain the result)"],
  [/\bresearch design\b/i, "research design (the plan linking a research question to the information needed, how it will be gathered, how it will be analysed and what limits the conclusion)"],
  [/\bin-depth interviews?\b/i, "in-depth interview (a guided conversation using open questions to understand a person's experience, reasons or perspective)"],
  [/\bsystematic reviews\b/i, "systematic reviews (reviews that follow planned search and selection processes to find and assess studies about focused questions; they do not automatically combine results statistically)"],
  [/\bsystematic review\b/i, "systematic review (a review that follows a planned search and selection process to find and assess studies about a focused question; it does not automatically combine their results statistically)"],
  [/\bmeta-analyses\b/i, "meta-analyses (statistical methods for combining results from studies that are sufficiently similar; differences between studies and their quality still matter)"],
  [/\bmeta-analysis\b/i, "meta-analysis (a statistical method for combining results from studies that are sufficiently similar; differences between studies and their quality still matter)"],
  [/\bcase studies\b/i, "case studies (detailed investigations of clearly defined examples, such as people, groups, organizations, events or programmes, using evidence that fits the question; one case does not automatically represent a wider group)"],
  [/\bcase study\b/i, "case study (a detailed investigation of a clearly defined example, such as a person, group, organization, event or programme, using evidence that fits the question; one case does not automatically represent a wider group)"],
  [/\bpanel data\b/i, "panel data (information collected about the same people, organizations or places at more than one time, so change can be studied; missing follow-up records can affect conclusions)"],
  [/\blongitudinal\b/i, "longitudinal (following people or other units, or measuring the same topic repeatedly, over time so researchers can examine change)"],
  [/\bconfidence intervals\b/i, "confidence intervals (ranges around a study's calculated result that show uncertainty; with a 95% method, repeating the study under the same conditions would produce ranges containing the value of interest about 95% of the time, not a 95% chance for this one fixed range)"],
  [/\bconfidence interval\b/i, "confidence interval (a range around a study's calculated result that shows uncertainty; with a 95% method, repeating the study under the same conditions would produce ranges containing the value of interest about 95% of the time, not a 95% chance for this one fixed range)"],
  [/\beffect sizes\b/i, "effect sizes (measures of how large observed differences or relationships are; they answer a different question from whether a result passes a chosen cutoff)"],
  [/\beffect size\b/i, "effect size (a measure of how large an observed difference or relationship is; it answers a different question from whether a result passes a chosen cutoff)"],
  [/\bp-values\b/i, "p-values (numbers describing, if a test's starting assumption and conditions were correct, how often the same test would produce results at least as different from what that assumption predicts as the observed results; they are not the chance that the assumption is true or that the results happened by chance)"],
  [/\bp-value\b/i, "p-value (a number describing, if a test's starting assumption and conditions were correct, how often the same test would produce a result at least as different from what that assumption predicts as the observed result; it is not the chance that the assumption is true or that the result happened by chance)"],
  [/\bpsychometrics\b/i, "psychometrics (the study of how tests and questionnaires represent qualities such as attitudes or abilities, and whether their scores are consistent and supported for the intended use)"],
  [/\bstatistical models\b/i, "statistical models (mathematical descriptions that use recorded numbers to summarize patterns or compare relationships; each simplifies reality, so its conditions and fit to the data need checking)"],
  [/\bstatistical model\b/i, "statistical model (a mathematical description that uses recorded numbers to summarize patterns or compare relationships; it simplifies reality, so its conditions and fit to the data need checking)"],
  [/\bmodels\b/i, "models (simplified descriptions of how processes or systems may work, used to examine patterns or explore what could happen under stated conditions)"],
  [/\bmodel\b/i, "model (a simplified description of how a process or system may work, used to examine patterns or explore what could happen under stated conditions)"],
  [/\bvalidation\b/i, "validation (checking with suitable evidence whether a measure, model or procedure works for its intended people, setting and use; passing one check does not prove it will work in every setting)"],
  [/\bvariables\b/i, "variables (named features recorded in data that can take different values, such as people's ages, survey answers or incomes)"],
  [/\bvariable\b/i, "variable (a named feature recorded in data that can take different values, such as a person's age, survey answer or income)"],
  [/\btext analysis\b/i, "text analysis (a planned way to examine written or spoken language, by interpreting passages or using defined rules to identify patterns across many texts)"],
  [/\bstatistical methods\b/i, "statistical methods (ways to summarize or compare numerical information and describe how much results may vary)"],
  [/\bstatistical method\b/i, "statistical method (a way to summarize or compare numerical information and describe how much a result may vary)"],
  [/\bscale construction\b/i, "scale construction (developing questions or tasks to measure an idea such as trust or wellbeing, then checking that the items cover the idea and the scores work for the intended people and use)"],
  [/\bfactor analys(?:is|es)\b/i, "factor analysis (a way to examine which test or questionnaire answers vary together and whether groups of answers may represent broader ideas, such as trust; it does not prove that an idea exists or is measured well)"],
  [/\bfactor analyses\b/i, "factor analyses (statistical methods that examine which measured items vary together to identify a smaller set of underlying dimensions that may explain those patterns)"],
  [/\bmultilevel models\b/i, "multilevel models (methods for data where observations are grouped, such as pupils within schools; they account for shared group influences so pupils in one school are not treated as completely unrelated cases)"],
  [/\bmultilevel models?\b/i, "multilevel model (a method for data where observations are grouped, such as pupils within schools; it accounts for shared group influences so pupils in one school are not treated as completely unrelated cases)"],
  [/\bmultilevel\b/i, "multilevel (in research, data or a model with more than one level of grouping, such as records within a person and people within a school; members of the same group may be more alike than members of different groups)"],
  [/\btime[- ]series\b/i, "time series (values recorded in time order, such as monthly prices or yearly counts of residents, so changes and trends can be examined)"],
  [/\bspatial analysis\b/i, "spatial analysis (examining where things happen and how their locations, distances or surrounding places relate to a pattern; for example, comparing travel time to clinics across neighbourhoods)"],
  [/\bthematic analysis\b/i, "thematic analysis (a way to develop and explain patterns of meaning across interviews, observations or documents in relation to a research question; a theme is more than a topic or a word that appears often)"],
  [/\bcontent analysis\b/i, "content analysis (a planned method for examining communication, such as reports, interviews or posts, to describe patterns in what it says; researchers may interpret meaning or apply consistent categories or counts, depending on the question)"],
  [/\bevidence synthesis\b/i, "evidence synthesis (a planned way to find and bring together relevant findings from more than one study or record, while checking how the sources differ and how much confidence they support)"],
  [/\binter-coder reliability\b/i, "inter-coder reliability (a check of whether different researchers apply the same labels to the same passages or records consistently; agreement alone does not show that the labels capture meaningful ideas)"],
  [/\bqualitative coding\b/i, "qualitative coding (assigning short labels to selected parts of interviews, documents or observations so researchers can retrieve and compare them; labels support interpretation but are not findings by themselves)"],
  [/\bcoding\b/i, "coding (in qualitative analysis, assigning labels to parts of interviews or documents; in programming, writing instructions a computer can run. The surrounding task shows which meaning is intended)"],
  [/\breliability\b/i, "reliability (how consistently a measure or procedure gives similar results under comparable conditions; for example, a clear question should not produce very different answers just because it was asked in the same way again. Consistency alone does not show that it measures the intended idea)"],
  [/\bvalidity\b/i, "validity (how well evidence supports the meaning and use a researcher gives to a measure or conclusion; a measure can give consistent scores yet still miss the idea it is meant to capture)"],
  [/\bmeasurement\b/i, "measurement (turning an idea or feature into recorded observations, answers, counts or scores; for example, a study might use several questions to represent students' sense of belonging, then check whether those answers really capture that idea)"],
  [/\boperationali[sz]ation\b/i, "operationalisation (deciding exactly how an idea will be observed or measured, such as which questions, records or scoring rule will stand for trust or belonging)"],
  [/\brepresentative\b/i, "representative (similar to a defined wider group in the features relevant to the research question; this depends on who could be selected, who took part and how missing responses were handled)"],
  [/\bsampling\b/i, "sampling (choosing which people, places, records or events to study from a larger group; who can be selected and who takes part affects what the findings can say about the group, and not every sample represents that wider group)"],
  [/\bsample\b/i, "sample (the people, places, records or events included in a study; it is selected from a wider group and may or may not reflect that group well)"],
  [/\bsurveys\b/i, "surveys (ways to gather comparable information from people, often by asking set questions; wording, who responds and how people were selected affect the results)"],
  [/\bsurvey\b/i, "survey (a planned way to collect comparable answers from people, usually with a set of questions; wording, who is invited and who responds affect what the results can represent)"],
  [/\bquestionnaires\b/i, "questionnaires (written or digital sets of questions used to collect answers in a consistent format; wording and response options affect what can be learned)"],
  [/\bquestionnaire\b/i, "questionnaire (a written or digital set of questions used to collect answers in a consistent format; the wording and response options affect what can be learned)"],
  [/\bobservations\b/i, "observations (actions or events watched and recorded in a planned way; setting, consent and the observer's presence can affect what is seen)"],
  [/\bobservation\b/i, "observation (watching and recording actions or events in a planned way; setting, consent and the observer's presence can affect what is seen)"],
  [/\bsociali[sz]ation\b/i, "socialization (the process through which people learn and adapt to shared expectations, roles and ways of life through interaction with others)"],
  [/\bpublic policy\b/i, "public policy (decisions and actions by government about public issues and services)"],
  [/\bcomputational and digital social science\b/i, "computational and digital social science (social research that uses explicit computer-run steps to organize or examine records, measure patterns in language or relationships, or explore what stated rules produce)"],
  [/\bnatural language processing\b/i, "natural language processing (computer methods for analysing or producing human language, such as sorting messages by topic; results need checking against the task and text)"],
  [/\bmachine learning\b/i, "machine learning (computer methods that use examples to build a rule for sorting, estimating or recognizing patterns in new information; performance depends on the examples and must be checked on suitable cases, and a prediction does not explain why a pattern occurred)"],
  [/\blogistic regression\b/i, "logistic regression (a method for estimating the chance of a yes-or-no result from measured factors; it shows relationships, not proof that a factor caused the result)"],
  [/\bparticipant observation\b/i, "participant observation (a research method in which the researcher spends time in a setting, takes part where appropriate and records what people do; the researcher's role can affect what is observed)"],
  [/\bdiscourse analysis\b/i, "discourse analysis (the study of how language is used in context to create meaning, shape relationships or express power)"],
  [/\bstatistical significance\b/i, "statistical significance (a label used when a result's p-value is below a cutoff chosen for the test, assuming the model and test conditions hold; it does not show that a difference is large or important, prove a cause, or make the research idea certain)"],
  [/\bmixed[- ]methods\b/i, "mixed methods (a planned study that uses both numerical information and people's words or observations, then brings findings together to see how they agree, differ or explain one another)"],
  [/\bfocus groups\b/i, "focus groups (guided discussions where a researcher asks several participants shared questions and studies both their answers and how the discussion develops)"],
  [/\bfocus group\b/i, "focus group (a guided discussion where a researcher asks several participants shared questions and studies both their answers and how the discussion develops)"],
  [/\btriangulation\b/i, "triangulation (comparing findings from different sources, methods or researchers to see where they agree or differ; agreement alone does not prove a finding is true)"],
  [/\bregression\b/i, "regression (a family of statistical methods for estimating how an outcome is associated with one or more factors; by itself, it does not show that a factor caused the outcome)"],
  [/\bethnography\b/i, "ethnography (research into how people carry out and understand everyday practices in context, often using observation, conversations, interviews or records over time; the researcher also examines how their own presence shapes what they learn)"],
  [/\bcorrelation\b/i, "correlation (a measure of how two quantities vary together; it does not by itself show that one causes the other)"],
  [/\bhypothesis\b/i, "hypothesis (a specific expectation about a pattern or relationship that can be checked against evidence; not every study uses one)"],
  [/\balgorithms\b/i, "algorithms (defined sets of steps or rules a computer follows to turn inputs into outputs)"],
  [/\balgorithm\b/i, "algorithm (a defined set of steps or rules a computer follows to turn input into output)"],
  [/\bt-tests\b/i, "t-tests (sets of rules for comparing an average with a reference value or comparing averages between two groups; the appropriate version depends on the data and study plan)"],
  [/\bt-test\b/i, "t-test (a set of rules for comparing an average with a reference value or comparing averages between two groups; the appropriate version depends on the data and study plan)"],
  [/\bSPSS\b/, "SPSS (software for managing data and carrying out statistical analyses; the software does not choose a suitable method or make an interpretation valid by itself)"],
  [/\bbig data\b/i, "big data (data that are so large, varied or rapidly produced that ordinary tools may struggle to store, manage or analyse them; size alone does not make data useful evidence)"],
  [/\bquantitative\b/i, "quantitative (using numbers such as counts, measurements or scores to describe amounts and compare patterns; what those numbers can show depends on what was measured and who was included)"],
  [/\bqualitative\b/i, "qualitative (using words, observations or other non-number material to understand how people describe experiences, meanings or processes in context; it can explain how an issue is experienced, but does not by itself tell how many people share it)"],
  [/\bcomputational\b/i, "computational (using defined computer-run steps or models to organize or analyse data, measure patterns or simulate scenarios; simply using a computer is not enough)"],
  [/\badministrative records\b/i, "administrative records (information organizations create while registering people, providing services or keeping official accounts, usually for purposes other than research; the original purpose affects what the records measure)"],
  [/\badministrative record\b/i, "administrative record (information an organization creates while registering someone, providing a service or keeping official accounts, usually for purposes other than research; the original purpose affects what the record measures)"],
  [/\bnetwork analysis\b/i, "network analysis (a way to represent people or organizations as points and their relationships as links, then measure patterns in those connections)"],
  [/\bagent-based modelling\b/i, "agent-based modelling (a computer-run approach that represents separate people, groups or organizations following stated rules, then explores what broader patterns their interactions could produce)"],
  [/\bagent-based modeling\b/i, "agent-based modeling (a computer simulation in which represented people, groups or organizations follow stated rules and interact, so researchers can examine what larger patterns those interactions could produce; the result depends on the model assumptions)"],
  [/\bsimulations\b/i, "simulations (computer-run explorations of a process using stated rules or conditions, to see what outcomes those rules could produce)"],
  [/\bsimulation\b/i, "simulation (a computer-run exploration of a process using stated rules or conditions to see what outcomes those rules could produce; it shows possibilities under the model, not what will happen in real life)"],
  [/\bbias\b/i, "bias (a systematic influence that can tilt who or what is included, what gets measured, or how results are interpreted; it can arise without anyone intending to mislead)"],
  [/\bcritical discourse analysis\b/i, "critical discourse analysis (a way to study how spoken or written language, such as a policy describing different groups, reflects or challenges power and inequality in its social setting)"],
  [/\bconversation analysis\b/i, "conversation analysis (a close study of recorded, naturally occurring interaction that examines how each turn follows another and what actions people carry out through talk)"],
  [/\binterpretative phenomenological analysis\b/i, "interpretative phenomenological analysis (a research approach based on people's accounts that examines how particular people make sense of important experiences, with the researcher interpreting their accounts)"],
  [/\bphenomenological\b/i, "phenomenological (focused on how people experience and make sense of something)"],
  [/\bcounterfactual\b/i, "counterfactual (a comparison idea about what would have happened to the same people or places without an intervention; both situations cannot be observed at once, so researchers use other evidence to compare them)"],
  [/\bconfounding\b/i, "confounding (when a third factor is linked to both a possible cause and an outcome and distorts the relationship seen between them; for example, age may partly explain an observed difference if it is related to both service access and the outcome)"],
  [/\btarget population\b/i, "target population (the full group of people or other units a study aims to understand; the researcher should state who or what is included, and where and when)"],
  [/\bpopulations?\b/i, "population (the people living in a defined place or belonging to a defined group; in a study, it can also mean the wider set of people, places, events or records the question aims to describe)"],
  [/\bprevalence\b/i, "prevalence (the share or number of a defined group with a condition or experience during a stated period)"],
  [/\binference\b/i, "inference (a conclusion drawn from the information collected; it should not extend beyond the people, places or conditions that information can support)"],
  [/\bconstructs?\b/i, "construct (an idea researchers want to study, such as trust or belonging, that is not directly visible and must be represented through evidence or measures)"],
  [/\bintervention\b/i, "intervention (a planned action, service, rule or programme intended to change a situation or outcome)"],
  [/\bbaseline\b/i, "baseline (a starting value or record used to describe conditions before a change or compare later results)"],
  [/\bindicators?\b/i, "indicator (a measurable sign used to track a condition, activity or result; it represents only part of the thing being studied)"],
  [/\boutcomes?\b/i, "outcome (a change or result that a programme, policy or process aims to influence; evidence is needed to determine whether it occurred)"],
  [/\bimplementation\b/i, "implementation (how a programme, policy or service is put into practice, including who delivers it and under what conditions)"],
  [/\bstakeholders?\b/i, "stakeholder (a person, group or organization that affects, delivers or is affected by a decision or programme)"],
  [/\bdata provenance\b/i, "data provenance (a record of where information came from, how it was collected and what changes were made to it)"],
  [/\bdata dictionary\b/i, "data dictionary (a guide that lists each field in a dataset and explains what it means, how it is recorded and any allowed values)"],
  [/\bnowcasts?\b/i, "nowcast (a changing estimate of current conditions made before complete official information for that period is available; it can be uncertain and differ from the final reported value)"],
  [/\bforecasts?\b/i, "forecast (a calculated prediction about a future value based on information and conditions stated now; it can be wrong)"],
  [/\bscenario(s)?\b/i, "scenario (a possible set of future or changed conditions used to explore what might follow; it is not a prediction that those conditions will occur)"],
  [/\bnonresponse\b/i, "nonresponse (when selected people do not take part or do not answer particular questions, which can affect what a survey result represents)"],
  [/\bnonresponse bias\b/i, "nonresponse bias (a problem that can arise when people who do not respond differ in relevant ways from those who do)"],
  [/\bmeasurement properties\b/i, "measurement properties (evidence about how well a measure works, including whether it is consistent and whether it captures the idea it is meant to measure)"],
  [/\bmeasurement equivalence\b/i, "measurement equivalence (evidence that a measure has a sufficiently similar meaning across groups to make the planned comparison fair)"],
  [/\bmodel assumptions\b/i, "model assumptions (conditions a model treats as true in order to calculate a result; if they do not fit the situation, the result may mislead)"],
  [/\bdata[- ]intensive\b/i, "data-intensive (using large, varied or frequently updated collections of information that need careful organization and checking)"],
  [/\btext[- ]as[- ]data\b/i, "text-as-data (treating written or spoken language as material that can be sorted or measured using defined categories or computer procedures, then checked in context)"],
  [/\bdigital platform\b/i, "digital platform (an online service through which people communicate, publish material or carry out activities; its users and records may not represent everyone)"],
  [/\bde-?identified\b/i, "de-identified (processed to remove or replace direct personal details; people can sometimes still be recognized by combining other information)"],
  [/\binformed consent\b/i, "informed consent (a person's voluntary decision to take part after receiving clear information about what the study involves, possible risks and how their information will be used)"],
  [/\bfieldwork\b/i, "fieldwork (gathering evidence in the setting where people live, work or interact, while recording context and protecting participants)"],
  [/\barchival research\b/i, "archival research (studying records preserved from earlier activity, such as letters, government files, photographs or organizational documents)"],
  [/\bdocumentary research\b/i, "documentary research (using existing documents as evidence and checking who created them, why, when and what they leave out)"],
  [/\bcase[- ]control\b/i, "case-control study (a study that compares people with an outcome to people without it and looks back for earlier differences; who is selected and how well people remember can affect results)"],
  [/\bexperiment(?:al)?\b/i, "experiment (a study in which researchers deliberately vary an intervention or condition and measure what happens; design and ethics determine which conclusions it can support)"],
  [/\brandomi[sz]ed\b/i, "randomized (assigned by chance, which can help make comparison groups similar on average; it does not remove every design problem, data-recording concern or ethical concern)"],
  [/\bordinary least squares\b/i, "ordinary least squares (a method that fits a line or plane to data by choosing predicted values with the smallest total squared differences from the observed values)"],
  [/\bOLS\b/, "OLS (ordinary least squares: a method that fits a line or plane to data by choosing predicted values with the smallest total squared differences from the observed values)"],
  [/\bCDF\b/, "CDF (cumulative distribution function: a curve or rule that gives how likely values at or below a chosen point are)"],
  [/\bGLM\b/, "GLM (generalized linear model: a family of mathematical methods for outcomes such as counts or yes-or-no results, using a form chosen to fit the kind of outcome)"],
  [/\bLASSO\b/, "LASSO (least absolute shrinkage and selection operator: a way to build a prediction formula that can reduce some input weights to zero and keep a shorter set of useful inputs; selected inputs can change across studies and do not show what caused an outcome)"],
  [/\bCFA\b/, "CFA (confirmatory factor analysis: a way to check whether answers to test or questionnaire items fit a proposed grouping meant to represent broader ideas, such as trust)"],
  [/\bEFA\b/, "EFA (exploratory factor analysis: a way to find groups of test or questionnaire items whose answers vary together and may reflect broader ideas, such as trust)"],
  [/\bIRT\b/, "IRT (item response theory: a family of methods that examines how a person's answers to test or questionnaire items relate to an ability or quality being measured)"],
  [/\bDIF\b/, "DIF (differential item functioning: a check for whether people from different groups, but with similar levels of the quality being measured, answer a test or questionnaire item differently)"],
  [/\bGDP\b/, "GDP (gross domestic product, the value of goods and services produced in an economy during a stated period; it does not measure every part of people's well-being)"],
  [/\bCPI\b/, "CPI (Consumer Price Index, a measure of how the prices of a defined basket of goods and services change over time)"],
  [/\bGFSM\b/, "GFSM (Government Finance Statistics Manual, an International Monetary Fund framework for organizing statistics on government revenue, spending, financing, assets and liabilities)"],
  [/\bRIA\b/, "RIA (regulatory impact assessment, a structured comparison of a proposed rule with alternatives and their likely effects)"],
  [/\bROI\b/, "ROI (return on investment, a comparison of a project's financial return with its cost; it does not capture every social or public value)"],
  [/\bCRM\b/, "CRM (customer relationship management, systems and processes for recording and managing interactions with customers or service users)"],
  [/\bCSV\b/, "CSV (comma-separated values, a plain-text file format for storing rows and columns of data)"],
  [/\bSQL\b/, "SQL (Structured Query Language, a language used to retrieve and manage information in relational databases)"],
  [/\bAPI\b/, "API (application programming interface, a defined way for one software system to request information or actions from another)"],
  [/\bOCR\b/, "OCR (optical character recognition, software that converts text in images or scanned pages into machine-readable characters; errors need checking)"],
  [/\bGUI\b/, "GUI (graphical user interface, the buttons, menus and windows through which a person uses software)"],
  [/\bGIS\b/, "GIS (geographic information system: a computer-based system that links information to locations so people can store, compare, analyse and map what is happening in different places)"],
  [/\bCRS\b/, "CRS (coordinate reference system, the rules that locate mapped data on the Earth's surface; mismatched systems can put layers in the wrong place)"],
  [/\bSNA\b/, "SNA (social network analysis: the study of relationships among people, groups or organizations by mapping who or what is connected to whom or what)"],
  [/\bNLP\b/, "NLP (natural language processing: computer methods for analyzing or producing human language, such as sorting messages by topic; results need checking against the task and original text)"],
  [/\bML\b/, "ML (machine learning, computer methods that use examples to learn patterns and apply them to new cases; a prediction does not by itself explain why something happened)"],
  [/\bAI\b/, "AI (artificial intelligence: computer systems built to perform tasks such as recognizing patterns, sorting information, generating text or making recommendations; performing a task does not mean the system understands it like a person, so outputs need checking)"],
  [/\bLLM\b/, "LLM (large language model: a computer system trained on large amounts of text to generate or transform language; it can produce fluent but wrong or invented statements, so its output must be checked against reliable sources)"],
  [/\bABM\b/, "ABM (agent-based modelling: a computer-run study in which separately represented people or groups follow stated rules, allowing the researcher to explore what group patterns those interactions could produce)"],
  [/\bCAQDAS\b/, "CAQDAS (computer-assisted qualitative data analysis software: tools that help researchers label passages in text, compare accounts and retrieve related material; the researcher interprets what it means)"],
  [/\bCDA\b/, "CDA (critical discourse analysis: a way to examine how communication in specific settings reflects or challenges power, inequality and shared social assumptions)"],
  [/\bCA\b/, "CA (conversation analysis, a close study of recorded talk that examines turn-taking, responses and actions accomplished through conversation)"],
  [/\bIPA\b/, "IPA (interpretative phenomenological analysis: a way to study how particular people make sense of important experiences, with the researcher interpreting their accounts)"],
  [/\bAAPOR\b/, "AAPOR (American Association for Public Opinion Research, a professional organization that publishes standards and guidance for survey and public-opinion research)"],
  [/\bATRS\b/, "ATRS (Algorithmic Transparency Recording Standard, a United Kingdom format for publishing information about certain public-sector algorithmic tools; it is not a Nigerian legal requirement)"],
  [/\bNBS\b/, "NBS (Nigeria's National Bureau of Statistics, the national agency that produces and publishes official statistics)"],
  [/\bNPC\b/, "NPC (Nigeria's National Population Commission: the agency that conducts national censuses and surveys and publishes the results)"],
  [/\bNHREC\b/, "NHREC (Nigeria's National Health Research Ethics Committee, which oversees ethical review and monitoring for health research in Nigeria; its remit does not cover every social-science study)"],
  [/\bNCRM\b/, "NCRM (the National Centre for Research Methods, a United Kingdom research centre that develops and shares social-science methods training and resources)"],
  [/\bICLS\b/, "ICLS (the International Conference of Labour Statisticians, the International Labour Organization's forum for developing standards and guidance for labour statistics)"],
  [/\bCDC\b/, "CDC (the United States Centers for Disease Control and Prevention: a public-health agency that also publishes guidance on assessing whether programmes work)"],
  [/\bNIST\b/, "NIST (the United States National Institute of Standards and Technology: an agency that develops technical guidance and standards for science and technology)"],
  [/\bAI RMF\b/i, "AI RMF (the Artificial Intelligence Risk Management Framework, voluntary United States guidance for identifying, measuring and managing risks from artificial-intelligence systems; it is not Nigerian law)"],
  [/\bRMF\b/, "RMF (Risk Management Framework, a structured guide for identifying, assessing and responding to risks; the specific framework and whether it is binding depend on the issuing organization)"],
  [/\bJAMB\b/, "JAMB (the Joint Admissions and Matriculation Board, Nigeria's national body responsible for tertiary admissions examinations and related processes)"],
  [/\bUTME\b/, "UTME (the Unified Tertiary Matriculation Examination, the entrance examination administered by Nigeria's Joint Admissions and Matriculation Board)"],
  [/\bLISA\b/, "LISA (Local Indicators of Spatial Association, statistics that identify local clusters or outlying patterns in data linked to places; results depend on how places and neighbours are defined)"],
  [/\bPMI\b/, "PMI (the Project Management Institute, a professional organization that publishes project-management guidance and credentials)"],
  [/\bPPU\b/, "PPU (Power BI Premium Per User, a paid Microsoft licence that provides additional features and has specific sharing requirements)"],
  [/\bPower BI\b/i, "Power BI (Microsoft software for turning information into interactive reports and dashboards; it does not choose a suitable research method or validate an interpretation)"],
  [/(?<!Power )\bBI\b/i, "BI (business intelligence: organizing and presenting an organization's data to support decisions)"],
  [/\bSAS\/STAT\b/i, "SAS/STAT (the SAS software package for statistical analysis, including procedures for common research models and tests)"],
  [/\bPsyToolkit\b/i, "PsyToolkit (a platform for creating and running cognitive psychology experiments, including browser-based examples that researchers and students can explore or adapt)"],
  [/\bCASEVO\b/i, "CASEVO (Cognitive Agents and Social Evolution, an open-source Python framework for social simulations with multiple computer agents, including agents built around language models; its demonstrations do not prove that simulated people represent or predict real populations)"],
  [/\bCORE Econ\b/i, "CORE Econ (an open-access economics education project that publishes textbooks and learning materials)"],
  [/\bOpenLearn\b/i, "OpenLearn (The Open University's free learning platform; a course level describes the prior study experience expected, not a qualification earned)"],
  [/\bFamilySearch\b/i, "FamilySearch (an online family-history service with historical records and a shared family tree; a suggested match should be checked against original records)"],
  [/\bREADME\b/i, "README (a file of project instructions, setup steps or an overview that accompanies software)"],
  [/\bUnited Kingdom\b/i, "United Kingdom (the country made up of England, Scotland, Wales and Northern Ireland)"],
  [/\bUnited States\b/i, "United States (the country often abbreviated US or USA)"],
  [/\bEuropean Union\b/i, "European Union (a political and economic union of European member countries; its rules do not automatically apply in Nigeria)"],
  [/\bUnited Nations\b/i, "United Nations (an international organization whose member countries work together on issues including peace, development and international standards)"],
  [/\bUK\b/, "UK (United Kingdom: England, Scotland, Wales and Northern Ireland)"],
  [/\bUS\b/, "US (United States)"],
  [/\bEU\b/, "EU (European Union, a political and economic union of European member countries)"],
  [/\bUN\b/, "UN (United Nations, an international organization of member countries)"],
  [/\bIBM\b/, "IBM (the company that develops SPSS software)"],
  [/(?<!Power )\bIT\b/, "IT (information technology: computers, software and networks used to handle information)"],
  [/\bCBN\b/, "CBN (Central Bank of Nigeria, the country's central bank, which publishes monetary and financial information)"],
  [/\bNDPA\b/, "NDPA (Nigeria Data Protection Act, the Nigerian law that sets rules for processing personal data)"],
  [/\bNDPC\b/, "NDPC (Nigeria Data Protection Commission, the authority responsible for overseeing data-protection compliance under Nigerian law)"],
  [/\bWHO\b/, "WHO (World Health Organization, the United Nations agency focused on international public health)"],
  [/\bUNESCO\b/, "UNESCO (United Nations Educational, Scientific and Cultural Organization, a United Nations agency working in education, science and culture)"],
  [/\bUNSD\b/, "UNSD (United Nations Statistics Division, the United Nations unit that develops and shares international statistical standards and data)"],
  [/\bDESA\b/, "DESA (the United Nations Department of Economic and Social Affairs, which works on economic, social and demographic issues)"],
  [/\bILO\b/, "ILO (International Labour Organization, the United Nations agency focused on work and labour standards)"],
  [/\bIMF\b/, "IMF (International Monetary Fund, an international organization working on monetary cooperation and economic stability)"],
  [/\bOECD\b/, "OECD (Organisation for Economic Co-operation and Development, an international organization that publishes policy analysis and comparable data)"],
  [/\bWEF\b/, "WEF (World Economic Forum, an international organization that convenes business, government and civil-society leaders)"],
  [/\bUKDS\b/, "UKDS (UK Data Service, a United Kingdom service that provides access to social and economic research data and guidance)"],
  [/\bJBI\b/, "JBI (Joanna Briggs Institute, an evidence-synthesis and healthcare-research organization that publishes review methods and guidance)"],
  [/\bPRISMA\b/, "PRISMA (Preferred Reporting Items for Systematic Reviews and Meta-Analyses, a reporting guideline for describing how a review was planned and conducted)"],
  [/\bO\*NET\b/i, "O*NET (the United States Occupational Information Network, a database describing occupations, work activities and related skills)"],
  [/\bESCO\b/, "ESCO (European Skills, Competences, Qualifications and Occupations: a European reference system that groups job titles and connects them to skills and qualifications)"],
  [/\bQGIS\b/, "QGIS (free, open-source software for organizing and analyzing information linked to locations and making maps)"],
  [/\bArcGIS\b/, "ArcGIS (Esri software for storing, analysing and mapping information linked to places)"],
  [/\bGeoDa\b/, "GeoDa (software for exploring mapped data and patterns in how values are distributed across places)"],
  [/\bGeoPandas\b/, "GeoPandas (a Python library for organizing and analysing geographic data, such as boundaries and locations)"],
  [/\bPySAL\b/, "PySAL (Python Spatial Analysis Library, a Python library for studying how data patterns relate across places)"],
  [/\bOpenRefine\b/, "OpenRefine (software for inspecting, cleaning and transforming messy table data while recording changes)"],
  [/\bOpenDroneMap\b/, "OpenDroneMap (software for turning overlapping drone photographs into maps and three-dimensional models)"],
  [/\bNetLogo\b/, "NetLogo (a programming environment for building and exploring agent-based simulations)"],
  [/\bKoboToolbox\b/, "KoboToolbox (a platform for building forms and collecting survey or field information, including offline collection)"],
  [/\bKoboCollect\b/, "KoboCollect (an Android application for filling and submitting forms built with KoboToolbox, including in some offline settings)"],
  [/\bODK\b/, "ODK (Open Data Kit, a set of tools for collecting and managing information with mobile forms, including offline work)"],
  [/\bNLTK\b/, "NLTK (Natural Language Toolkit, a Python library with tools for processing and analysing text)"],
  [/\bJASP\b/, "JASP (statistical software with a graphical interface for running and reporting common analyses)"],
  [/\bfrequentist\b/i, "frequentist (an approach that compares a result with what repeated samples could produce if stated conditions held)"],
  [/\bcontingency tables?\b/i, "organized counts for combinations of categories, such as year group and yes-or-no service use"],
  [/\bstandard deviation\b/i, "standard deviation (a measure of how far values typically spread from their average)"],
  [/\bstandard error\b/i, "standard error (a measure of how much a calculated result would vary over repeated data collections under the method used)"],
  [/\bautocorrelation\b/i, "autocorrelation (how strongly measurements relate to earlier measurements in the same time-ordered series; it can affect time-series analysis)"],
  [/\bcalibration\b/i, "calibration (for a model, comparing the chances it predicts with how often outcomes occur; for a survey, adjusting how much each response counts so the responding group better matches known features of the wider group)"],
  [/\bcentrality\b/i, "centrality (a family of network measures describing a point's position or connections; each measure captures a different kind of position, not universal importance)"],
  [/\bclassification\b/i, "classification (sorting records into named categories using stated rules or a computer model; for example, labelling posts by topic. Researchers need to check whether the categories fit and which cases are wrongly labelled)"],
  [/\bclassifier\b/i, "classifier (a computer model or rule that assigns records to one of the named categories)"],
  [/\bcodebook\b/i, "codebook (a guide that explains labels and recorded values. When analysing text, it defines each label and when to apply it; for a data file, it explains what each column and recorded value means. This helps people interpret information consistently, but does not show that the original records are accurate)"],
  [/\bcoefficients?\b/i, "coefficient (a number in a mathematical model that shows how its result changes with an input or factor; its meaning depends on the model and scale, and it does not automatically show cause)"],
  [/\bcovariate\b/i, "covariate (an additional measured feature included in an analysis because it may help account for differences in the result)"],
  [/\bdifference-in-differences\b/i, "difference-in-differences (a comparison of how an outcome changes over time in one group versus a comparison group; it relies on the groups having followed similar trends without the intervention)"],
  [/\bdocument analys(?:is|es)\b/i, "document analysis (a systematic study of existing records, such as policies, reports or websites, examining what they say, who created them, when and why, and what they leave out)"],
  [/\bnetwork nodes?\b/i, "network node (a point representing a person, group or organization in a map of relationships)"],
  [/\bnode\s*[\/-]\s*edges?\b/i, "node/edge (in a network, a node is a point representing a person, group or other entity; an edge is a line showing a recorded connection between two nodes)"],
  [/\bnetwork edges?\b/i, "network edge (a line representing a defined relationship between two points in a network)"],
  [/\bedge lists?\b/i, "edge list (a list of pairs of people, groups or other entities that have a recorded connection, sometimes with details such as the connection type or strength)"],
  [/\bnode\b/i, "node (a point representing a person, group or organization in a map of relationships)"],
  [/\brank ties?\b/i, "rank tie (when two or more data points have the same value and share a position after sorting; the chosen test or calculation determines how those equal values are handled)"],
  [/\bnetwork ties?\b/i, "network tie (a recorded relationship between people, groups or organizations in a network; the study should define exactly what counts as a tie)"],
  [/\btie definitions?\b/i, "tie definition (the rule stating which relationship counts as a connection in the network being studied)"],
  [/\bfield notes\b/i, "field notes (dated notes about what a researcher saw or heard in a study setting, the surrounding context and their reflections; they are kept distinct from recordings and transcripts)"],
  [/\bgeocoding\b/i, "geocoding (matching an address or place name to a location on a map; errors in names or coordinates can place records incorrectly)"],
  [/\bgeographic information system\b/i, "geographic information system (GIS: a computer-based system that links information to locations so people can store, compare, analyse and map what is happening in different places)"],
  [/\bhomophily\b/i, "homophily (the tendency for people with similar characteristics to be connected; an observed pattern does not show what caused the connection)"],
  [/\bMoran's I\b/i, "Moran's I (a statistic that summarizes whether nearby places tend to have similar or different values under a stated map of which places count as neighbours)"],
  [/\bmultiple comparisons?\b/i, "multiple comparisons (testing several groups or pairs; the more tests made, the greater the chance of finding an apparently unusual result by accident, so results need an appropriate plan)"],
  [/\bnegative binomial\b/i, "negative binomial model (a statistical model for event counts that allows more variation than a basic Poisson count model; whether it fits depends on the study design and model checks)"],
  [/\bnon[- ]?parametric\b/i, "nonparametric (using methods that do not require some specific distributional forms; these methods still have assumptions and can answer different questions)"],
  [/\bparameter\b/i, "parameter (a value that describes part of a model or process; it may be set by the researcher or estimated from data)"],
  [/\bprecision\s*\/\s*recall\b/i, "precision/recall (precision is the share of positive labels that are correct; recall is the share of actual positive cases the model finds)"],
  [/\bprobability\b/i, "probability (a number expressing how likely an event or value is, from 0 for impossible to 1 for certain under stated information)"],
  [/\bprobit\b/i, "probit model (a method for estimating the chance of a yes-or-no outcome using a curve based on the normal distribution; interpret results through predicted chances, not raw coefficients alone)"],
  [/\bprocess tracing\b/i, "process tracing (a method that follows evidence and event sequences within one case to test how a proposed cause may have led to an outcome; it can be combined with comparisons or other methods, and conclusions stay tied to that case's evidence)"],
  [/\brank tests?\b/i, "rank test (a test that compares the order positions of values rather than using their raw sizes; each test has its own design requirements)"],
  [/\breflexivity\b/i, "reflexivity (ongoing examination of how a researcher's position, assumptions, relationships and choices shape evidence and its interpretation)"],
  [/\breflexive\b/i, "reflexive (deliberately examining how a researcher's position and involvement shape the study and its interpretation)"],
  [/\bresiduals?\b/i, "residual (the difference between an observed value and the value predicted by a model; patterns in these differences can reveal a poor fit)"],
  [/\bsemi-structured interview\b/i, "semi-structured interview (a guided conversation with planned topics or questions that also allows relevant follow-up questions)"],
  [/\bstructured interview\b/i, "structured interview (an interview that asks each participant the same planned questions in the same order)"],
  [/\bsentiment analysis\b/i, "sentiment analysis (computer methods that label the tone expressed in text, such as positive or negative; wording, language and context can make the label wrong)"],
  [/\bseparation\b/i, "separation (in a logistic model, a condition where one or more measured features perfectly sort the observed cases into outcome groups, so standard model estimates may not exist or may grow without limit)"],
  [/\bspatial autocorrelation\b/i, "spatial autocorrelation (how strongly values in nearby places are related under a stated rule for which places count as neighbours; it can show clustering or outliers, but does not explain why the pattern occurs)"],
  [/\btext mining\b/i, "text mining (using computer steps to search or summarize patterns across many documents; the results need checking against the original language and context)"],
  [/\btokenization\b/i, "tokenization (splitting text into units, such as words or word parts, so a computer can process it; the chosen units affect later results)"],
  [/\btranscripts?\b/i, "transcript (a written record of recorded speech or interaction, prepared using stated conventions; it may not capture every feature of the original)"],
  [/\btranscription\b/i, "transcription (turning recorded speech or interaction into a written record using stated conventions; choices about pauses, overlap and language affect what the record preserves)"],
  [/\bweighting\b/i, "weighting (giving some records more influence than others so an analysis reflects a stated design or known totals; weights do not automatically fix who was left out or how information was collected)"],
  [/\bSAS\b/, "SAS (commercial software for managing data and carrying out statistical analysis)"],
  [/\bRayyan\b/, "Rayyan (software for organizing records and helping reviewers screen studies for a literature review; reviewers must verify decisions)"],
  [/\bNVivo\b/, "NVivo (software for organizing people's words, observation notes, recordings and documents, labelling passages and retrieving them for researcher-led interpretation)"],
  [/\bTaguette\b/, "Taguette (open-source software for organizing documents, labelling passages and retrieving them for a researcher's interpretation)"],
  [/\bATLAS\.ti\b/i, "ATLAS.ti (software for organizing interviews, observations and documents and labelling passages for later interpretation)"],
  [/\bMAXQDA\b/, "MAXQDA (software for organizing text, audio, video and images and labelling passages for later interpretation)"],
  [/\bQualCoder\b/, "QualCoder (open-source software for organizing text, audio, video and image material and labelling passages for later interpretation)"],
  [/\bLimeSurvey\b/, "LimeSurvey (software for creating online questionnaires and collecting responses)"],
  [/\bPsychoPy\b/, "PsychoPy (software for creating and running psychology experiments and related tasks)"],
  [/\bOpenSesame\b/, "OpenSesame (software for building and running behavioural experiments)"],
  [/\bAfriSenti\b/, "AfriSenti (a research dataset of social-media text in several African languages, created to study how computer models label expressed tone; language coverage and labels depend on the dataset)"],
  [/\bODD\b/, "ODD (Overview, Design concepts, and Details: a format for describing a computer-run exploration of a process, including its parts, rules, data and checks)"],
  [/\bDNA\b/, "DNA (deoxyribonucleic acid, inherited biological material that can help identify biological relationships; results require consent, privacy safeguards and careful interpretation)"],
  [/\bURL\b/, "URL (web address used to locate a page or file online)"],
  [/\bURI\b/, "URI (uniform resource identifier, a text identifier for a resource; a URL is one kind of URI)"],
  [/\bID\b/, "ID (identifier, a code used to distinguish one record or item from another)"],
  [/\bTV\b/, "TV (television)"],
  [/\bYouTube Data API\b/i, "YouTube Data API (a Google service that lets software request defined information about videos, channels or playlists, subject to quotas and platform rules)"],
  [/\bsignificance\b/i, "significance (the meaning or importance of something; in statistics, statistical significance has a narrower technical meaning)"],
];

/** The first time a technical word appears, add a short plain-English meaning. */
export function explainTechnicalTerms(value: string, previouslyExplained?: Set<string>): string {
  const candidates = TECHNICAL_GLOSSES.flatMap(([pattern, gloss], order) => {
    const match = pattern.exec(value);
    if (!match || match.index === undefined) return [];
    const termKey = pattern.source.toLocaleLowerCase();
    const after = value.slice(match.index + match[0].length);
    // Never gloss inside text that is already a parenthetical definition:
    // running this twice over the same copy would otherwise nest a definition
    // inside a definition.
    const openBefore = (value.slice(0, match.index).match(/\(/g) ?? []).length;
    const closedBefore = (value.slice(0, match.index).match(/\)/g) ?? []).length;
    if (openBefore > closedBefore) return [];
    // A term inside a hyphenated compound ("causal-estimation") is one word for
    // the reader: inserting a definition would split it mid-word.
    if (/^-\p{L}/u.test(after)) return [];
    if (/^\s*\(/.test(after)
      || /^\s+\S+\s*,\s*which\b/i.test(after)
      || /^\s+(?:is|are|means|refers to)\s+(?:a|an|the)?\s*(?:record|set|collection|field|process|planned way|measure|form|system|software|information|range|method|study|computer-run|defined steps)\b/i.test(after)) {
      previouslyExplained?.add(termKey);
      return [];
    }
    if (previouslyExplained?.has(termKey)) return [];
    // Do not expand an acronym a second time when the same text already gives
    // its full name immediately before it, as in "United Nations (UN)".
    const before = value.slice(0, match.index);
    const definitionStart = gloss.indexOf(" (");
    const fullName = definitionStart >= 0 && gloss.endsWith(")")
      ? gloss.slice(definitionStart + 2, -1).split(/[;,]/, 1)[0].trim().replace(/^the\s+/i, "")
      : "";
    const acronymAlreadyExpanded = match[0] === match[0].toLocaleUpperCase()
      && match[0].length > 1
      && fullName.length > 2
      && new RegExp(`${fullName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\($`, "i").test(before)
      && /^\s*\)/.test(after);
    if (acronymAlreadyExpanded) {
      previouslyExplained?.add(termKey);
      return [];
    }
    const open = gloss.indexOf(" (");
    const explanation = open >= 0 && gloss.endsWith(")") ? gloss.slice(open + 2, -1) : gloss;
    return [{
      start: match.index,
      end: match.index + match[0].length,
      replacement: `${match[0]} (${explanation})`,
      order,
      termKey,
    }];
  }).sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start) || a.order - b.order);

  const chosen: typeof candidates = [];
  for (const candidate of candidates) {
    if (chosen.some((entry) => candidate.start < entry.end && candidate.end > entry.start)) continue;
    chosen.push(candidate);
    previouslyExplained?.add(candidate.termKey);
  }
  return chosen.sort((a, b) => b.start - a.start).reduce(
    (text, entry) => text.slice(0, entry.start) + entry.replacement + text.slice(entry.end),
    value,
  );
}

/** Remove known staff-only placement language before narration is displayed.
 * This is a presentation safeguard, not a replacement for reviewed source copy.
 */
export function studentFacingCopy(value?: string | null, previouslyExplained?: Set<string>): string {
  if (!value) return "";
  return explainTechnicalTerms(value
    .split(/\s*(?:Route note|Task|Guardrail|No programme mapping claimed|Not claimed as programme outcome|Programme mapping is not asserted|No programme-specific transfer is asserted)\s*:/i)[0]
    .replace(/(?:No programme mapping claimed|Not claimed as programme outcome|Programme mapping is not asserted|No programme-specific transfer is asserted)[^.!?]*(?:[.!?]|$)/gi, "")
    .replace(/\b(?:shared foundation candidate|area[- ]specific enrichment candidate|domain learning option|deferred emerging conditional extension)\b[^.!?]*(?:[.!?]|$)/gi, "")
    // These words may appear as an internal status prefix in legacy records.
    // Strip only that leading label, not learner-facing prose explaining why an
    // optional edge may help. Unicode escapes keep this reliable across editors.
    .replace(/^\s*(?:useful additional edge\s*(?:[:\u00B7|\u2014\u2013-]\s*)?)+/i, "")
    .replace(/\b(?:conditional foundation when a route handles research data|conditional responsibility for research or sensitive data)\b/gi, "")
    .replace(/\b(?:route note|task|guardrail)\s*:/gi, "")
    .replace(/\b(?:show within|show only within|show only in)\b[^.!?]*(?:[.!?]|$)/gi, "")
    .replace(/^[\s\u00B7|\u2014\u2013-]+|[\s\u00B7|\u2014\u2013-]+$/g, "")
    .replace(/[\uFFFD\u00C2\u00E2]+/g, "")
    .replace(/\s+/g, " ")
    .trim(), previouslyExplained);
}

/** Suppress an internal disposition explanation rather than showing it as
 * learner rationale. The caller can then use its ordinary, neutral fallback.
 */
export function studentReasonCopy(value?: string | null): string {
  const copy = studentFacingCopy(value);
  return /\b(candidate|enrichment|deferred|display scope|route note|student scope|placement|taxonomy)\b/i.test(copy)
    ? ""
    : copy;
}

/** Give each attached learning link a learner-facing reason without claiming
 * that the resource teaches more than its reviewed attachment supports. */
export function studentResourceRationale(
  rationale: string | null | undefined,
  itemName: string,
  contextualUse?: string | null,
  locator?: string | null,
): string {
  const cleanReason = studentFacingCopy(rationale);
  if (cleanReason && cleanReason.split(/\s+/).length >= 18) return cleanReason;

  const use = studentFacingCopy(studentContextSections(contextualUse).meaning);
  const cleanLocator = studentFacingCopy(locator);
  const attachedFor = cleanReason
    ? `This resource is attached to help you learn or review ${cleanReason.replace(/[.!?]+$/, "")}.`
    : `This resource is attached as a place to learn or read more about ${itemName}.`;
  const routeFit = use
    ? "It supports the work explained above, but it may cover only part of that work."
    : `Use it alongside the explanation for ${itemName}; it may cover only part of the work.`;
  const startAt = cleanLocator ? `A useful place to start is ${cleanLocator}.` : "";
  return [attachedFor, routeFit, startAt, "A learning link is not proof that you can already do the work or a substitute for practice."]
    .filter(Boolean)
    .join(" ");
}

/** Explain the scope of the evidence without implying that local rules or
 * working conditions are identical across places. */
export function studentGeographicContext(scope?: "nigeria" | "global" | "nigeria_to_global" | null): string {
  if (scope === "nigeria") {
    return "The evidence is grounded in Nigerian sources or application. Details may still differ across states, institutions and employers.";
  }
  if (scope === "global") {
    return "The evidence is international. Apply it in Nigeria only where local rules, data and working conditions fit.";
  }
  if (scope === "nigeria_to_global") {
    return "The evidence includes a Nigerian connection and places it in a wider field context. Practices and rules can still differ by place.";
  }
  return "The geographic scope of the evidence has not been specified.";
}

/** Keep the learner-facing limit section present without inventing a
 * task-specific restriction when the reviewed record has no limit text. */
export function studentItemLimitations(
  limitations?: readonly (string | null | undefined)[] | null,
): string[] {
  const reviewed = (limitations ?? []).map((value) => studentFacingCopy(value)).filter(Boolean);
  if (reviewed.length) return reviewed;
  return [
    "No item-specific limitation is recorded. Seeing this item in your learning path does not show that you have mastered it. Where the work requires a qualification, permission or supervision, this learning item does not replace it.",
  ];
}
