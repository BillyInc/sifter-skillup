# D078 skills, methods and tools — deep-search checkpoint

**Date:** 2026-10-08  
**Domain:** D078 Social Sciences & Behavioural Research  
**Status:** Evidence-backed research supplement; not canonical and not student-approved.  
**Parent inventory:** [`D078_FULL_DOMAIN_ITEM_INVENTORY_REVIEW_2026_10_08.md`](D078_FULL_DOMAIN_ITEM_INVENTORY_REVIEW_2026_10_08.md) and [`d078_full_domain_item_inventory_2026_10_08.json`](../../data/career-mapping/_audit/d078_full_domain_item_inventory_2026_10_08.json)

## Why this checkpoint exists

The earlier inventory correctly avoided promoting named software to a universal
D078 foundation, but it did not resolve the deeper search requested for NVivo,
Casevo, Mesa, SPSS and the Python ecosystem. This supplement records that pass
without rewriting the earlier review or promoting anything to canonical data.

The key distinction remains:

- **Method competence** explains how to ask a question, collect or obtain
  evidence, analyse it, assess limits and communicate a defensible conclusion.
- **Software operation** helps carry out part of that work. It does not replace
  research design, ethics, interpretation, subject knowledge or evidence of
  competence.
- A tool is therefore shown only as a **conditional or specialist option** for
  a supported workflow. The inventory must not tell every D078 learner to learn
  every tool.

## Deep-search totals

| Measure | Count | Meaning |
|---|---:|---|
| New candidate items screened | 10 | Named tools, libraries or frameworks evaluated in this pass |
| Retained as conditional workflow options | 7 | Valid for a described research use case, but not universal D078 requirements |
| Retained as emerging or specialist options | 2 | Real projects with a narrower computational/social-simulation remit |
| Deferred from student display pending narrower route evidence | 1 | Predictive modelling library; useful, but too easy to overread as a general social-science requirement |
| Identity/status resolutions | 2 | “Casevo” and “Mesa” were checked as exact projects rather than assumed from their names |
| Rejected as false or nonexistent projects | 0 | No item was invented; unresolved names would remain deferred |
| Source records in this supplement | 14 | Official project/vendor documentation plus the Casevo research paper |
| URLs retained and checked | 14 | Each retained source has a direct URL, locator, scope and limitation below |

These totals are for this supplement only. They do not replace the parent
inventory’s 137-label and 30-domain-summary disposition counts.

## Decision table

