"""Build source-backed, role-scoped D078 tool options from reviewed tool records.

Each role option is optional (never a role qualification gate). Existing domain
and area tool identities are reused; the route record adds only the specific
task context, prerequisites/alternatives/limits and source-backed learning path.
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
GRAPH = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json"
OUTPUT = AUDIT / "D078_ROLE_TOOL_ROUTE_ENRICHMENT_2026_10_16.json"
SEED = ROOT / "backend/seed_d078_role_tools_2026-10-16.sql"
REPORT = ROOT / "docs/manual-review/D078_ROLE_TOOL_ENRICHMENT_2026_10_16.md"

# ID -> current graph node IDs. These are aliases for the same software, not
# separate products; the graph builder deduplicates them to a canonical tool.
EXISTING = {
    "kobo": "domain-item:d078-survey-data-collection-tool",
    "taguette": "domain-item:d078-qualitative-coding-tool",
    "gephi": "domain-item:d078-social-network-tool",
    "excel": "domain-item:d078-excel-data-tool",
    "spss": "domain-item:d078-spss-tool",
    "nvivo": "domain-item:d078-nvivo-tool",
    "pandas": "domain-item:d078-pandas-tool",
    "matplotlib": "domain-item:d078-matplotlib-tool",
    "networkx": "domain-item:d078-networkx-tool",
    "mesa": "domain-item:d078-mesa-tool",
    "casevo": "domain-item:d078-casevo-tool",
    "r": "domain-item:r-statistical-computing",
    "stata": "domain-item:stata-quantitative-social-science-workflow",
    "jamovi": "domain-item:d078-jamovi-tool",
    "geoda": "area_tool_option:d078-hg-tool-geoda",
    "geopandas": "area_tool_option:d078-hg-tool-geopandas",
    "pysal_esda": "area_tool_option:d078-hg-tool-pysal-esda",
    "arcgis": "area_tool_option:d078-hg-tool-arcgis-spatial-analyst",
    "limesurvey": "area_tool_option:d078-a04-tool-limesurvey",
    "psytoolkit": "area_tool_option:d078-a04-tool-psytoolkit",
    "psychopy": "area_tool_option:d078-a04-tool-psychopy",
    "opensesame": "area_tool_option:d078-a04-tool-opensesame",
    "python": "area_tool_option:d078-a04-tool-python",
}

# Additional specialist tools found in the current source search. Tool pages
# explain product scope; learning pages are task-specific. Limits are explicit.
EXTRA: dict[str, dict[str, Any]] = {
    "kobo": {"name":"KoboToolbox", "meaning":"A digital data-collection platform for building and deploying forms and managing survey or field responses.", "official":"https://www.kobotoolbox.org/", "learn":"https://academy.kobotoolbox.org/courses/essentials", "learn_title":"KoboToolbox Essentials: build forms and collect data", "prereq":["A tested question plan, sampling approach, permissions and privacy safeguards before real collection."], "alt":["LimeSurvey; REDCap where institutionally available; paper forms."], "limits":["The platform does not design a sound questionnaire, ensure representative sampling, obtain valid consent or make collected information accurate."]},
    "taguette": {"name":"Taguette", "meaning":"Free and open-source software for highlighting passages in qualitative documents, attaching codes and retrieving coded excerpts.", "official":"https://www.taguette.org/", "learn":"https://www.taguette.org/getting-started.html", "learn_title":"Taguette getting started: organise documents and code excerpts", "prereq":["A qualitative question, suitable text and a transparent coding plan."], "alt":["NVivo for larger or more complex projects; careful manual coding for small studies."], "limits":["Software stores and retrieves coding; it does not decide what a passage means or establish a valid interpretation."]},
    "gephi": {"name":"Gephi", "meaning":"Free network-analysis and visualisation software for exploring graph-structured relationships.", "official":"https://gephi.org/", "learn":"https://gephi.org/quickstart/", "learn_title":"Gephi Quick Start: import, visualise and inspect a network", "prereq":["A defined network (what counts as a node and tie) and a suitable edge list."], "alt":["NetworkX for scripted graph analysis; R igraph; manual diagrams for small examples."], "limits":["Layouts and network measures do not prove influence, representativeness or causation."]},
    "excel": {"name":"Microsoft Excel", "meaning":"Spreadsheet software for organising, checking, summarising and charting structured tables.", "official":"https://www.microsoft.com/en-us/microsoft-365/excel", "learn":"https://support.microsoft.com/en-us/excel/import-and-analyze-data", "learn_title":"Microsoft Support: import and analyse data in Excel", "prereq":["A tidy table with clear variable names and safe, permitted data; use fictional/public data for practice."], "alt":["Google Sheets; R or Python for repeatable larger analyses; SPSS or Stata for suitable statistical workflows."], "limits":["A spreadsheet does not establish data quality, sample representativeness or statistical validity; version and licence features vary."]},
    "nvivo": {"name":"NVivo", "meaning":"Licensed software for organising qualitative material, coding passages, retrieving excerpts and recording analytic notes.", "official":"https://lumivero.com/products/nvivo/", "learn":"https://lumivero.com/resources/blog/essential-qualitative-coding-techniques-nvivo/", "learn_title":"Lumivero: qualitative coding techniques in NVivo", "prereq":["A qualitative question and documented coding approach; learn the method before relying on software features."], "alt":["Taguette as a free/open-source option; manual coding for a small project."], "limits":["Commercial access may be paid or institution-dependent. Software does not choose a sound method or discover valid themes on its own; the cited vendor guide is not full methods training."]},
    "stata": {"name":"Stata", "meaning":"Statistical software for managing, analysing, visualising and reporting structured data in reproducible workflows.", "official":"https://www.stata.com/", "learn":"https://www.stata.com/links/video-tutorials/", "learn_title":"Stata official video tutorials: data, statistics and reporting", "prereq":["A quantitative question, basic statistics and knowledge of the assumptions behind the selected analysis."], "alt":["R; SPSS; Python; jamovi, depending on task, access and reproducibility needs."], "limits":["Proprietary licensing applies. Commands do not make a model appropriate or a causal claim valid."]},
    "jamovi": {"name":"jamovi", "meaning":"Free statistical software with a spreadsheet-style interface for managing data and running selected analyses.", "official":"https://www.jamovi.org/", "learn":"https://www.jamovi.org/user-manual.html", "learn_title":"jamovi user manual: data, analyses and results", "prereq":["A structured dataset and basic understanding of the method selected for the research question."], "alt":["R; SPSS; Stata; spreadsheet summaries for simple descriptive tasks."], "limits":["An easy interface does not validate research design, measurement, assumptions or interpretation."]},
    "power_bi": {"name":"Microsoft Power BI", "meaning":"A data-visualisation and reporting tool that connects, cleans, models and presents data in interactive reports.", "official":"https://learn.microsoft.com/en-us/power-bi/", "learn":"https://learn.microsoft.com/en-us/training/powerplatform/power-bi", "learn_title":"Microsoft Learn: Power BI data preparation, modelling and reports", "prereq":["A checked, structured dataset and a clear reporting question."], "alt":["Tableau; Excel charts; R or Python visualisation."], "limits":["A dashboard does not establish data quality, representativeness or causation. Sharing features and some services may require a paid licence."]},
    "tableau": {"name":"Tableau", "meaning":"A visual analytics tool for exploring data and building interactive charts and dashboards.", "official":"https://www.tableau.com/products/what-is-tableau", "learn":"https://www.tableau.com/learn/training", "learn_title":"Tableau official training videos and learning paths", "prereq":["A checked dataset, basic table structure and a question that visual analysis can help answer."], "alt":["Power BI; Excel charts; R or Python visualisation."], "limits":["A chart or dashboard cannot validate the data or support causal claims by itself. Tableau Public makes published work public; do not use it for confidential data."]},
    "qgis": {"name":"QGIS", "meaning":"Free, open-source geographic information system software for mapping and analysing data tied to places.", "official":"https://qgis.org/", "learn":"https://docs.qgis.org/3.40/en/docs/training_manual/", "learn_title":"QGIS Training Manual: map creation, vector data and analysis", "prereq":["A spatial question, a dataset with valid location information, and basic awareness of map scale and coordinate systems."], "alt":["ArcGIS; GeoDa for selected spatial statistics; a non-GIS table/map when location is not analytically needed."], "limits":["Maps can expose location privacy and can mislead through scale, boundary or classification choices; spatial association does not prove causation."]},
    "earth_engine": {"name":"Google Earth Engine", "meaning":"A cloud platform for processing satellite imagery and other geospatial datasets at large scale.", "official":"https://developers.google.com/earth-engine/", "learn":"https://developers.google.com/earth-engine/tutorials/tutorials", "learn_title":"Earth Engine self-paced geospatial analysis tutorials", "prereq":["Basic geospatial concepts; tutorials use the JavaScript API and assume willingness to learn code."], "alt":["QGIS for local workflows; other remote-sensing platforms where access and licensing fit."], "limits":["Imagery resolution, cloud cover, classification choices, access terms and platform limits shape results; satellite indicators are not direct measures of social conditions."]},
    "redcap": {"name":"REDCap", "meaning":"A secure web application for building research surveys and databases, generally provided through an eligible institution.", "official":"https://projectredcap.org/", "learn":"https://projectredcap.org/resources/videos/", "learn_title":"REDCap official videos and resources", "prereq":["An institution with a valid REDCap licence/hosting arrangement, approved study protocol and data-protection plan."], "alt":["KoboToolbox; LimeSurvey; institution-approved survey systems."], "limits":["Availability is institution- and licence-dependent; REDCap does not itself provide ethics approval, valid consent or a sound instrument."]},
    "media_cloud": {"name":"Media Cloud", "meaning":"An open-source platform and API for studying how selected online news sources cover topics over time.", "official":"https://mediacloud.org/", "learn":"https://mediacloud.org/support/search-2-0", "learn_title":"Media Cloud Search API guide", "prereq":["A bounded media question, defined source collection and awareness of how platform/source selection shapes coverage."], "alt":["Manual, documented media sampling; other transparent media-monitoring datasets or APIs."], "limits":["It does not represent all media or public opinion; collection coverage, access and search choices affect results."]},
    "youtube_api": {"name":"YouTube Data API", "meaning":"An API for retrieving defined YouTube video, channel or playlist metadata and search results under quota and platform rules.", "official":"https://developers.google.com/youtube/v3", "learn":"https://developers.google.com/youtube/v3/getting-started", "learn_title":"YouTube Data API getting-started guide", "prereq":["A bounded metadata question, API project/key, quota planning and review of platform terms and privacy risks."], "alt":["Manual sampling of public videos; another platform's official API where its scope fits."], "limits":["Search results and metadata are not a census of YouTube content, audience response or public opinion; API quota and platform changes apply."]},
    "opendronemap": {"name":"OpenDroneMap", "meaning":"Open-source photogrammetry software that turns overlapping drone or camera images into geospatial outputs such as orthophotos and elevation models.", "official":"https://www.opendronemap.org/", "learn":"https://docs.opendronemap.org/", "learn_title":"OpenDroneMap documentation and quickstart", "prereq":["Permission to collect imagery, suitable overlapping images and basic coordinate/GIS understanding."], "alt":["QGIS for analysis; licensed photogrammetry software such as Metashape where appropriate."], "limits":["Output accuracy depends on image quality, overlap, ground control and processing choices; imagery collection may require legal/ethical permission."]},
    "tropy": {"name":"Tropy", "meaning":"Free, open-source software for organizing photographs of archival research materials and recording their metadata.", "official":"https://www.tropy.org/", "learn":"https://docs.tropy.org/", "learn_title":"Tropy documentation: organise and describe research photos", "prereq":["Digital photographs of sources and a consistent metadata plan."], "alt":["A documented spreadsheet/file system; Zotero for bibliographic references rather than image collections."], "limits":["Tropy organises research images; it is not a genealogy database, citation manager or transcription/analysis tool."]},
    "transkribus": {"name":"Transkribus", "meaning":"A platform using handwriting-text-recognition models to help transcribe historical documents.", "official":"https://www.transkribus.org/", "learn":"https://help.transkribus.org/beginners-guide-to-transkribus", "learn_title":"Transkribus beginner guide: document processing and transcription review", "prereq":["Legible scans, permission to process the documents and ability to compare machine output with the original."], "alt":["Manual transcription; other document-specific HTR/OCR systems."], "limits":["Recognition errors vary by handwriting, language, period and scan quality; every consequential transcription needs human checking."]},
    "gramps": {"name":"Gramps", "meaning":"Free, open-source genealogy software for recording people, families, events and source citations in a family-history project.", "official":"https://gramps-project.org/", "learn":"https://www.gramps-project.org/wiki/index.php/User_manual", "learn_title":"Gramps user manual: records, relationships and sources", "prereq":["A documented research question, source records and a consistent citation approach."], "alt":["A carefully documented spreadsheet or another genealogy database."], "limits":["Software cannot verify a family relationship; conflicting records, privacy and source quality require researcher judgement."]},
    "familysearch_catalog": {"name":"FamilySearch Catalog", "meaning":"A searchable catalogue for identifying genealogical records, books and images held or described by FamilySearch and partner repositories.", "official":"https://www.familysearch.org/en/search/catalog/", "learn":"https://www.familysearch.org/en/help/helpcenter/article/how-do-i-search-the-catalog-for-records", "learn_title":"FamilySearch help: searching the catalogue for records", "prereq":["A focused place/time/person search and knowledge of record access restrictions."], "alt":["National, state, church, archive and local record catalogues; not a substitute for the original record."], "limits":["Catalogue coverage is incomplete; some images are restricted or require access at an approved centre, and a catalogue entry is not proof of a claim."]},
    "zotero": {"name":"Zotero", "meaning":"Free reference-management software for collecting, organising, citing and sharing research sources.", "official":"https://www.zotero.org/", "learn":"https://www.zotero.org/support/quick_start_guide", "learn_title":"Zotero Quick Start Guide: collect and cite sources", "prereq":["Source details and a consistent citation style."], "alt":["A well-maintained reference spreadsheet or another citation manager."], "limits":["A reference manager stores and formats source details; it does not assess source credibility or guarantee citation accuracy."]},
    "pandas": {"name":"Python with pandas", "meaning":"Python plus pandas supports scripted cleaning, checking, combining and summarising tabular research data.", "official":"https://pandas.pydata.org/docs/", "learn":"https://pandas.pydata.org/docs/getting_started/intro_tutorials/", "learn_title":"pandas introductory tutorials: work with tabular data", "prereq":["Basic Python and a documented data dictionary; coding is learned alongside the task."], "alt":["R; SPSS; Stata; spreadsheet tools for small, simple datasets."], "limits":["Code can repeat mistakes at scale; it does not decide whether measures, samples or conclusions are valid."]},
    "jupyter": {"name":"Jupyter Notebook", "meaning":"An interactive notebook environment that combines code, notes, tables and charts in a shareable analysis record.", "official":"https://jupyter.org/", "learn":"https://docs.jupyter.org/en/stable/", "learn_title":"Jupyter documentation: notebooks and reproducible workflows", "prereq":["Python or R basics and a clear, documented analysis question."], "alt":["RStudio; script files with documented outputs; spreadsheet analysis for simple tasks."], "limits":["A notebook is a work environment, not an analysis method; results still depend on data and code quality."]},
    "spss": {"name":"IBM SPSS Statistics", "meaning":"Statistical software for managing structured data and running selected descriptive and inferential analyses.", "official":"https://www.ibm.com/products/spss-statistics", "learn":"https://www.ibm.com/docs/en/spss-statistics/31.0.0", "learn_title":"IBM SPSS Statistics documentation and manuals", "prereq":["A structured dataset, question, and basic understanding of the selected statistical method."], "alt":["R; jamovi; Stata; Python for suitable workflows."], "limits":["A software output does not establish correct design, assumptions, interpretation or causality; licensing may be paid/institutional."]},
    "r": {"name":"R for statistical computing", "meaning":"R is a programming language and environment for statistical analysis, data management and graphics, extended through packages.", "official":"https://www.r-project.org/", "learn":"https://r4ds.hadley.nz/", "learn_title":"R for Data Science: free book and exercises", "prereq":["Basic data and statistical concepts; programming can be learned progressively."], "alt":["Python; SPSS; Stata; jamovi, depending on task, access and reproducibility needs."], "limits":["Packages implement methods but cannot choose a valid design or correct biased data; record package versions and code."]},
    "gephi": {"name":"Gephi", "meaning":"Free network-analysis and visualisation software for exploring graph-structured relationships.", "official":"https://gephi.org/", "learn":"https://gephi.org/quickstart/", "learn_title":"Gephi Quick Start: import, visualise and inspect a network", "prereq":["A defined network (what counts as a node and tie) and a suitable edge list."], "alt":["NetworkX for scripted graph analysis; manual network diagrams for small examples."], "limits":["Layouts and network measures do not prove influence, representativeness or causation."]},
    "networkx": {"name":"Python with NetworkX", "meaning":"A Python library for representing networks and calculating graph measures or running graph algorithms.", "official":"https://networkx.org/", "learn":"https://networkx.org/documentation/latest/tutorial.html", "learn_title":"NetworkX tutorial: graph data and network analysis", "prereq":["Basic Python and a defensible definition of nodes and relationships."], "alt":["Gephi for interactive exploration; R igraph; other graph libraries."], "limits":["Algorithms only operate on the recorded network; missing or biased ties distort results, and metrics need substantive interpretation."]},
    "geoda": {"name":"GeoDa", "meaning":"Free software for exploratory spatial data analysis, including mapping and selected spatial autocorrelation methods.", "official":"https://geodacenter.github.io/", "learn":"https://geodacenter.github.io/tutorials.html", "learn_title":"GeoDa tutorials: spatial data and exploratory analysis", "prereq":["A geocoded dataset, an appropriate spatial unit and basic spatial-statistics concepts."], "alt":["QGIS; R spatial packages; GeoPandas/PySAL for scripted workflows."], "limits":["Spatial patterns depend on boundaries, scale and weights; exploratory association is not a causal finding."]},
    "geopandas": {"name":"Python with GeoPandas", "meaning":"Python tools for reading, joining, analysing and mapping vector geographic data alongside tabular datasets.", "official":"https://geopandas.org/", "learn":"https://geopandas.org/en/stable/getting_started/introduction.html", "learn_title":"GeoPandas getting-started guide: vector data workflows", "prereq":["Basic Python and GIS concepts such as coordinate reference systems and vector layers."], "alt":["QGIS for desktop analysis; R sf; ArcGIS where licensed."], "limits":["Coordinate-system errors, boundary choice and incomplete location data can invalidate results; coding does not solve privacy or causal inference."]},
    "pysal_esda": {"name":"PySAL esda", "meaning":"A Python package for exploratory spatial data analysis, including global and local spatial autocorrelation measures.", "official":"https://pysal.org/esda/", "learn":"https://pysal.org/esda/", "learn_title":"PySAL esda documentation and worked examples", "prereq":["Python, spatial data and a justified choice of spatial weights and statistic."], "alt":["GeoDa; R spatial-statistics packages; other methods matched to the question."], "limits":["Statistics depend on spatial weights, scale and multiple testing; spatial clustering does not establish why a pattern exists."]},
    "arcgis": {"name":"ArcGIS Pro Spatial Analyst", "meaning":"A licensed GIS extension for raster and spatial analysis workflows such as suitability, density and surface analysis.", "official":"https://pro.arcgis.com/en/pro-app/latest/help/analysis/spatial-analyst/what-is-the-spatial-analyst-extension-.htm", "learn":"https://learn.arcgis.com/en/paths/spatial-analysis/", "learn_title":"Esri learning path: spatial analysis with ArcGIS", "prereq":["GIS fundamentals, spatial data and access to a valid ArcGIS licence."], "alt":["QGIS and suitable open-source processing tools; GeoDa for selected exploratory methods."], "limits":["Paid licence and institutional access may apply; outputs remain sensitive to data quality, assumptions, scale and model settings."]},
    "psychopy": {"name":"PsychoPy", "meaning":"Free software for building behavioural and psychological experiments, from a visual Builder interface or Python code.", "official":"https://psychopy.org/", "learn":"https://psychopy.org/tutorials/index", "learn_title":"PsychoPy tutorials: build Stroop, memory and other experiments", "prereq":["A defined behavioural question, ethical approval where needed, and basic experimental-design concepts."], "alt":["OpenSesame; PsyToolkit; paper/computer tasks where suitable."], "limits":["Software cannot validate a measure or make a sample representative; online timing and device conditions can affect precision."]},
    "opensesame": {"name":"OpenSesame", "meaning":"An open-source environment for designing and running psychology and behavioural experiments.", "official":"https://osdoc.cogsci.nl/", "learn":"https://osdoc.cogsci.nl/3.3/tutorials/", "learn_title":"OpenSesame tutorials: design and run behavioural experiments", "prereq":["A clear task protocol and basic experimental-design and ethics knowledge."], "alt":["PsychoPy; PsyToolkit; other task-specific experimental software."], "limits":["A working experiment is not evidence of construct validity; device, sampling and administration conditions matter."]},
    "psytoolkit": {"name":"PsyToolkit", "meaning":"A platform for designing and running psychology experiments and questionnaires, with programming and teaching resources.", "official":"https://www.psytoolkit.org/", "learn":"https://www.psytoolkit.org/experiment-library/", "learn_title":"PsyToolkit experiment library and learning examples", "prereq":["A defined task/questionnaire and attention to consent, privacy and device conditions."], "alt":["PsychoPy; OpenSesame; paper instruments where appropriate."], "limits":["Platform availability and task timing vary; examples do not establish validity for a new population or purpose."]},
    "limesurvey": {"name":"LimeSurvey", "meaning":"Survey software for building, distributing and managing questionnaires.", "official":"https://www.limesurvey.org/", "learn":"https://www.limesurvey.org/manual/", "learn_title":"LimeSurvey manual: build and manage a questionnaire", "prereq":["A tested questionnaire, sampling plan and data-protection/consent plan."], "alt":["KoboToolbox; REDCap where institutionally available; paper forms."], "limits":["Software cannot repair weak questions, biased recruitment or inadequate consent; hosting and features may be paid or institution-dependent."]},
}

# Five distinct tool choices per role. These are task-linked options, not
# prescribed equipment; routes can inherit the same tool identity from domain
# or area context without duplicating the identity in the final graph.
ROUTES: dict[str, list[tuple[str, str]]] = {
 "criminologist":[("excel","Organise incident or survey tables and produce transparent descriptive summaries."),("r","Analyse structured crime or justice data with a documented statistical workflow."),("qgis","Map incident locations or service access when the research question is spatial."),("nvivo","Organise and code interview, policy or case-document material."),("gephi","Explore recorded relationships among people, organisations or events when network ties are the research focus.")],
 "sociologist":[("kobo","Build and field a planned social survey or structured field form."),("nvivo","Manage and code a substantial interview or document dataset."),("taguette","Code a small qualitative text set with a transparent codebook."),("spss","Summarise and analyse structured survey data when the method fits."),("gephi","Visualise a defined social network from documented relationship data.")],
 "business economics researcher":[("excel","Clean and summarise market or business data for a bounded research question."),("stata","Run reproducible statistical or econometric analyses on structured business data."),("r","Analyse and visualise market or firm-level datasets with documented code."),("pandas","Clean, combine and summarise larger tabular datasets in Python."),("power_bi","Present checked market indicators in an interactive research dashboard.")],
 "media scientist":[("nvivo","Code interviews, media texts or audience-response material in a qualitative study."),("taguette","Tag and retrieve passages in a focused media-text sample."),("media_cloud","Track coverage of a defined topic across selected online news sources."),("youtube_api","Collect bounded video/channel metadata for a platform-specific media study."),("r","Analyse and visualise structured media or audience data.")],
 "archaeologist":[("qgis","Map sites, survey observations and spatial relationships in archaeological work."),("opendronemap","Create orthophotos or elevation models from permitted overlapping site images."),("tropy","Organise photographs of archival and field research materials with metadata."),("zotero","Manage citations and archaeological literature/source records."),("transkribus","Generate a draft transcription of historical documents for line-by-line human checking.")],
 "economic policy officer":[("excel","Monitor economic indicators and check/communicate tabular summaries."),("stata","Estimate and document statistical models used in policy analysis."),("r","Reproduce analysis of economic and policy datasets using documented code."),("power_bi","Present validated indicators and policy monitoring results in dashboards."),("pandas","Automate cleaning and combination of public economic data tables.")],
 "social work researcher":[("kobo","Collect planned field or service-user survey data using digital forms."),("redcap","Build a secure research survey/database when an eligible institution provides access."),("nvivo","Organise interviews and qualitative evaluation material."),("spss","Summarise and analyse structured service or survey data when appropriate."),("r","Document reproducible analysis of service-evaluation data.")],
 "behavioural scientist":[("psychopy","Build and run a controlled behavioural task for a reviewed experimental question."),("opensesame","Create and run behavioural experiments using a visual workflow."),("psytoolkit","Use documented experiment or questionnaire examples for a bounded study."),("spss","Analyse structured experimental or questionnaire data with a suitable method."),("r","Reproduce statistical analysis and visualisation of behavioural data.")],
 "political scientist":[("r","Analyse election, governance or political-attitude data in a documented workflow."),("stata","Run reproducible statistical analysis of political and policy datasets."),("spss","Manage and analyse structured survey data where the study design supports it."),("gephi","Explore a defined political, organisational or communication network."),("qgis","Map election, constituency or public-service patterns when geography matters.")],
 "economic adviser":[("excel","Prepare and check economic indicators, forecasts and budget tables."),("stata","Estimate and document suitable econometric models for an advisory question."),("r","Build reproducible economic analysis and visualisations."),("power_bi","Communicate monitored indicators and scenario results in an interactive report."),("pandas","Automate cleaning and joining economic datasets for analysis.")],
 "genealogist":[("gramps","Record family relationships, events and cited evidence in a genealogy database."),("tropy","Organise archival record photographs and capture their metadata."),("familysearch_catalog","Locate record collections and access conditions for a bounded family-history search."),("transkribus","Draft HTR transcriptions of historical records, then verify against images."),("zotero","Manage citations for books, articles and archival finding aids.")],
 "thanatology researcher":[("nvivo","Organise and code interviews or published narratives about death and bereavement."),("taguette","Code a small, carefully de-identified text set using a clear codebook."),("kobo","Collect an approved questionnaire where participant safety and privacy plans allow."),("spss","Analyse suitable structured survey measures with appropriate safeguards."),("r","Document reproducible analysis of sensitive survey or study data.")],
 "economist":[("excel","Inspect economic tables and produce transparent summaries or charts."),("stata","Run econometric analyses such as time-series or panel workflows when justified."),("r","Analyse and visualise economic data using reproducible scripts."),("pandas","Clean and join larger economic data tables in Python."),("power_bi","Present selected economic indicators and findings to a defined audience.")],
 "economic development coordinator":[("excel","Track programme indicators and budgets in structured tables."),("power_bi","Present monitored development indicators in a readable dashboard."),("kobo","Collect structured field-monitoring data where a mobile form is suitable."),("qgis","Map programme coverage or access patterns when location matters."),("r","Analyse and document programme or regional indicator trends.")],
 "statistician":[("r","Carry out documented statistical analysis and graphics across research datasets."),("pandas","Clean, transform and validate tabular data in reproducible Python workflows."),("jupyter","Combine executable analysis, explanation and charts in a reviewable notebook."),("spss","Run established statistical procedures where the project or institution uses SPSS."),("stata","Run reproducible statistical, survey, panel or modelling workflows when suitable.")],
 "anthropologist":[("nvivo","Organise and code interview, observation or document material for a qualitative study."),("taguette","Tag and retrieve passages from a focused ethnographic or documentary dataset."),("kobo","Collect structured field information when a survey or form is methodologically appropriate."),("tropy","Organise research photographs of archival and field materials with descriptive metadata."),("zotero","Manage ethnographic, historical and theoretical sources with citations.")],
 "tax policy analyst":[("excel","Check and summarise fiscal tables, budget lines and tax indicators."),("stata","Analyse tax, household or public-finance datasets using documented statistical workflows."),("r","Reproduce and visualise fiscal or policy analysis."),("pandas","Automate checks and joins across structured tax-policy datasets."),("power_bi","Present validated revenue and policy indicators for monitoring.")],
 "geographer":[("qgis","Map and analyse spatial data for human-geography questions."),("geoda","Explore spatial clustering and spatial association in a suitable areal dataset."),("geopandas","Process and join vector geography with tables in Python."),("pysal_esda","Calculate selected exploratory spatial statistics with justified weights."),("arcgis","Use licensed raster and spatial-analysis tools when the task and access justify them.")],
 "demographer":[("r","Analyse population data and produce reproducible summaries or projections."),("stata","Manage and analyse survey, census or longitudinal population datasets."),("spss","Analyse structured demographic survey data where the method and access fit."),("excel","Inspect and summarise population tables, with checks for definitions and coverage."),("qgis","Map population distribution or access patterns when geographic units are relevant.")],
}

ROLE_TASK = {
 "criminologist":"study crime, justice and public-safety patterns from evidence", "sociologist":"study social relationships, institutions and social change", "business economics researcher":"analyse economic and business evidence", "media scientist":"study media systems, content and audience responses", "archaeologist":"record and interpret material and documentary evidence about past societies", "economic policy officer":"analyse economic conditions and policy options", "social work researcher":"evaluate social services and practice using research evidence", "behavioural scientist":"design and analyse studies of behaviour", "political scientist":"study political institutions, behaviour and public policy", "economic adviser":"analyse economic conditions and advise on options", "genealogist":"trace family histories through records and assess conflicting evidence", "thanatology researcher":"study death, dying and bereavement through ethically gathered evidence", "economist":"analyse choices, markets and wider economic patterns", "economic development coordinator":"monitor and coordinate economic-development programmes", "statistician":"prepare, analyse and communicate quantitative evidence", "anthropologist":"study people, cultures and social life through contextual evidence", "tax policy analyst":"analyse tax systems, revenue and fiscal-policy evidence", "geographer":"study place-based patterns and relationships", "demographer":"analyse population size, composition and change"
}

def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")

def sqlq(value: Any) -> str:
    return "'" + str(value or "").replace("'", "''") + "'"

def sql_text_array(values: list[str]) -> str:
    return "ARRAY[" + ", ".join(sqlq(value) for value in values) + "]::text[]"

def learning_access(tool_key: str) -> str:
    if tool_key in {"nvivo", "spss", "stata", "arcgis"}:
        return "The linked official documentation/tutorial is publicly accessible; the software itself is commercial or licence/institution-dependent. Check current local access before choosing it."
    if tool_key == "redcap":
        return "The linked official videos/resources are public; REDCap hosting and use generally depend on an eligible institution and its licence."
    if tool_key == "power_bi":
        return "Microsoft Learn training is free; Power BI Desktop has a free tier, while sharing and some cloud features may require a paid licence."
    if tool_key == "tableau":
        return "Official training resources are free to access; Tableau Public is free but published work is public, while private use may require a paid licence."
    if tool_key in {"youtube_api", "media_cloud"}:
        return "The linked official documentation is publicly accessible; API use remains subject to quotas, platform terms and service availability."
    if tool_key == "familysearch_catalog":
        return "The catalogue and help pages are free to search; access to some record images is restricted by location or repository permissions."
    if tool_key == "transkribus":
        return "The linked official help guide is public; transcription credits, plan limits and pricing may apply to platform use."
    if tool_key == "excel":
        return "The linked Microsoft Support guide is free; Excel product access depends on the learner’s device, institution and Microsoft licence."
    return "The linked official documentation or tutorial is free to access; confirm the current software, hosting and data-access terms before use."


def tool_mentions(text: str, tool_key: str, display_name: str) -> bool:
    """Match a named tool in an alternative statement without fuzzy guessing."""
    aliases = {
        "kobo": ("kobo", "kobotoolbox"), "power_bi": ("power bi",),
        "media_cloud": ("media cloud",), "youtube_api": ("youtube data api", "youtube api"),
        "familysearch_catalog": ("familysearch", "familysearch catalog"),
        "opendronemap": ("opendronemap", "open drone map"),
        "pysal_esda": ("pysal esda", "pysal"), "qgis": ("qgis",),
        "nvivo": ("nvivo",), "spss": ("spss",), "stata": ("stata",),
        "psychopy": ("psychopy",), "opensesame": ("opensesame", "open sesame"),
    }
    names = aliases.get(tool_key, (display_name.casefold(), tool_key.replace("_", " ").casefold()))
    folded = text.casefold()
    return any(re.search(rf"(?<![a-z0-9]){re.escape(name)}(?![a-z0-9])", folded) for name in names)

def main() -> None:
    graph = json.loads(GRAPH.read_text(encoding="utf-8-sig"))
    nodes = {row["id"]: row for row in graph["nodes"]}
    roles = {row["label"].casefold(): row for row in graph["nodes"] if row.get("kind") == "role" and row.get("domain_id") == "D078"}
    if set(ROUTES) != set(roles):
        raise SystemExit(f"Role set mismatch; route roles={len(ROUTES)} graph roles={len(roles)} missing={sorted(set(roles)-set(ROUTES))} extra={sorted(set(ROUTES)-set(roles))}")
    area_by_role: dict[str, list[str]] = {}
    for edge in graph["edges"]:
        if edge.get("relationship") == "area_to_role" and edge.get("target") in {r["id"] for r in roles.values()}:
            area_by_role.setdefault(edge["target"], []).append(edge["source"])
    tool_nodes = {tool: nodes[node_id] for tool, node_id in EXISTING.items() if node_id in nodes}
    if len(tool_nodes) != len(EXISTING):
        missing = sorted(set(EXISTING) - set(tool_nodes))
        raise SystemExit(f"Missing reviewed source tool nodes: {missing}")
    rows: list[dict[str, Any]] = []
    for role_name, assignments in ROUTES.items():
        role = roles[role_name]
        if len({key for key, _ in assignments}) != len(assignments) or len(assignments) < 5:
            raise SystemExit(f"Duplicate or fewer than five tool choices for {role_name}")
        if not area_by_role.get(role["id"]):
            raise SystemExit(f"No approved area route exists for {role_name}; refusing tool promotion")
        for tool_key, use in assignments:
            base = tool_nodes.get(tool_key)
            extra = EXTRA.get(tool_key, {})
            if not base and not extra:
                raise SystemExit(f"No source-backed definition for {tool_key}")
            closure = (base or {}).get("content_contract_closure") or {}
            refs_structured = (base or {}).get("source_record") or base or {}
            base_links = (base or {}).get("learning_links") or closure.get("learning_links") or refs_structured.get("learningLinks") or []
            if not base_links and refs_structured.get("linkUrl"):
                base_links = [{"url":refs_structured["linkUrl"],"label":refs_structured.get("linkTitle") or refs_structured.get("name") or refs_structured.get("itemKey")}]
            if extra:
                official = {"id": f"official:{tool_key}", "title": f"{extra['name']} official product documentation", "url": extra["official"], "evidenceType":"official_tool_scope"}
                learn = {"id": f"learn:{tool_key}", "title": extra["learn_title"], "url": extra["learn"], "evidenceType":"task_specific_learning"}
                meaning = extra["meaning"]
                prereq = extra["prereq"]
                alternatives = extra["alt"]
                limits = extra["limits"]
                official_url, learn_url, learn_title = extra["official"], extra["learn"], extra["learn_title"]
            else:
                links = [link for link in base_links if str(link.get("url", "")).startswith("https://")]
                learn_link = links[0] if links else {}
                if not learn_link.get("url"):
                    raise SystemExit(f"Existing tool lacks a verified HTTPS learning link: {tool_key}")
                refs = (base or {}).get("source_refs") or refs_structured.get("sourceReferences") or refs_structured.get("source_refs") or []
                refs = [ref.get("url") if isinstance(ref, dict) else ref for ref in refs]
                official_url = next((url for url in refs if str(url).startswith("https://") and any(word in str(url).casefold() for word in (tool_key, "ibm", "stata", "gephi", "qgis", "psycho", "kobo", "taguette", "nvivo", "r-project", "python", "jamovi"))), refs[0] if refs else learn_link["url"])
                learn_url, learn_title = learn_link["url"], learn_link.get("label") or learn_link.get("title") or f"{(base or {}).get('label', tool_key)} learning resource"
                meaning = refs_structured.get("meaning") or refs_structured.get("what_it_is") or (base or {}).get("meaning")
                prereq = refs_structured.get("prerequisites") or closure.get("prerequisites") or ["A clearly defined task and the method or data the tool is meant to support."]
                alternatives = refs_structured.get("validAlternatives") or refs_structured.get("valid_alternatives") or [f"Another suitable tool for the same task; choose based on method, access, cost and data needs."]
                limits = refs_structured.get("limitations") or refs_structured.get("evidence_limitations") or closure.get("limitations") or ["The tool does not replace sound research design, ethical practice or interpretation; using it is not proof of competence."]
                official = {"id": f"official:{tool_key}", "title": f"{(base or {}).get('label', tool_key)} official documentation", "url": official_url, "evidenceType":"official_tool_scope"}
                learn = {"id": f"learning:{tool_key}", "title": learn_title, "url": learn_url, "evidenceType":"task_specific_learning"}
            if not meaning:
                raise SystemExit(f"Missing plain-language definition for {tool_key}")
            area_names = [nodes[aid].get("label", aid) for aid in area_by_role[role["id"]] if aid in nodes]
            task_anchor = ROLE_TASK[role_name]
            role_sources = [
                {"id":f"role-profile:{slug(role_name)}:{index+1}","title":f"Reviewed occupational task profile for {role_name}","url":url,"evidenceType":"role_task_scope"}
                for index, url in enumerate(role.get("source_refs") or []) if str(url).startswith("https://")
            ]
            role_sources = role_sources[:3]
            if not role_sources:
                raise SystemExit(f"No HTTPS role-task evidence for {role_name}")
            row_id = f"D078-ROLE-TOOL-{slug(role_name)}-{tool_key.upper()}"
            task_node_id = f"role-task:d078:{slug(role_name)}"
            relationships = [{"type":"supports", "target_id":task_node_id, "target":task_anchor,
                "explanation":use, "sequence_approved":False,
                "source_references":[official, *role_sources]}]
            for alternative_key, _ in assignments:
                if alternative_key == tool_key:
                    continue
                alternative_base = tool_nodes.get(alternative_key)
                alternative_extra = EXTRA.get(alternative_key, {})
                alternative_name = alternative_extra.get("name") or (alternative_base or {}).get("label", alternative_key)
                if tool_mentions(" ".join(alternatives), alternative_key, alternative_name):
                    alternative_official_url = alternative_extra.get("official")
                    if not alternative_official_url and alternative_base:
                        candidate_refs = alternative_base.get("source_refs") or []
                        alternative_official_url = next((ref.get("url") if isinstance(ref, dict) else ref for ref in candidate_refs if str(ref.get("url") if isinstance(ref, dict) else ref).startswith("https://")), official_url)
                    alternative_reference = {"id":f"official:{alternative_key}",
                        "title":f"{alternative_name} official documentation", "url":alternative_official_url or official_url,
                        "evidenceType":"official_tool_scope"}
                    relationships.append({"type":"alternative_to", "target_id":f"D078-TOOL-{alternative_key.upper()}",
                        "target":alternative_name,
                        "explanation":f"For this role task, {alternative_name} is another possible tool route when its workflow, access and task fit better. The tools are alternatives for this use case, not interchangeable for every task.",
                        "sequence_approved":False, "source_references":[official, alternative_reference, *role_sources]})
            rows.append({
                "id": row_id, "context_level":"role", "context_key":f"D078|{role_name}", "role_id":role["id"], "role_name":role_name,
                "domain_id":"D078", "domain_name":"Social Sciences", "area_ids":area_by_role[role["id"]], "area_names":area_names,
                "canonical_tool_id":f"D078-TOOL-{tool_key.upper()}", "source_graph_node_id":EXISTING.get(tool_key), "tool_key":tool_key, "item_type":"tool", "name":extra.get("name") or (base or {}).get("label", tool_key).split(" for ")[0],
                "plain_meaning":meaning, "contextual_use":f"For {role_name} work, {use} This is an optional tool choice for a task that calls for it; it is not a requirement for entering or working in the role.",
                "expected_output":f"A documented {tool_key.replace('_',' ')} work product that supports {task_anchor}, with its data, assumptions and limits stated.",
                "requirement_level":"optional", "priority":"optional", "priority_reason":f"Relevant only when a specific {role_name} task needs this tool; the method and task determine whether it adds value.",
                "requirement_scope":{
                    "lane":"choose_one_alternative",
                    "lane_source":"D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17",
                    "condition":f"When the selected {role_name} task calls for this function; choose a suitable listed tool if it helps, or skip when the task does not call for it.",
                    "scope_kind":"role_task_tool_choice",
                    "alternatives_are_cumulative":False,
                    "skippable":True,
                    "blocks_progression":False,
                    "auto_add":False,
                    "auto_order":False,
                    "can_select_alongside_needed":True,
                },
                "prerequisites":prereq, "alternatives":alternatives, "complements":[f"A suitable method for {task_anchor}", "Research ethics and data-quality checks where people or sensitive data are involved"],
                "task_node_id":task_node_id, "relationships":relationships,
                "limitations":limits + ["Tool familiarity or a completion badge does not prove role competence, professional qualification or job readiness."],
                "official_reference":official, "learning_resource":{"title":learn_title,"url":learn_url,"access":learning_access(tool_key),"why_this_resource":f"This resource is attached because its official guide teaches the tool workflow used for this bounded {role_name} task."},
                "source_references":[official, learn, *role_sources], "source_locators":[{"sourceId":official["id"],"url":official_url,"locator":"Official product documentation: scope and capabilities"},{"sourceId":learn["id"],"url":learn_url,"locator":learn_title}, *[{"sourceId":ref["id"],"url":ref["url"],"locator":"Role description and task scope; tool fit is a bounded synthesis, not an employer tool mandate."} for ref in role_sources]],
                "role_task_evidence":role_sources,
                "link_url":learn_url,"link_title":learn_title,"geographic_scope":"global","evidence_confidence":"medium",
                "source_backed":True,"guidance_owner":"role","claim_review_state":"approved","student_visible":True,
                "selection_note":"Optional focus item; selecting or omitting it does not block the core domain-to-area-to-role path.",
            })
    lane_path = ROOT / "data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json"
    lane_records = json.loads(lane_path.read_text(encoding="utf-8")).get("records") or []
    lanes_by_id = {
        str(record.get("item_id")): record
        for record in lane_records if record.get("context_type") == "role_tool"
    }
    if len(lanes_by_id) != 95 or len(rows) != 95:
        raise ValueError(f"Expected exactly 95 route tools and 95 lane decisions; got {len(rows)} and {len(lanes_by_id)}")
    for row in rows:
        decision = lanes_by_id.get(row["id"])
        if not decision or decision.get("context_key") != row["role_name"]:
            raise ValueError(f"Role tool route does not match its exact lane decision: {row['id']}")
        if decision.get("requirement_lane") != "choose_one_alternative":
            raise ValueError(f"Role tool has unexpected lane {decision.get('requirement_lane')}: {row['id']}")
        row["requirement_scope"].update({
            "lane_source": lane_path.relative_to(ROOT).as_posix(),
            "condition": decision.get("condition"),
            "rationale": decision.get("rationale"),
            "evidence_gap": decision.get("evidence_gap"),
        })
    OUTPUT.write_text(json.dumps({"schema_version":"2026-10-16.d078-role-tool-routes.v1","domain_id":"D078","status":"role_scoped_optional_tool_contracts","source_graph":GRAPH.name,"role_count":len(roles),"minimum_distinct_tools_per_role":5,"routes":rows},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    report = ["# D078 role-tool enrichment — 2026-10-16", "", "This checkpoint adds five distinct, source-linked tool choices to each of the 19 currently routed D078 roles (95 role-tool contracts total). All are optional task supports—not role entry requirements, curriculum outcomes, qualifications, or proof of competence. Every tool has an explicit, resolvable `supports` relationship to that role’s bounded task context. When the route lists another included tool as an alternative, it also has a typed tool-to-tool `alternative_to` relationship. These links explain fit; they create no learning prerequisite or sequencing gate.", "", "Existing domain/area tools reuse canonical identities. Specialist tools are added only where the role task supports their use. A tool’s role fit is a bounded synthesis of its documented capability and the reconciled role task profile; it is not presented as an employer mandate. Each record includes a plain-language explanation, the role-specific use and output, prerequisites, alternatives, limits, official reference, and a task-specific learning link with an attachment rationale.", "", "## Role-specific choices", ""]
    for role_name in sorted(ROUTES):
        report.extend([f"### {role_name.title()}", ""])
        for tool_key, use in ROUTES[role_name]:
            extra = EXTRA.get(tool_key, {})
            base = tool_nodes.get(tool_key)
            links = (base or {}).get("learning_links") or ((base or {}).get("content_contract_closure") or {}).get("learning_links") or []
            learning = extra.get("learn") or (links[0].get("url") if links else "")
            report.append(f"- **{extra.get('name') or (base or {}).get('label', tool_key)}** — {use} [official reference]({extra.get('official') or learning}); [learning resource]({learning}).")
        report.append("")
    report.extend(["## Evidence and boundary", "", "- Tool product capabilities and learning links are taken from official vendor/project documentation or the already-reviewed D078 domain/area tool contracts. Role task scope is linked to the existing reconciled role-profile references in the graph.", "- A match between a tool capability and a role task is a local, bounded recommendation; it does not claim the named tool is required by employers or taught in the Sociology curriculum.", "- Tool choices remain optional. The core programme → domain foundation → area → role route remains usable without selecting or learning any tool option.", "- Alternatives are task-level choices, not claims that products are identical. Paid access, institutional eligibility, privacy, licensing and data limitations are stated in the item contract.", "- Source URLs were carried forward from existing D078 research where available; new specialist tool pages were selected from official project/provider documentation. No new searches are required to render these records.", "", "## Generated artifacts", "", f"- Contract: `{OUTPUT.relative_to(ROOT).as_posix()}`", f"- SQL seed: `{SEED.relative_to(ROOT).as_posix()}`", f"- Graph integrator: `data/career-mapping/_audit/integrate_d078_role_tools_into_graph_2026_10_16.py`", "- SQL uses the existing `career_context_items` schema; apply it after the current D078 guided-content seed. It is additive/upsert-based.", ""])
    REPORT.write_text("\n".join(report), encoding="utf-8")
    upserts=[]
    for row in rows:
        role_refs = row["role_task_evidence"]
        role_locs = [loc for loc in row["source_locators"] if str(loc.get("sourceId","")).startswith("role-profile:")]
        official_locs = [loc for loc in row["source_locators"] if loc.get("sourceId") == row["official_reference"]["id"]]
        claims = {
            "item_identity":{"source_references":[row["official_reference"]],"source_locators":official_locs},
            "checkpoint_fit":{"source_references":role_refs,"source_locators":role_locs},
            "plain_meaning":{"source_references":[row["official_reference"]],"source_locators":official_locs},
            "contextual_use":{"source_references":row["source_references"],"source_locators":row["source_locators"]},
            "expected_output":{"source_references":role_refs,"source_locators":role_locs},
            "priority":{"source_references":role_refs,"source_locators":role_locs},
        }
        claim_evidence = {"claims":claims,"reviewed_by":"local_d078_role_tool_reconciliation","decision_id":row["id"]}
        fields = ["context_level","context_key","domain_key","item_type","item_key","name","plain_meaning","contextual_use","expected_output","priority","priority_reason","prerequisites","related_items","source_ids","source_references","source_locators","geographic_scope","evidence_limitations","evidence_type","source_confidence","data_state","link_state","link_url","link_title","link_source_reference","link_accessed_at","link_confidence","link_evidence","guidance_owner","verified_at","claim_review_state","claim_evidence","link_kind","link_level","link_language","link_access","theme_key","theme_label","use_case_key","requirement_level","requirement_reason","requirement_scope"]
        vals = [sqlq(row["context_level"]),sqlq(row["context_key"]),sqlq("D078"),sqlq("tool"),sqlq(row["canonical_tool_id"]),sqlq(row["name"]),sqlq(row["plain_meaning"]),sqlq(row["contextual_use"]),sqlq(row["expected_output"]),sqlq("optional"),sqlq(row["priority_reason"]),sqlq(json.dumps(row["prerequisites"],ensure_ascii=False))+"::jsonb",sqlq(json.dumps(row["relationships"]+[{"type":"alternative","items":row["alternatives"]},{"type":"complement","items":row["complements"]}],ensure_ascii=False))+"::jsonb",sql_text_array([r["id"] for r in row["source_references"]]),sqlq(json.dumps(row["source_references"],ensure_ascii=False))+"::jsonb",sqlq(json.dumps(row["source_locators"],ensure_ascii=False))+"::jsonb",sqlq("global"),sqlq(json.dumps(row["limitations"],ensure_ascii=False))+"::jsonb",sqlq("source_supported_synthesis"),sqlq("medium"),sqlq("source_backed"),sqlq("linked"),sqlq(row["link_url"]),sqlq(row["link_title"]),sqlq(json.dumps(row["learning_resource"],ensure_ascii=False))+"::jsonb",sqlq("2026-10-16")+"::date",sqlq("medium"),sqlq(json.dumps({"url":row["link_url"],"locator":row["link_title"],"why_this_resource":row["learning_resource"]["why_this_resource"],"supports":row["contextual_use"],"access":row["learning_resource"]["access"]},ensure_ascii=False))+"::jsonb",sqlq("role"),sqlq("2026-10-16")+"::date",sqlq("approved"),sqlq(json.dumps(claim_evidence,ensure_ascii=False))+"::jsonb",sqlq("free_task_specific_learning_resource"),sqlq("role_task_learning"),sqlq("English"),sqlq(row["learning_resource"]["access"]),sqlq("role_learning_options"),sqlq("Optional tools for particular role tasks"),sqlq(row["id"]),sqlq("optional"),sqlq(row["priority_reason"]),sqlq(json.dumps(row["requirement_scope"],ensure_ascii=False))+"::jsonb"]
        if len(fields) != len(vals):
            raise ValueError(f"Generated SQL field/value mismatch for {row['id']}: {len(fields)} fields, {len(vals)} values")
        upserts.append("INSERT INTO skillup_dev.career_context_items ("+", ".join(fields)+") VALUES ("+", ".join(vals)+") ON CONFLICT (context_level,context_key,item_type,item_key) DO UPDATE SET name=EXCLUDED.name, plain_meaning=EXCLUDED.plain_meaning, contextual_use=EXCLUDED.contextual_use, expected_output=EXCLUDED.expected_output, priority=EXCLUDED.priority, priority_reason=EXCLUDED.priority_reason, prerequisites=EXCLUDED.prerequisites, related_items=EXCLUDED.related_items, source_ids=EXCLUDED.source_ids, source_references=EXCLUDED.source_references, source_locators=EXCLUDED.source_locators, geographic_scope=EXCLUDED.geographic_scope, evidence_limitations=EXCLUDED.evidence_limitations, evidence_type=EXCLUDED.evidence_type, source_confidence=EXCLUDED.source_confidence, data_state=EXCLUDED.data_state, link_state=EXCLUDED.link_state, link_url=EXCLUDED.link_url, link_title=EXCLUDED.link_title, link_source_reference=EXCLUDED.link_source_reference, link_accessed_at=EXCLUDED.link_accessed_at, link_confidence=EXCLUDED.link_confidence, link_evidence=EXCLUDED.link_evidence, guidance_owner=EXCLUDED.guidance_owner, verified_at=EXCLUDED.verified_at, claim_review_state=EXCLUDED.claim_review_state, claim_evidence=EXCLUDED.claim_evidence, link_kind=EXCLUDED.link_kind, link_level=EXCLUDED.link_level, link_language=EXCLUDED.link_language, link_access=EXCLUDED.link_access, theme_key=EXCLUDED.theme_key, theme_label=EXCLUDED.theme_label, use_case_key=EXCLUDED.use_case_key, requirement_level=EXCLUDED.requirement_level, requirement_reason=EXCLUDED.requirement_reason, requirement_scope=EXCLUDED.requirement_scope;")
    SEED.write_text("-- Generated by data/career-mapping/_audit/enrich_d078_role_tools_2026_10_16.py\n-- Optional, role-scoped tool choices; no prerequisite edges are created.\nBEGIN;\n"+"\n".join(upserts)+"\nCOMMIT;\n",encoding="utf-8")
    print(f"Wrote {len(rows)} role-tool contracts for {len(roles)} roles; SQL seed: {SEED.relative_to(ROOT)}; checkpoint: {REPORT.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
