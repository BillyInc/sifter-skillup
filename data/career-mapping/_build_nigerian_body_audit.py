"""Build the Nigerian professional-body audit for every active domain.

This is an evidence inventory, not a claim that every body regulates a
profession.  It distinguishes regulators, professional associations, sector
skills bodies, and government/sector context so emerging domains are not
given invented Nigerian licensing claims.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parent


BODY_CATALOG = {
    "ng_nahbpon": ("National Association of Hair and Beauty Practitioners of Nigeria", "professional_association", "https://nahbpon.com/about-nahbpon/"),
    "ng_apsman": ("Association of Practitioners of Spa and Medical Aesthetics of Nigeria", "professional_association", "https://apsman.org/"),
    "ng_posban": ("Practitioners of Spa and Beauty Association of Nigeria", "professional_association", "https://posbann.com/about-us/"),
    "ng_cippon": ("Chartered Institute of Professional Printers of Nigeria", "statutory_professional_body", "https://www.cipponinstituteedu-ng.org/about.html"),
    "ng_sppn": ("Society of Printing Practitioners of Nigeria", "professional_association", "https://sppn.com.ng/"),
    "ng_bumpan": ("Building Materials Producers Association of Nigeria", "sector_association", "https://bumpanng.com/"),
    "ng_cpn": ("Computer Professionals Registration Council of Nigeria", "regulator", "https://www.cpn.gov.ng/"),
    "ng_nitda": ("National Information Technology Development Agency", "government_context", "https://nitda.gov.ng/"),
    "ng_ncc": ("Nigerian Communications Commission", "regulator", "https://www.ncc.gov.ng/"),
    "ng_ndpc": ("Nigeria Data Protection Commission", "regulator", "https://ndpc.gov.ng/"),
    "ng_aaai": ("Association for the Advancement of Artificial Intelligence, Nigeria Chapter", "professional_association", "https://aaai.org.ng/"),
    "ng_dsn": ("Data Science Nigeria", "professional_association", "https://www.datasciencenigeria.org/"),
    "ng_ncs": ("Nigeria Computer Society", "professional_association", "https://www.ncs.org.ng/"),
    "ng_efn": ("Esports Federation of Nigeria", "sports_body", "https://esportsfederationofnigeria.com/"),
    "ng_fintechngr": ("FinTech Association of Nigeria", "professional_association", "https://fintechng.org/"),
    "ng_cbn": ("Central Bank of Nigeria", "regulator", "https://www.cbn.gov.ng/"),
    "ng_sec": ("Securities and Exchange Commission Nigeria", "regulator", "https://sec.gov.ng/"),
    "ng_naicom": ("National Insurance Commission", "regulator", "https://naicom.gov.ng/"),
    "ng_ican": ("Institute of Chartered Accountants of Nigeria", "professional_body", "https://www.ican.org.ng/"),
    "ng_anan": ("Association of National Accountants of Nigeria", "professional_body", "https://anan.org.ng/"),
    "ng_cibn": ("Chartered Institute of Bankers of Nigeria", "professional_body", "https://www.cibng.org/"),
    "ng_cis": ("Chartered Institute of Stockbrokers", "professional_body", "https://cisnigeria.com/"),
    "ng_ciin": ("Chartered Insurance Institute of Nigeria", "professional_body", "https://ciinigeria.org/"),
    "ng_citn": ("Chartered Institute of Taxation of Nigeria", "professional_body", "https://citn.org/"),
    "ng_icen": ("Institute of Chartered Economists of Nigeria", "professional_body", "https://icennig.org.ng/about/"),
    "ng_nesoc": ("Nigerian Economic Society", "professional_association", "https://nigerianeconomicsociety.org.ng/"),
    "ng_riman": ("Risk Management Association of Nigeria", "professional_association", "https://riman.org/"),
    "ng_cipsmn": ("Chartered Institute of Purchasing and Supply Management of Nigeria", "professional_body", "https://www.cipsmn.org.ng/about"),
    "ng_nafm": ("Nigerian Academy of Facility Managers", "professional_association", "https://www.nafm.org.ng/register-grade"),
    "ng_ossn": ("Occupational Safety Society of Nigeria", "professional_association", "https://ossnigeria.org/"),
    "ng_coren": ("Council for the Regulation of Engineering in Nigeria", "regulator", "https://coren.gov.ng/"),
    "ng_nse": ("Nigerian Society of Engineers", "professional_association", "https://www.nse.org.ng/"),
    "ng_nsche": ("Nigerian Society of Chemical Engineers", "professional_association", "https://nsche.org/"),
    "ng_nieee": ("Nigerian Institute of Electrical and Electronic Engineers", "professional_association", "https://nieee.org.ng/NEC"),
    "ng_arcon": ("Architects Registration Council of Nigeria", "regulator", "https://arconigeria.gov.ng/"),
    "ng_corbon": ("Council of Registered Builders of Nigeria", "regulator", "https://www.corbon.gov.ng/aboutUs"),
    "ng_toprec": ("Town Planners Registration Council of Nigeria", "regulator", "https://www.toprec.gov.ng/"),
    "ng_qsrbn": ("Quantity Surveyors Registration Board of Nigeria", "regulator", "https://qsrbn.gov.ng/"),
    "ng_esvarbon": ("Estate Surveyors and Valuers Registration Board of Nigeria", "regulator", "https://www.esvarbon.gov.ng/"),
    "ng_surcon": ("Surveyors Council of Nigeria", "regulator", "https://www.surcon.gov.ng/"),
    "ng_nia": ("Nigerian Institute of Architects", "professional_association", "https://nia.ng/"),
    "ng_niob": ("Nigerian Institute of Building", "professional_association", "https://niob.com.ng/"),
    "ng_nitp": ("Nigerian Institute of Town Planners", "professional_association", "https://nitpng.org/"),
    "ng_niqs": ("Nigerian Institute of Quantity Surveyors", "professional_association", "https://niqs.org.ng/"),
    "ng_niesv": ("Nigerian Institution of Estate Surveyors and Valuers", "professional_association", "https://www.niesv.org.ng/"),
    "ng_health_ministry": ("Federal Ministry of Health and Social Welfare health regulatory bodies", "government_context", "https://health.gov.ng/hospital-services/"),
    "ng_nma": ("Nigerian Medical Association", "professional_association", "https://nigeriamedicalassociation.org/"),
    "ng_mdcn": ("Medical and Dental Council of Nigeria", "regulator", "https://www.mdcn.gov.ng/"),
    "ng_nmcn": ("Nursing and Midwifery Council of Nigeria", "regulator", "https://www.nmcn.gov.ng/"),
    "ng_pcn": ("Pharmacists Council of Nigeria", "regulator", "https://www.pcn.gov.ng/"),
    "ng_vcn": ("Veterinary Council of Nigeria", "regulator", "https://vcn.gov.ng/"),
    "ng_mlscn": ("Medical Laboratory Science Council of Nigeria", "regulator", "https://mlscn.gov.ng/"),
    "ng_rrbn": ("Radiographers Registration Board of Nigeria", "regulator", "https://rrbn.gov.ng/"),
    "ng_mrtb": ("Medical Rehabilitation Therapists Board of Nigeria", "regulator", "https://mrtb.gov.ng/"),
    "ng_odorbn": ("Optometry and Dispensing Opticians Registration Board of Nigeria", "regulator", "https://odorbn.gov.ng/"),
    "ng_dtrbn": ("Dental Therapists Registration Board of Nigeria", "regulator", "https://dtrbn.gov.ng/"),
    "ng_hrrbn": ("Health Records Registration Board of Nigeria", "regulator", "https://hrrbn.gov.ng/"),
    "ng_chprbn": ("Community Health Practitioners Registration Board of Nigeria", "regulator", "https://chprbn.gov.ng/"),
    "ng_nphcda": ("National Primary Health Care Development Agency", "government_context", "https://nphcda.gov.ng/"),
    "ng_ehocon": ("Environmental Health Officers Registration Council of Nigeria", "regulator", "https://ehorecon.gov.ng/"),
    "ng_ipan": ("Institute of Public Analysts of Nigeria", "professional_body", "https://ipan.gov.ng/"),
    "ng_aphpn": ("Association of Public Health Physicians of Nigeria", "professional_association", "https://aphpn-ng.net/"),
    "ng_psn": ("Pharmaceutical Society of Nigeria", "professional_association", "https://psnnational.org/"),
    "ng_npa": ("Nigerian Psychological Association", "professional_association", "https://www.npafct.org/"),
    "ng_nislt": ("Nigerian Institute of Science Laboratory Technology", "professional_body", "https://nislt.gov.ng/"),
    "ng_nicfost": ("Nigerian Council of Food Science and Technology", "regulator", "https://nicfost.gov.ng/about-us/"),
    "ng_nucc": ("National Universities Commission", "education_regulator", "https://www.nuc.edu.ng/"),
    "ng_trcn": ("Teachers Registration Council of Nigeria", "regulator", "https://trcn.gov.ng/"),
    "ng_ncce": ("National Commission for Colleges of Education", "education_regulator", "https://ncce.gov.ng/"),
    "ng_nbte": ("National Board for Technical Education", "education_regulator", "https://web.nbte.gov.ng/downloads"),
    "ng_nerdc": ("Nigerian Educational Research and Development Council", "government_context", "https://nerdc.gov.ng/"),
    "ng_lrcn": ("Librarians Registration Council of Nigeria", "regulator", "https://lrcn.gov.ng/"),
    "ng_nla": ("Nigerian Library Association", "professional_association", "https://nla.org.ng/about/objective"),
    "ng_cipm": ("Chartered Institute of Personnel Management of Nigeria", "professional_body", "https://cipmnigeria.org/"),
    "ng_nim": ("Nigerian Institute of Management", "professional_association", "https://managementnigeria.org/"),
    "ng_cia": ("Chartered Institute of Administration", "professional_body", "https://cia.org.ng/"),
    "ng_cilt": ("Chartered Institute of Logistics and Transport Nigeria", "professional_body", "https://ciltnigeria.org/"),
    "ng_crffn": ("Council for the Regulation of Freight Forwarding in Nigeria", "regulator", "https://crffn.gov.ng/"),
    "ng_nagaff": ("National Association of Government Approved Freight Forwarders", "professional_association", "https://nagaff.org/"),
    "ng_nba": ("Nigerian Bar Association", "professional_association", "https://nigerianbar.org.ng/"),
    "ng_cle": ("Council of Legal Education Nigeria", "legal_education_body", "https://www.counciloflegaleducationnigeria.org/"),
    "ng_nccopyright": ("Nigerian Copyright Commission", "regulator", "https://copyright.gov.ng/"),
    "ng_niia": ("Nigerian Institute of International Affairs", "government_context", "https://niia.gov.ng/"),
    "ng_nila": ("Nigerian Immigration Lawyers Association", "professional_association", "https://nila.ng/about-us/"),
    "ng_nipc": ("Nigerian Institute of Public Relations", "professional_body", "https://niprng.org.ng/"),
    "ng_nuj": ("Nigeria Union of Journalists", "professional_association", "https://www.nuj.org.ng/"),
    "ng_apcon": ("Advertising Practitioners Council of Nigeria", "regulator", "https://apcon.gov.ng/"),
    "ng_nbc": ("National Broadcasting Commission", "regulator", "https://www.nbc.gov.ng/"),
    "ng_nfvcb": ("National Film and Video Censors Board", "regulator", "https://www.nfvcb.gov.ng/"),
    "ng_ncmm": ("National Commission for Museums and Monuments", "government_context", "https://ncmm.gov.ng/"),
    "ng_ncg": ("National Gallery of Art Nigeria", "government_context", "https://nga.gov.ng/"),
    "ng_fmacce": ("Federal Ministry of Arts, Culture and the Creative Economy", "government_context", "https://www.fmacce.gov.ng/department/entertainment-and-creative-economy-ece"),
    "ng_nso": ("National Sports Commission", "government_context", "https://sports.gov.ng/"),
    "ng_nff": ("Nigeria Football Federation", "sports_body", "https://thenff.com/"),
    "ng_nihotour": ("National Institute for Hospitality and Tourism", "sector_skills_body", "https://nihotour.gov.ng/"),
    "ng_nanta": ("National Association of Nigerian Travel Agencies", "professional_association", "https://nanta.org.ng/"),
    "ng_fman": ("Federal Ministry of Agriculture and Food Security", "government_context", "https://agriculture.gov.ng/structure/"),
    "ng_arcn": ("Agricultural Research Council of Nigeria", "government_context", "https://arcn.gov.ng/"),
    "ng_nias": ("Nigerian Institute of Animal Science", "regulator", "https://nias.gov.ng/"),
    "ng_nasc": ("National Agricultural Seeds Council", "regulator", "https://seedcouncil.gov.ng/"),
    "ng_niss": ("Nigeria Institute of Soil Science", "professional_body", "https://niss.gov.ng/"),
    "ng_fison": ("Fisheries Society of Nigeria", "professional_association", "https://fison.org.ng/"),
    "ng_fan": ("Forestry Association of Nigeria", "professional_association", "https://fan.org.ng/"),
    "ng_nafdac": ("National Agency for Food and Drug Administration and Control", "regulator", "https://nafdac.gov.ng/"),
    "ng_nimet": ("Nigerian Meteorological Agency", "government_context", "https://nimet.gov.ng/foi"),
    "ng_nihsa": ("Nigeria Hydrological Services Agency", "government_context", "https://nihsa.gov.ng/"),
    "ng_nesrea": ("National Environmental Standards and Regulations Enforcement Agency", "regulator", "https://nesrea.gov.ng/"),
    "ng_naege": ("Nigerian Association for Engineering Geology and the Environment", "professional_association", "https://www.naege.org/"),
    "ng_iepn": ("Institute of Environmental Practitioners of Nigeria", "professional_body", "https://iepn.gov.ng/"),
    "ng_iccon": ("Institute of Chartered Chemists of Nigeria", "regulator", "https://iccon.gov.ng/about-us/"),
    "ng_nuprc": ("Nigerian Upstream Petroleum Regulatory Commission", "regulator", "https://www.nuprc.gov.ng/"),
    "ng_nmdpra": ("Nigerian Midstream and Downstream Petroleum Regulatory Authority", "regulator", "https://www.nmdpra.gov.ng/"),
    "ng_nape": ("Nigerian Association of Petroleum Explorationists", "professional_association", "https://nape.org.ng/"),
    "ng_nnra": ("Nigerian Nuclear Regulatory Authority", "regulator", "https://nnra.gov.ng/"),
    "ng_nafdac2": ("National Agency for Food and Drug Administration and Control", "regulator", "https://nafdac.gov.ng/"),
    "ng_ncaa": ("Nigerian Civil Aviation Authority", "regulator", "https://www.ncaa.gov.ng/about/about-ncaa"),
    "ng_nimasa": ("Nigerian Maritime Administration and Safety Agency", "regulator", "https://nimasa.gov.ng/"),
    "ng_nimasa2": ("Nigerian Shippers Council", "government_context", "https://shipperscouncil.gov.ng/"),
    "ng_nitt": ("Nigerian Institute of Transport Technology", "sector_skills_body", "https://nitt.gov.ng/"),
    "ng_nasrda": ("National Space Research and Development Agency", "government_context", "https://nasrda.gov.ng/"),
    "ng_ngsa": ("Nigerian Geological Survey Agency", "government_context", "https://ngsa.gov.ng/about-us/"),
    "ng_naec": ("Nigeria Atomic Energy Commission", "government_context", "https://naec.gov.ng/"),
    "ng_nimr": ("Nigerian Institute of Medical Research", "government_context", "https://nimr.gov.ng/"),
    "ng_nema": ("National Emergency Management Agency", "government_context", "https://nema.gov.ng/"),
    "ng_fmhds": ("Federal Ministry of Humanitarian Affairs and Poverty Reduction", "government_context", "https://fmhds.gov.ng/about-fmhds/"),
    "ng_nscr": ("National Commission for Refugees, Migrants and Internally Displaced Persons", "government_context", "https://ncfrmi.gov.ng/"),
    "ng_nhrc": ("National Human Rights Commission Nigeria", "government_context", "https://nhrc.gov.ng/"),
    "ng_nis_service": ("Nigeria Immigration Service", "government_context", "https://immigration.gov.ng/"),
    "ng_nscdc": ("Nigeria Security and Civil Defence Corps", "government_context", "https://nscdc.gov.ng/"),
    "ng_nsc": ("Nigeria Society of Criminology", "professional_association", "https://nigeriansocietyofcriminology.org/"),
    "ng_nasow": ("Nigerian Association of Social Workers", "professional_association", "https://nasow.org.ng/"),
    "ng_casson": ("Counselling Association of Nigeria", "professional_association", "https://casson.org.ng/"),
    "ng_nas": ("Nigerian Academy of Science", "professional_body", "https://nas.org.ng/"),
    "ng_nip": ("Nigerian Institute of Physics", "professional_association", "https://nipng.org/"),
    "ng_nic": ("Chemical Society of Nigeria", "professional_association", "https://chemicalnigeria.org/"),
    "ng_nib": ("Nigerian Institute of Biology", "professional_association", "https://nibonline.org.ng/"),
    "ng_naseni": ("National Agency for Science and Engineering Infrastructure", "government_context", "https://naseni.gov.ng/"),
    "ng_nnmda": ("Nigeria Natural Medicine Development Agency", "government_context", "https://nnmda.gov.ng/"),
    "ng_rmrdc": ("Raw Materials Research and Development Council", "government_context", "https://rmrdc.gov.ng/"),
    "ng_nabteb": ("National Business and Technical Examinations Board", "education_regulator", "https://nabteb.gov.ng/"),
    "ng_itf": ("Industrial Training Fund", "sector_skills_body", "https://itf.gov.ng/"),
    "ng_nadc": ("National Automotive Design and Development Council", "government_context", "https://nadc.gov.ng/"),
    "ng_bpp": ("Bureau of Public Procurement", "regulator", "https://bpp.gov.ng/"),
    "ng_niser": ("Nigerian Institute of Social and Economic Research", "government_context", "https://niser.gov.ng/"),
    "ng_imo": ("Nigerian Institute of Marine Engineers", "professional_association", "https://nime.org.ng/"),
    "ng_fadan": ("Fashion Designers Association of Nigeria", "professional_association", "https://fadan.ng/registration/"),
    "ng_fashion_council": ("Nigerian Fashion Council", "sector_skills_body", "https://nigerianfashioncouncil.org/"),
    "ng_apfpn": ("Association of Professional Fashion Practitioners of Nigeria", "professional_association", "https://apfpn.org/about-us/"),
    "ng_apctcim": ("Association of Practitioners of Traditional, Complementary and Integrative Medicine", "professional_association", "https://apctcim.org.ng/e-library"),
    "ng_ncsc": ("Nigerian Council for Science and Technology", "government_context", "https://scienceandtech.gov.ng/agencies/"),
    "ng_nnlc": ("Nigerian National Labour Congress", "labour_context", "https://nlcng.org/"),
}


def body_ids(*ids: str) -> list[str]:
    return list(ids)


ICT = body_ids("ng_cpn", "ng_nitda", "ng_ncc", "ng_ndpc")
ENGINEERING = body_ids("ng_coren", "ng_nse")
BUILT = body_ids("ng_arcon", "ng_corbon", "ng_toprec", "ng_qsrbn", "ng_esvarbon", "ng_surcon")
HEALTH = body_ids("ng_health_ministry", "ng_mdcn", "ng_nmcn", "ng_pcn", "ng_mlscn", "ng_mrtb", "ng_hrrbn", "ng_chprbn")
FINANCE = body_ids("ng_cbn", "ng_sec", "ng_ican", "ng_anan", "ng_cibn", "ng_cis", "ng_ciin", "ng_citn", "ng_riman")
EDUCATION = body_ids("ng_nucc", "ng_trcn", "ng_ncce", "ng_nbte", "ng_nerdc")
CREATIVE = body_ids("ng_fmacce", "ng_nuj", "ng_apcon", "ng_nbc", "ng_nfvcb", "ng_nccopyright")


EXPLICIT = {
    "D001": body_ids("ng_cpn", "ng_ncs", "ng_nitda", "ng_ncc", "ng_ndpc"), "D002": body_ids("ng_cpn", "ng_ncs", "ng_nitda", "ng_ndpc"), "D003": body_ids("ng_cpn", "ng_ncs", "ng_nitda", "ng_aaai", "ng_dsn"),
    "D139": body_ids("ng_fmacce", "ng_cpn", "ng_ncs", "ng_nbte"), "D140": body_ids("ng_coren", "ng_cpn", "ng_ncs", "ng_naseni"),
    "D004": body_ids("ng_cpn", "ng_nitda", "ng_ndpc", "ng_ncc"), "D005": ICT,
    "D006": body_ids("ng_coren", "ng_cpn", "ng_ncc", "ng_nitda"), "D007": body_ids("ng_cpn", "ng_ncs", "ng_nitda"),
    "D008": body_ids("ng_ncc", "ng_coren", "ng_nitda"), "D009": body_ids("ng_dsn", "ng_ncs", "ng_cpn", "ng_nitda"),
    "D010": body_ids("ng_dsn", "ng_cpn", "ng_nitda"), "D011": FINANCE, "D012": body_ids("ng_cbn", "ng_sec", "ng_fintechngr", "ng_cpn"),
    "D013": FINANCE, "D014": body_ids("ng_ciin", "ng_cbn", "ng_sec"), "D015": body_ids("ng_ican", "ng_anan", "ng_citn"),
    "D016": ENGINEERING, "D017": ENGINEERING, "D018": ENGINEERING, "D019": body_ids("ng_coren", "ng_nse", "ng_naseni"),
    "D060": FINANCE, "D061": body_ids("ng_naicom", "ng_ciin", "ng_cbn"), "D062": body_ids("ng_sec", "ng_cis", "ng_cbn"),
    "D158": FINANCE, "D159": body_ids("ng_sec", "ng_cibn", "ng_riman"),
    "D020": body_ids("ng_coren", "ng_nesrea", "ng_naege", "ng_iepn"), "D021": body_ids("ng_arcon", "ng_nia"), "D022": body_ids("ng_coren", "ng_nse", "ng_ngsa"),
    "D069": body_ids("ng_ncaa", "ng_coren"), "D072": body_ids("ng_surcon", "ng_coren", "ng_ngsa"), "D074": body_ids("ng_coren", "ng_ehocon", "ng_nesrea", "ng_iepn", "ng_ossn"),
    "D146": body_ids("ng_coren", "ng_corbon", "ng_niob", "ng_nafm"), "D147": body_ids("ng_coren", "ng_cpn"), "D156": body_ids("ng_surcon", "ng_coren"),
    "D164": body_ids("ng_coren", "ng_toprec", "ng_cilt", "ng_nitt"), "D023": body_ids("ng_mdcn", "ng_nma"), "D024": body_ids("ng_nmcn"),
    "D025": body_ids("ng_pcn", "ng_psn"), "D026": body_ids("ng_health_ministry", "ng_aphpn", "ng_nphcda"), "D027": body_ids("ng_coren", "ng_mlscn"),
    "D064": body_ids("ng_npa", "ng_health_ministry"), "D066": body_ids("ng_vcn"), "D067": body_ids("ng_mdcn", "ng_dtrbn"),
    "D068": HEALTH, "D154": body_ids("ng_mrtb", "ng_npa"), "D165": body_ids("ng_npa", "ng_health_ministry"),
    "D028": body_ids("ng_nim", "ng_cia"), "D029": body_ids("ng_cipm", "ng_nim"), "D030": body_ids("ng_nim"), "D031": body_ids("ng_nim"),
    "D032": body_ids("ng_nim", "ng_cipm"), "D033": body_ids("ng_nim", "ng_cpn"), "D130": body_ids("ng_cipm", "ng_nim"),
    "D034": body_ids("ng_cilt", "ng_crffn", "ng_cipsmn"), "D035": body_ids("ng_cilt", "ng_crffn", "ng_nitt"), "D036": body_ids("ng_bpp", "ng_cipsmn"),
    "D076": body_ids("ng_nimasa", "ng_coren", "ng_imo"), "D079": body_ids("ng_crffn", "ng_nagaff"), "D037": body_ids("ng_nba", "ng_cle"),
    "D038": body_ids("ng_nba", "ng_cia", "ng_ndpc"), "D157": body_ids("ng_citn", "ng_ican"), "D162": body_ids("ng_nis_service", "ng_nba", "ng_nila"),
    "D149": body_ids("ng_niia", "ng_nba"), "D163": body_ids("ng_nccopyright", "ng_nba"), "D039": EDUCATION, "D040": body_ids("ng_nbte", "ng_nabteb", "ng_itf"),
    "D041": body_ids("ng_nas", "ng_nucc", "ng_nimr"), "D042": CREATIVE, "D043": body_ids("ng_nuj", "ng_nbc", "ng_nipc"),
    "D044": body_ids("ng_fmacce", "ng_apcon", "ng_cpn"), "D065": body_ids("ng_nuj", "ng_nipc"), "D071": body_ids("ng_nso", "ng_nff"),
    "D080": body_ids("ng_arcon", "ng_nia", "ng_fmacce"), "D152": body_ids("ng_ncmm", "ng_ncg", "ng_fmacce"),
    "D153": body_ids("ng_fmacce", "ng_nuj", "ng_nccopyright"), "D160": body_ids("ng_fadan", "ng_fashion_council", "ng_apfpn"),
    "D045": body_ids("ng_cia", "ng_nim"), "D046": body_ids("ng_nasow"), "D063": body_ids("ng_icen", "ng_nesoc", "ng_nas"), "D073": body_ids("ng_lrcn", "ng_nla"),
    "D078": body_ids("ng_niser", "ng_nas"),
    "D077": body_ids("ng_nscdc", "ng_nis_service"), "D128": body_ids("ng_nasow", "ng_casson"), "D143": body_ids("ng_cpn", "ng_nsc", "ng_nba"),
    "D150": body_ids("ng_fmacce"), "D151": body_ids("ng_nsc", "ng_nba"), "D161": body_ids("ng_nema", "ng_fmhds", "ng_nscr", "ng_nasow"),
    "D047": body_ids("ng_fman", "ng_arcn", "ng_nas", "ng_niss"), "D048": body_ids("ng_nicfost", "ng_nafdac", "ng_nislt"),
    "D049": body_ids("ng_coren", "ng_nadc", "ng_nse"), "D050": body_ids("ng_coren", "ng_nse"), "D075": body_ids("ng_fadan", "ng_fashion_council", "ng_nbte"),
    "D051": body_ids("ng_esvarbon", "ng_niesv"), "D052": body_ids("ng_corbon", "ng_coren", "ng_niob"), "D053": body_ids("ng_nihotour", "ng_nanta"),
    "D054": body_ids("ng_nuprc", "ng_nmdpra", "ng_nape"), "D055": body_ids("ng_coren", "ng_nsche"), "D148": body_ids("ng_nuprc", "ng_nmdpra", "ng_coren"),
    "D056": body_ids("ng_cpn", "ng_nitda", "ng_ndpc"), "D057": body_ids("ng_health_ministry", "ng_cpn", "ng_ndpc"), "D058": body_ids("ng_nucc", "ng_nbte", "ng_nitda"),
    "D059": body_ids("ng_nasrda", "ng_coren", "ng_nitda"), "D081": body_ids("ng_cia", "ng_cipm", "ng_nbte"), "D082": body_ids("ng_cipm", "ng_nim"),
    "D083": body_ids("ng_nihotour", "ng_nanta"), "D084": body_ids("ng_ican", "ng_anan", "ng_cipm"), "D085": body_ids("ng_nim", "ng_cipm"),
    "D087": body_ids("ng_nbte", "ng_itf", "ng_nahbpon"), "D088": body_ids("ng_nbte", "ng_itf", "ng_apsman", "ng_posban"), "D089": body_ids("ng_fmacce"), "D090": body_ids("ng_vcn", "ng_nbte"),
    "D091": body_ids("ng_nbte", "ng_itf"), "D092": body_ids("ng_nihotour", "ng_nbte"), "D093": body_ids("ng_coren", "ng_corbon", "ng_nbte"),
    "D094": body_ids("ng_cpn", "ng_nbte", "ng_itf"), "D095": body_ids("ng_nadc", "ng_nbte", "ng_coren"), "D096": body_ids("ng_nbte", "ng_itf"),
    "D097": body_ids("ng_coren", "ng_corbon", "ng_nbte"), "D098": body_ids("ng_coren", "ng_nbte"), "D099": body_ids("ng_corbon", "ng_nbte"),
    "D100": body_ids("ng_corbon", "ng_nbte"), "D101": body_ids("ng_corbon", "ng_nbte"), "D102": body_ids("ng_corbon", "ng_nbte"),
    "D103": body_ids("ng_fadan", "ng_nbte", "ng_itf"), "D104": body_ids("ng_nbte", "ng_fmacce"), "D105": body_ids("ng_nbte", "ng_fmacce", "ng_fadan"),
    "D106": body_ids("ng_fadan", "ng_fashion_council", "ng_nbte"), "D107": body_ids("ng_nbte", "ng_itf"), "D108": body_ids("ng_nbte", "ng_itf", "ng_cippon", "ng_sppn"),
    "D109": body_ids("ng_coren", "ng_nbte", "ng_rmrdc"), "D110": body_ids("ng_coren", "ng_nsche", "ng_rmrdc"), "D111": body_ids("ng_fadan", "ng_fashion_council", "ng_nbte"),
    "D112": body_ids("ng_nbte", "ng_rmrdc"), "D113": body_ids("ng_coren", "ng_nbte", "ng_rmrdc", "ng_bumpan"), "D114": body_ids("ng_nbte", "ng_itf"),
    "D115": body_ids("ng_nitt", "ng_nbte", "ng_itf"), "D116": body_ids("ng_coren", "ng_nbte"), "D117": body_ids("ng_nitt", "ng_coren"),
    "D118": body_ids("ng_fman", "ng_arcn", "ng_nbte"), "D119": body_ids("ng_nias", "ng_vcn", "ng_fman"), "D120": body_ids("ng_fison", "ng_fman", "ng_nbte"),
    "D121": body_ids("ng_fan", "ng_fman", "ng_nesrea"), "D122": body_ids("ng_mlscn", "ng_nislt"), "D123": body_ids("ng_rrbn", "ng_nnra"),
    "D124": body_ids("ng_chprbn", "ng_health_ministry"), "D125": body_ids("ng_hrrbn", "ng_nbte"), "D126": body_ids("ng_health_ministry", "ng_nnmda", "ng_nafdac", "ng_apctcim"),
    "D127": body_ids("ng_trcn", "ng_ncce", "ng_nerdc"), "D129": body_ids("ng_nscdc", "ng_nis_service"), "D131": body_ids("ng_coren", "ng_nadc"),
    "D132": body_ids("ng_nasrda", "ng_coren"), "D133": body_ids("ng_fmacce", "ng_fadan"), "D134": body_ids("ng_nimasa", "ng_coren"),
    "D166": body_ids("ng_coren", "ng_nadc", "ng_cpn"), "D135": body_ids("ng_nnra", "ng_naec", "ng_coren"), "D136": body_ids("ng_ncaa", "ng_coren"),
    "D137": body_ids("ng_nnra", "ng_mdcn", "ng_coren"), "D138": body_ids("ng_coren", "ng_mlscn"), "D142": body_ids("ng_cpn", "ng_nas", "ng_nimr"),
    "D144": body_ids("ng_nimet", "ng_nihsa", "ng_nesrea"), "D145": body_ids("ng_npa", "ng_nimr", "ng_nas"),
    "D155": body_ids("ng_naseni", "ng_rmrdc", "ng_nas"), "D141": body_ids("ng_cpn", "ng_nitda", "ng_naseni"),
    "D167": body_ids("ng_cpn", "ng_nitda", "ng_fmacce"), "D168": body_ids("ng_fmacce", "ng_efn", "ng_nso", "ng_cpn"),
    "D070": CREATIVE,
}


def normalize_catalog() -> dict:
    """Return the explicit catalog; every mapped ID must resolve directly."""
    return BODY_CATALOG


def classify(ids: list[str]) -> str:
    types = {BODY_CATALOG[i][1] for i in ids if i in BODY_CATALOG}
    if "regulator" in types:
        return "regulator_or_statutory_body"
    if "professional_body" in types or "professional_association" in types:
        return "professional_body_or_association"
    if "sector_skills_body" in types or "education_regulator" in types:
        return "sector_skills_or_education_body"
    if types:
        return "government_or_sector_context"
    return "no_dedicated_body_identified"


def main() -> None:
    normalize_catalog()
    meta = json.loads((ROOT / "domain_meta.json").read_text(encoding="utf-8"))
    thin = json.loads((ROOT / "thin_domain_role_overlays.json").read_text(encoding="utf-8"))
    active = [(domain_id, value["domain_name"]) for domain_id, value in meta.items() if not value.get("excluded")]
    gap_ids = {row["domain_id"] for row in thin.get("gaps", [])}

    domains = []
    for domain_id, domain_name in active:
        ids = [item for item in EXPLICIT.get(domain_id, []) if item in BODY_CATALOG]
        domains.append({
            "domain_id": domain_id,
            "domain_name": domain_name,
            "current_thin_gap": domain_id in gap_ids,
            "nigerian_bodies": [
                {"body_id": item, "name": BODY_CATALOG[item][0], "body_type": BODY_CATALOG[item][1], "url": BODY_CATALOG[item][2]}
                for item in ids
            ],
            "evidence_class": classify(ids),
            "audit_note": (
                "At least one Nigerian regulator, professional body, or sector body identified; role-level evidence still requires source-specific review."
                if ids else
                "No dedicated Nigerian professional or regulatory body was identified in the searched sources; do not invent a local credential."
            ),
        })

    gap_audit = [row for row in domains if row["current_thin_gap"]]
    output = {
        "schema_version": "1.0.0",
        "generated_on": date.today().isoformat(),
        "purpose": "Nigerian professional-body and regulator audit for every active career domain and the current thin-domain gaps.",
        "scope": {
            "active_domain_count": len(domains),
            "thin_gap_count": len(gap_audit),
            "included": ["statutory regulators", "professional councils", "professional associations", "sector skills councils", "education and government bodies with direct sector mandate"],
            "excluded": ["employers", "unverified individuals", "generic global bodies", "job-board listings as professional-body evidence"],
            "interpretation": "A government or sector body is context evidence, not proof of professional licensing. A professional association is not automatically a statutory regulator.",
        },
        "source_log": [
            {"topic": "ICT, AI, cloud, fintech, telecoms, cybersecurity, healthtech and edtech", "url": "https://nipc.gov.ng/sectors/ict"},
            {"topic": "NITDA mandate and ICT standards", "url": "https://nitda.gov.ng/"},
            {"topic": "Health regulatory bodies", "url": "https://health.gov.ng/hospital-services/"},
            {"topic": "Construction regulators and associations", "url": "https://clmis.corbon.gov.ng/sectors"},
            {"topic": "Engineering registration and sectors", "url": "https://coren.gov.ng/engineering-regulatory-and-monitoring/"},
            {"topic": "Agriculture, food, fisheries and animal sectors", "url": "https://agriculture.gov.ng/structure/"},
            {"topic": "Food science regulation", "url": "https://nicfost.gov.ng/about-us/"},
            {"topic": "Transport stakeholders", "url": "https://transportation.gov.ng/stakeholders/"},
            {"topic": "Aviation regulation", "url": "https://www.ncaa.gov.ng/about/about-ncaa"},
            {"topic": "Arts, culture, tourism and creative sectors", "url": "https://www.fmacce.gov.ng/department/entertainment-and-creative-economy-ece"},
            {"topic": "Education and technical/vocational bodies", "url": "https://databank.ned.gov.ng/info/regulatory-agencies"},
            {"topic": "National Skills Qualification trade awarding bodies", "url": "https://web.nbte.gov.ng/sites/default/files/2024-05/NSQF%20IN%20BRIEF.pdf"},
            {"topic": "Psychology", "url": "https://www.npafct.org/"},
            {"topic": "Fashion sector", "url": "https://nigerianfashioncouncil.org/"},
            {"topic": "Artificial intelligence", "url": "https://aaai.org.ng/"},
            {"topic": "Nigeria Computer Society and digital games/AI/robotics/IoT themes", "url": "https://www.ncs.org.ng/"},
            {"topic": "Procurement and supply management", "url": "https://www.cipsmn.org.ng/about"},
            {"topic": "International relations and diplomacy research/training", "url": "https://niia.gov.ng/"},
            {"topic": "Immigration law practice", "url": "https://nila.ng/about-us/"},
            {"topic": "Occupational safety and health practitioners", "url": "https://ossnigeria.org/"},
            {"topic": "Space science and engineering", "url": "https://central.nasrda.gov.ng/departments/institute-of-space-science-engineering/"},
            {"topic": "Esports in Nigeria", "url": "https://esportsfederationofnigeria.com/"},
            {"topic": "Humanitarian and social protection mandate", "url": "https://fmhds.gov.ng/about-fmhds/"},
            {"topic": "Complementary and integrative medicine association evidence", "url": "https://apctcim.org.ng/e-library"},
            {"topic": "Surveying", "url": "https://www.surcon.gov.ng/"},
            {"topic": "Meteorology and climate context", "url": "https://nimet.gov.ng/foi"},
            {"topic": "Radiation and nuclear regulation", "url": "https://nnra.gov.ng/"},
            {"topic": "Emergency management", "url": "https://nema.gov.ng/"},
        ],
        "body_catalog": [
            {"body_id": key, "name": value[0], "body_type": value[1], "url": value[2]}
            for key, value in sorted(BODY_CATALOG.items())
        ],
        "domains": domains,
        "thin_gap_audit": gap_audit,
        "quality_gate": {
            "sql_regeneration_allowed": False,
            "reason": "This audit must be reviewed and role-level local evidence must be resolved before generated seed SQL is regenerated.",
            "next_step": "Attach source-backed Nigerian competencies, roles, skills and credentials only where the cited body supports them; retain an explicit no-body state otherwise.",
        },
    }
    (ROOT / "nigerian_professional_body_audit.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    markdown = [
        "# Nigerian Professional-Body Audit",
        "",
        f"Generated {output['generated_on']}. Active domains audited: {len(domains)}. Thin-domain gaps audited: {len(gap_audit)}.",
        "",
        "This inventory distinguishes statutory regulators, professional bodies/associations, sector skills or education bodies, and government context. A context body is not presented as a licensing authority.",
        "",
        "## Domain Inventory",
        "",
        "| Domain | Thin gap | Nigerian bodies or context bodies | Evidence class |",
        "|---|---:|---|---|",
    ]
    for row in domains:
        names = "; ".join(f"{body['name']} ({body['body_type']})" for body in row["nigerian_bodies"])
        markdown.append(f"| {row['domain_id']} {row['domain_name']} | {'yes' if row['current_thin_gap'] else 'no'} | {names} | {row['evidence_class']} |")
    markdown += ["", "## Current Thin-Domain Gaps", "", "These rows need role-level Nigerian evidence review before generated seed SQL is regenerated.", ""]
    for row in gap_audit:
        names = "; ".join(body["name"] for body in row["nigerian_bodies"])
        markdown.append(f"- **{row['domain_id']} {row['domain_name']}**: {names}.")
    markdown += ["", "## Quality Gate", "", "SQL/seed regeneration is intentionally disabled until this audit and the role-level Nigerian evidence are reviewed.", ""]
    (ROOT / "NIGERIAN_PROFESSIONAL_BODY_AUDIT.md").write_text("\n".join(markdown) + "\n", encoding="utf-8")
    summary = {
        "active_domains": len(domains),
        "thin_gaps": len(gap_audit),
        "domains_with_nigerian_body_or_context": sum(bool(row["nigerian_bodies"]) for row in domains),
        "domains_without_identified_body": sum(not row["nigerian_bodies"] for row in domains),
        "regulator_or_statutory": sum(row["evidence_class"] == "regulator_or_statutory_body" for row in domains),
        "professional_body_or_association": sum(row["evidence_class"] == "professional_body_or_association" for row in domains),
        "sector_or_government_context_only": sum(row["evidence_class"] in {"sector_skills_or_education_body", "government_or_sector_context"} for row in domains),
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