| Item | What the evidence establishes | D078 placement decision | Learner-facing boundary |
|---|---|---|---|
| **NVivo** | Lumivero describes it as qualitative-analysis software for importing, organising, coding, querying and reporting on text, audio, video and other unstructured material. | **Conditional qualitative-research option.** Keep the method (for example, coding and theme development) separate from this commercial tool. | “Useful when you are analysing interviews, open-ended answers or documents. You can use another coding workflow instead; NVivo does not decide what your evidence means.” |
| **Casevo** | The exact project is *Casevo: Cognitive Agents and Social Evolution Simulator*, a Python framework for social multi-agent simulations built around complex networks; the paper describes LLM-supported social simulation. | **Emerging/specialist computational-social-science option.** Do not treat it as a general case-study or qualitative-analysis package. | “A specialist way to simulate interacting people or groups in a model. It is not a substitute for real participant research or evidence from real communities.” |
| **Mesa** | The official project describes Mesa as a Python agent-based-modelling framework with model components, agents, visualisation, data collection and analysis. | **Specialist agent-based-modelling option.** It belongs only where the learner is studying simulation/model-building. | “Use it to explore what could happen when simulated agents follow stated rules; a simulation is not proof that real people behave that way.” |
| **IBM SPSS Statistics** | IBM documents descriptive statistics, hypothesis testing, predictive analysis, data management and visualisation. | **Conditional quantitative-analysis option.** The underlying statistical reasoning is more important than this licensed product. | “Useful for organising survey data and running statistical analyses. The software does not choose a sound design or make a result true.” |
| **Python** | The Python project documents the language; it is a general programming foundation rather than a social-science method. | **Conditional computational workflow option.** Offer it where the learner chooses reproducible data, text, network or simulation work. | “A programming language for telling a computer how to clean, analyse, visualise or model data; learning Python alone does not teach research design.” |
| **pandas** | Official documentation covers tabular data, importing/exporting, selection, cleaning, reshaping, grouping, summaries and text handling. | **Conditional Python data-handling option.** Good for survey and administrative tables, not a replacement for statistical reasoning. | “Helps you arrange and check rows and columns, such as survey responses, before analysis.” |
| **statsmodels** | Official documentation covers regression, generalised linear models, mixed effects, time series, contingency tables and other statistical tools. | **Conditional advanced quantitative option.** Place after statistical concepts and data preparation. | “Helps fit and inspect statistical models; it cannot tell you whether the question, measures or assumptions are appropriate.” |
| **NetworkX** | Official documentation covers graph structures, network algorithms, centrality, communities and network dynamics. | **Conditional network-analysis option.** It belongs under a network/social-network route, not the shared foundation. | “Helps study connections—such as who is linked to whom—and calculate patterns in those connections.” |
| **Jupyter** | Project documentation describes shareable notebooks combining code, explanations, data and visualisations. | **Conditional reproducible-workflow support.** It is an environment, not a method or statistical package. | “Lets you keep code, notes, tables and charts together so another person can follow the analysis.” |
| **scikit-learn** | Official documentation covers machine-learning methods including supervised learning and text feature extraction. | **Deferred from the first student-facing D078 set.** Revisit only inside a clearly scoped predictive/text-analysis specialization with evaluation, bias and interpretation guidance. | Do not display as a general “social-science tool” in the domain foundation yet. |

## Findings and corrections

### Casevo is real, but its identity is narrower than the name suggests

The exact project is not a generic case-study tool. Its repository names it
“Cognitive Agents and Social Evolution Simulator” and describes a Python
framework for social multi-agent experiments using complex networks. The
associated paper describes LLM-supported multi-agent simulation. It is therefore
credible as an emerging computational-social-science candidate, but it is not
evidence that every D078 learner needs it, and it must not be presented as a
replacement for interviews, surveys, observation or other real-world evidence.

### Mesa is an agent-based modelling framework, not a general social-science package

The official documentation explicitly defines Mesa as an agent-based modelling
framework in Python. Its core learning path is model design: agents, state,
interaction rules, schedules/steps, visualisation, data collection and analysis.
This makes it a valid specialist option for simulation, social dynamics and
computational modelling. It does not establish a universal domain requirement.

### NVivo and SPSS are tools attached to methods, not methods by themselves

NVivo supports qualitative-data organisation and coding workflows; SPSS supports
many quantitative analysis and data-management operations. Neither product
decides the research question, sampling, measurement, ethics, interpretation or
limits. The student guide should introduce the method first and then offer the
tool as one possible implementation, with alternatives and licensing/access
limitations visible.

### Python needs an ecosystem map, not a single “learn Python” card

The deeper search supports a layered Python route:

1. **Python + Jupyter:** write and explain a reproducible analysis.
2. **pandas:** load, clean, reshape and summarise tables such as survey data.
3. **statsmodels:** fit interpretable statistical models after the learner knows
   the relevant concepts and assumptions.
4. **NetworkX:** analyse networks when the research question concerns ties or
   connections.
5. **Mesa:** build agent-based simulations when the question is about rules,
   interactions and possible emergent patterns.
6. **scikit-learn:** a later predictive/text-modelling option, not a default
   D078 foundation item.

These are alternatives or route-specific additions, not a cumulative checklist.
The domain display should say what each item helps the learner do, what it does
not establish, and which research route it supports.

## Source register

All sources below were checked on **2026-10-08**. They are kept global and are
not Nigerian labour-market evidence.

| ID | Publisher/source | Direct URL | Exact locator used | Limitation |
|---|---|---|---|---|
| S01 | Lumivero | https://lumivero.com/products/nvivo/ | “NVivo” product description; import, organise, explore, connect, coding, querying and mixed-methods statements | Vendor description; establishes capability, not universal need or learning outcomes |
| S02 | Lumivero | https://lumivero.com/resources/webinars-events/thematic-analysis-with-nvivo-15-lumivero-ai-assistant-2/ | “What you’ll learn”: six stages of reflexive thematic analysis; coding, retrieval and reporting | Webinar resource; method remains distinct from software |
| S03 | Casevo project repository | https://github.com/rgCASS/casevo | README sections “Introduction”, “Background Information”, “Tool Installation”, “Analyse the Results”; release notes | Open-source project documentation; emerging project, not a professional requirement |
| S04 | Jiang et al. | https://arxiv.org/abs/2412.19498 | Abstract and project description for *Casevo: A Cognitive Agents and Social Evolution Simulator* | Research paper/preprint record; does not establish broad adoption |
| S05 | Mesa project | https://mesa.readthedocs.io/stable/ | Overview and “Features”: Python ABM framework, agents/models, visualisation, data collection and analysis | Project documentation; specialist simulation scope |
| S06 | Mesa project | https://mesa.readthedocs.io/_/downloads/en/main/pdf/ | Overview and example description of the Schelling model | Documentation/example; an example is not evidence of a universal pathway |
| S07 | IBM | https://www.ibm.com/docs/en/spss-statistics/32.0.0?topic=spss-statistics-32-documentation | “Getting Started”: descriptive statistics, hypothesis testing, predictive analytics, data management and visualisation | Vendor documentation; licensed-product availability varies |
| S08 | Python Software Foundation | https://docs.python.org/3/tutorial/ | *The Python Tutorial* | Language tutorial; does not teach social research or statistics |
| S09 | pandas project | https://pandas.pydata.org/pandas-docs/stable/getting_started/intro_tutorials/index.html | “Getting started tutorials”: read/write tables, selection, plots, derived columns, summaries, reshaping and text | Library documentation; data handling is not research design |
| S10 | statsmodels project | https://www.statsmodels.org/stable/user-guide.html | User Guide headings: regression/linear models, time series, other models, statistics/tools and missing data | Library documentation; requires statistical understanding |
| S11 | scikit-learn project | https://scikit-learn.org/stable/user_guide | User Guide sections on supervised learning and text feature extraction | Library documentation; predictive performance does not equal causal explanation |
| S12 | NetworkX project | https://networkx.org/documentation/stable/reference/introduction.html | Introduction: graph objects, generators, algorithms and network reporting | Library documentation; requires a valid network research question |
| S13 | Project Jupyter | https://docs.jupyter.org/en/latest/what_is_jupyter.html | “What is Jupyter?” and notebook uses: code, explanatory text, data and visualisations | Environment documentation; not a research method or statistical model |
| S14 | Project Jupyter | https://jupyter.org/ | JupyterLab/Notebook descriptions for interactive computing, data and code | Project overview; no claim that every D078 learner needs notebooks |

## Reconciliation against the existing D078 inventory

- The earlier inventory’s caution was correct: named software should not be
  promoted to a shared domain foundation from role frequency or availability.
- The new search adds a clearer **computational-method route** rather than a
  larger universal tool list.
- NVivo and SPSS should be linked to qualitative/quantitative method cards,
  respectively; Python should be decomposed into use-case cards rather than
  one vague programming requirement.
- Casevo and Mesa are not duplicates of NVivo/SPSS. They concern simulation and
  computational modelling, not ordinary coding of interviews or routine survey
  statistics.
- The current evidence does not justify a D078-wide certification requirement
  for any of these tools. Certificates may be learning evidence for a chosen
  route, but they are not universal domain prerequisites.
- Nigeria-specific curriculum and institutional examples must remain in the
  separate Nigerian-context layer. This checkpoint does not convert global
  software evidence into Nigerian job or qualification claims.

## Next checkpoint

Before any student display, reconcile each item against the approved programme
overview, D078 pre-entry card and domain-overview contract. The next pass should
test the learner narration and relationship matrix with one concrete route
(for example, qualitative research or computational social research), including
an alternative path that does not require the named commercial tool. Until that
gate passes, all entries in this supplement remain research candidates.

